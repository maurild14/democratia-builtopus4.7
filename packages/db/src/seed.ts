import { createClient } from '@supabase/supabase-js';
import { fetchCABAZones, fetchSFZones, type GeoZoneInput } from '@democratia/geo';
import type { Database } from './types/database.js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Run: tsx --env-file=.env.local packages/db/src/seed.ts'
  );
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface UpsertArgs {
  p_name: string;
  p_slug: string;
  p_level: string;
  p_parent_id: string | null;
  p_geojson_boundary: object | null;
  p_country_code: string;
}

async function upsertZone(args: UpsertArgs): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: remove after pnpm db:generate adds upsert_geo_zone to generated types
  const { data, error } = await (supabase.rpc as any)('upsert_geo_zone', args);
  if (error) {
    throw new Error(`upsert_geo_zone failed for slug "${args.p_slug}": ${error.message}`);
  }
  return data as string;
}

async function ensureForum(zoneId: string): Promise<void> {
  const { error } = await supabase
    .from('forums')
    .upsert({ geo_zone_id: zoneId }, { onConflict: 'geo_zone_id', ignoreDuplicates: true });
  if (error) {
    throw new Error(`Forum upsert failed for zone ${zoneId}: ${error.message}`);
  }
}

async function insertZoneWithForum(
  zone: Omit<UpsertArgs, 'p_geojson_boundary'> & { p_geojson_boundary: object | null },
  label: string
): Promise<string> {
  const id = await upsertZone(zone);
  await ensureForum(id);
  console.log(`  ${label}: ${id}`);
  return id;
}

async function insertNeighborhoods(
  zones: GeoZoneInput[],
  parentId: string,
  city: string
): Promise<void> {
  console.log(`\nInserting ${zones.length} ${city} neighborhoods...`);
  for (const zone of zones) {
    await insertZoneWithForum(
      {
        p_name: zone.name,
        p_slug: zone.slug,
        p_level: zone.level,
        p_parent_id: parentId,
        p_geojson_boundary: zone.geojsonBoundary,
        p_country_code: zone.countryCode,
      },
      zone.name
    );
  }
}

async function seed(): Promise<void> {
  console.log('Seeding geo_zones and forums...\n');

  // ── CABA ─────────────────────────────────────────────────────────────────
  console.log('CABA hierarchy:');

  const argentinaId = await insertZoneWithForum(
    {
      p_name: 'Argentina',
      p_slug: 'argentina',
      p_level: 'country',
      p_parent_id: null,
      p_geojson_boundary: null,
      p_country_code: 'AR',
    },
    'Argentina'
  );

  const cabaId = await insertZoneWithForum(
    {
      p_name: 'Ciudad Autónoma de Buenos Aires',
      p_slug: 'buenos-aires-caba',
      p_level: 'city',
      p_parent_id: argentinaId,
      p_geojson_boundary: null,
      p_country_code: 'AR',
    },
    'CABA (city)'
  );

  console.log('\nFetching CABA GeoJSON...');
  const cabaNeighborhoods = await fetchCABAZones();
  await insertNeighborhoods(cabaNeighborhoods, cabaId, 'CABA');

  // ── San Francisco ─────────────────────────────────────────────────────────
  console.log('\n\nSan Francisco hierarchy:');

  const usaId = await insertZoneWithForum(
    {
      p_name: 'United States',
      p_slug: 'usa',
      p_level: 'country',
      p_parent_id: null,
      p_geojson_boundary: null,
      p_country_code: 'US',
    },
    'United States'
  );

  const californiaId = await insertZoneWithForum(
    {
      p_name: 'California',
      p_slug: 'california',
      p_level: 'province',
      p_parent_id: usaId,
      p_geojson_boundary: null,
      p_country_code: 'US',
    },
    'California'
  );

  const sfId = await insertZoneWithForum(
    {
      p_name: 'San Francisco',
      p_slug: 'san-francisco',
      p_level: 'city',
      p_parent_id: californiaId,
      p_geojson_boundary: null,
      p_country_code: 'US',
    },
    'San Francisco (city)'
  );

  console.log('\nFetching SF GeoJSON...');
  const sfNeighborhoods = await fetchSFZones();
  await insertNeighborhoods(sfNeighborhoods, sfId, 'SF');

  const total = 2 + 1 + 2 + cabaNeighborhoods.length + sfNeighborhoods.length;
  console.log(`\nSeed complete. ${total} zones and ${total} forums created/updated.`);
}

seed().catch((err: unknown) => {
  console.error('\nSeed failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
