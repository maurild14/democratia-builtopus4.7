'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeoZone { id: string; name: string; level: string; parent_id: string | null; }

interface Props {
  value: string;
  onChange: (id: string, name: string) => void;
}

interface SelectionState {
  country: GeoZone | null;
  province: GeoZone | null;
  city: GeoZone | null;
  neighborhood: GeoZone | null;
}

export function GeoSelector({ value, onChange }: Props) {
  const [countries, setCountries] = useState<GeoZone[]>([]);
  const [provinces, setProvinces] = useState<GeoZone[]>([]);
  const [cities, setCities] = useState<GeoZone[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<GeoZone[]>([]);
  const [selection, setSelection] = useState<SelectionState>({ country: null, province: null, city: null, neighborhood: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchZones('country').then(setCountries);
  }, []);

  async function fetchZones(level: string, parentId?: string): Promise<GeoZone[]> {
    setLoading(true);
    const url = parentId
      ? `/api/geo/zones?level=${level}&parentId=${parentId}`
      : `/api/geo/zones?level=${level}`;
    const res = await fetch(url);
    const data = await res.json() as { zones: GeoZone[] };
    setLoading(false);
    return data.zones ?? [];
  }

  async function selectCountry(zone: GeoZone) {
    setSelection({ country: zone, province: null, city: null, neighborhood: null });
    setProvinces([]); setCities([]); setNeighborhoods([]);
    const provs = await fetchZones('province', zone.id);
    setProvinces(provs);
  }

  async function selectProvince(zone: GeoZone) {
    setSelection((s) => ({ ...s, province: zone, city: null, neighborhood: null }));
    setCities([]); setNeighborhoods([]);
    const cs = await fetchZones('city', zone.id);
    setCities(cs);
  }

  async function selectCity(zone: GeoZone) {
    setSelection((s) => ({ ...s, city: zone, neighborhood: null }));
    setNeighborhoods([]);
    const ns = await fetchZones('neighborhood', zone.id);
    setNeighborhoods(ns);
  }

  async function selectNeighborhood(zone: GeoZone) {
    setSelection((s) => ({ ...s, neighborhood: zone }));
    onChange(zone.id, zone.name);
  }

  return (
    <div className="space-y-2">
      <GeoDropdown
        label="Country"
        options={countries}
        selected={selection.country}
        onSelect={selectCountry}
        disabled={loading && !countries.length}
      />
      {selection.country && (
        <GeoDropdown
          label="Province / State"
          options={provinces}
          selected={selection.province}
          onSelect={selectProvince}
          disabled={loading && !provinces.length}
        />
      )}
      {selection.province && (
        <GeoDropdown
          label="City"
          options={cities}
          selected={selection.city}
          onSelect={selectCity}
          disabled={loading && !cities.length}
        />
      )}
      {selection.city && (
        <GeoDropdown
          label="Neighborhood"
          options={neighborhoods}
          selected={selection.neighborhood}
          onSelect={selectNeighborhood}
          disabled={loading && !neighborhoods.length}
        />
      )}
      {loading && <p className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Loading options…</p>}
    </div>
  );
}

function GeoDropdown({ label, options, selected, onSelect, disabled }: {
  label: string;
  options: GeoZone[];
  selected: GeoZone | null;
  onSelect: (z: GeoZone) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className={cn(
          'flex h-10 w-full items-center justify-between border border-input bg-background px-3 py-2 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          selected ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        <span>{selected ? selected.name : `Select ${label}`}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>

      {open && options.length > 0 && (
        <div className="absolute z-50 w-full mt-1 border border-border bg-background shadow-md max-h-60 overflow-auto" role="listbox" aria-label={label}>
          {options.map((zone) => (
            <button
              key={zone.id}
              role="option"
              aria-selected={selected?.id === zone.id}
              onClick={() => { onSelect(zone); setOpen(false); }}
              className={cn(
                'w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors',
                selected?.id === zone.id && 'bg-accent font-medium'
              )}
            >
              {zone.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
