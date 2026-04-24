const CABA_GEOJSON_URL =
  'https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-educacion/barrios/barrios.geojson';

export interface GeoZoneInput {
  name: string;
  slug: string;
  level: 'neighborhood' | 'city' | 'province' | 'country';
  geojsonBoundary: object | null;
  countryCode: string;
}

interface RawGeometry {
  type: string;
  coordinates: unknown;
}

interface CABAFeature {
  properties: { nombre: string; comuna: number };
  geometry: RawGeometry;
}

interface GeoJSONCollection<T> {
  features: T[];
}

// Reusable slug helper — imported by sf.ts too.
export function toSlug(name: string, suffix?: string): string {
  // NFD decomposes accented chars (e.g. "á" → "a" + combining accent).
  // The second replace strips the combining marks (U+0300–U+036F).
  const COMBINING_MARKS = /[̀-ͯ]/g;
  const base = name
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return suffix ? `${base}-${suffix}` : base;
}

function titleCase(str: string): string {
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// The geo_zones.boundary column is GEOMETRY(MultiPolygon, 4326).
// PostGIS rejects plain Polygon inserts, so wrap them.
function ensureMultiPolygon(geometry: RawGeometry): object {
  if (geometry.type === 'Polygon') {
    return { type: 'MultiPolygon', coordinates: [geometry.coordinates] };
  }
  return geometry;
}

export async function fetchCABAZones(): Promise<GeoZoneInput[]> {
  const response = await fetch(CABA_GEOJSON_URL);
  if (!response.ok) {
    throw new Error(`CABA GeoJSON fetch failed: ${response.status} ${response.statusText}`);
  }

  const geojson = (await response.json()) as GeoJSONCollection<CABAFeature>;

  return geojson.features.map((feature) => {
    const name = titleCase(feature.properties.nombre);
    return {
      name,
      slug: toSlug(name, 'caba'),
      level: 'neighborhood' as const,
      geojsonBoundary: ensureMultiPolygon(feature.geometry),
      countryCode: 'AR',
    };
  });
}
