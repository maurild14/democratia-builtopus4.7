'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Globe, ChevronRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [pilotCities, setPilotCities] = useState<PilotCity[]>(
    PILOT_CITY_SLUGS.map((c) => ({ ...c, forumId: null }))
  );
  const debouncedQuery = useDebounce(query, 300);

  // Resolve real forum IDs for the pilot city quick links
  useEffect(() => {
    async function loadPilotCityForums() {
      const supabase = createClientSupabase();
      const slugs = PILOT_CITY_SLUGS.map((c) => c.slug);

      const { data } = await supabase
        .from('geo_zones')
        .select('slug, forums(id)')
        .in('slug', slugs);

      if (!data) return;

      setPilotCities(
        PILOT_CITY_SLUGS.map((city) => {
          const row = data.find((r) => r.slug === city.slug);
          const forums = row?.forums;
          const forumId = Array.isArray(forums) ? forums[0]?.id : (forums as { id: string } | null)?.id;
          return { ...city, forumId: forumId ?? null };
        })
      );
    }

    void loadPilotCityForums();
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    const res = await fetch(`/api/geo/search?q=${encodeURIComponent(q)}`);
    const data = await res.json() as { results: SearchResult[] };
    setResults(data.results ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void search(debouncedQuery);
  }, [debouncedQuery, search]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Forum Explorer</h1>
        <p className="text-muted-foreground text-sm">Search any community worldwide or browse by geography.</p>
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
          <p className="text-xs text-muted-foreground">Global activity map — coming with geo data</p>
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

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); void search(e.target.value); }}
          placeholder="Search neighborhoods, cities, provinces..."
          className="pl-9 pr-4 h-12 text-base"
          aria-label="Search forums"
          autoFocus
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <div className="space-y-2 mb-8">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => router.push(`/forum/${result.forumId}`)}
              className="w-full text-left group"
            >
              <Card className="card-editorial p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium">{result.name}</span>
                      <Badge variant="secondary">{result.level}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{result.hierarchy}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}

      {query && !loading && results.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No forums found for &ldquo;{query}&rdquo;</p>
      )}

      {/* Pilot city quick links */}
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
                      <p className="text-xs text-muted-foreground mt-0.5">{city.country} · Pilot city</p>
                    </div>
                    {city.forumId
                      ? <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      : <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                    }
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
