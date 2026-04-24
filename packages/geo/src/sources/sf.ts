import { type GeoZoneInput, toSlug } from './caba.js';

const SF_GEOJSON_URL =
  'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/san-francisco.geojson';

interface RawGeometry {
  type: string;
  coordinates: unknown;
}

interface SFFeature {
  properties: { name: string };
  geometry: RawGeometry;
}

interface GeoJSONCollection<T> {
  features: T[];
}

function titleCase(str: string): string {
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function ensureMultiPolygon(geometry: RawGeometry): object {
  if (geometry.type === 'Polygon') {
    return { type: 'MultiPolygon', coordinates: [geometry.coordinates] };
  }
  return geometry;
}

export async function fetchSFZones(): Promise<GeoZoneInput[]> {
  const response = await fetch(SF_GEOJSON_URL);
  if (!response.ok) {
    throw new Error(`SF GeoJSON fetch failed: ${response.status} ${response.statusText}`);
  }

  const geojson = (await response.json()) as GeoJSONCollection<SFFeature>;

  return geojson.features.map((feature) => {
    const name = titleCase(feature.properties.name);
    return {
      name,
      slug: toSlug(name, 'sf'),
      level: 'neighborhood' as const,
      geojsonBoundary: ensureMultiPolygon(feature.geometry),
      countryCode: 'US',
    };
  });
}
