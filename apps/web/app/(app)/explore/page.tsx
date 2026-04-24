'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Globe, ChevronRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { createClientSupabase } from '@democratia/auth/client';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  level: string;
  country_code: string;
  hierarchy: string;
  forumId: string;
}

interface PilotCity {
  name: string;
  country: string;
  forumId: string | null;
}

const PILOT_CITY_SLUGS = [
  { slug: 'buenos-aires-caba', name: 'Buenos Aires (CABA)', country: 'Argentina' },
  { slug: 'san-francisco',     name: 'San Francisco',       country: 'United States' },
];

export default function ExplorePage() {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [query, setQuery]               = useState('');
  const [results, setResults]           = useState<SearchResult[]>([]);
  const [loading, setLoading]           = useState(false);
  const [isOpen, setIsOpen]             = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [pilotCities, setPilotCities]   = useState<PilotCity[]>(
    PILOT_CITY_SLUGS.map((c) => ({ ...c, forumId: null }))
  );

  // Single-char queries return many results — give a bit more time before firing.
  // Longer queries are more specific so respond faster.
  const debouncedQuery = useDebounce(query, query.length <= 1 ? 300 : 150);

  // Load real forum IDs for pilot city quick links
  useEffect(() => {
    async function loadPilotCityForums() {
      const supabase = createClientSupabase();
      const { data } = await supabase
        .from('geo_zones')
        .select('slug, forums(id)')
        .in('slug', PILOT_CITY_SLUGS.map((c) => c.slug));

      if (!data) return;
      setPilotCities(
        PILOT_CITY_SLUGS.map((city) => {
          const row = data.find((r) => r.slug === city.slug);
          const forums = row?.forums;
          const forumId = Array.isArray(forums)
            ? forums[0]?.id
            : (forums as { id: string } | null | undefined)?.id;
          return { ...city, forumId: forumId ?? null };
        })
      );
    }
    void loadPilotCityForums();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/geo/search?q=${encodeURIComponent(q)}`);
    const data = await res.json() as { results: SearchResult[] };
    const next = data.results ?? [];
    setResults(next);
    setSelectedIndex(-1);
    setIsOpen(next.length > 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    void search(debouncedQuery);
  }, [debouncedQuery, search]);

  function navigate(result: SearchResult) {
    router.push(`/forum/${result.forumId}`);
    setIsOpen(false);
    setQuery('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen && results.length) { setIsOpen(true); return; }
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        navigate(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  }

  // Split "Belgrano · CABA · Argentina" → name="Belgrano", path="CABA · Argentina"
  function splitHierarchy(result: SearchResult) {
    const parts = result.hierarchy.split(' · ');
    const ancestors = parts.slice(1).join(' · ');
    return ancestors;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Forum Explorer</h1>
        <p className="text-muted-foreground text-sm">
          Search any community worldwide or browse by geography.
        </p>
      </div>

      {/* Global activity map placeholder */}
      <div
        className="w-full h-48 sm:h-64 mb-8 border border-border bg-dot-pattern flex items-center justify-center relative overflow-hidden"
        aria-label="Global activity map"
        role="img"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 pointer-events-none" />
        <div className="relative z-10 text-center">
          <Globe className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Global activity map — coming with geo data
          </p>
        </div>
        {MOCK_DOTS.map((dot, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-foreground opacity-60 animate-pulse"
            style={{ left: `${dot.x}%`, top: `${dot.y}%`, animationDelay: `${i * 0.3}s` }}
            aria-hidden
          />
        ))}
      </div>

      {/* Search combobox */}
      <div className="relative mb-8" ref={wrapperRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder="Search neighborhoods, cities, provinces, countries..."
            className={cn(
              'pl-10 pr-10 h-12 text-base transition-colors',
              'focus-visible:ring-0 focus-visible:border-foreground',
              isOpen && 'border-foreground'
            )}
            aria-label="Search forums"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="geo-search-listbox"
            aria-activedescendant={
              isOpen && selectedIndex >= 0 ? results[selectedIndex]?.id : undefined
            }
            role="combobox"
            autoFocus
            autoComplete="off"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            id="geo-search-listbox"
            role="listbox"
            aria-label="Search results"
            className="absolute top-full left-0 right-0 z-50 border border-t-0 border-foreground bg-background max-h-80 overflow-y-auto"
          >
            {results.length > 0
              ? results.map((result, i) => {
                  const ancestorPath = splitHierarchy(result);
                  return (
                    <div
                      key={result.id}
                      id={result.id}
                      role="option"
                      aria-selected={i === selectedIndex}
                      onClick={() => navigate(result)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 cursor-pointer',
                        'border-b border-border last:border-b-0',
                        'transition-colors duration-100',
                        i === selectedIndex ? 'bg-accent' : 'hover:bg-accent/60'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {result.name}
                        </p>
                        {ancestorPath && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {ancestorPath}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className="ml-3 shrink-0 text-[10px] uppercase tracking-widest"
                      >
                        {result.level}
                      </Badge>
                    </div>
                  );
                })
              : !loading && query.trim() && (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No results for &ldquo;{query}&rdquo;
                  </div>
                )}
          </div>
        )}
      </div>

      {/* Pilot city quick links — shown when no active search */}
      {!query && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Browse by Geography</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {pilotCities.map((city) => (
              <button
                key={city.name}
                onClick={() => city.forumId && router.push(`/forum/${city.forumId}`)}
                disabled={!city.forumId}
                className="group text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Card className="card-editorial p-5 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{city.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {city.country} · Pilot city
                      </p>
                    </div>
                    {city.forumId ? (
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    ) : (
                      <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                    )}
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const MOCK_DOTS = [
  { x: 20, y: 30 }, { x: 45, y: 45 }, { x: 70, y: 25 },
  { x: 30, y: 65 }, { x: 60, y: 55 }, { x: 80, y: 70 },
  { x: 15, y: 50 }, { x: 55, y: 20 }, { x: 85, y: 40 },
];
