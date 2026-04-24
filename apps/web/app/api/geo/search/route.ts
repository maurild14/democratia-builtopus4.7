import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@democratia/auth/server';

type AncestorRow = { id: string; name: string; parent_id: string | null };

export async function GET(request: NextRequest) {
  const q = new URL(request.url).searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ results: [] });

  const supabase = await createServerSupabase();

  // Use ILIKE for substring/prefix matching — works from the first character.
  // textSearch (full-text) only matches complete lexemes and misses partial words like "puer" → "Puerto".
  // The geo_zones_name_trgm GIN index (migration 002) makes ILIKE fast via pg_trgm.
  const { data: zones } = await supabase
    .from('geo_zones')
    .select('id, name, slug, level, country_code, parent_id, forums(id)')
    .ilike('name', `%${q}%`)
    .order('name')
    .limit(q.length === 1 ? 8 : 10);

  if (!zones?.length) return NextResponse.json({ results: [] });

  // Sort by match quality: exact → starts-with → contains
  const ql = q.toLowerCase();
  zones.sort((a, b) => {
    const al = a.name.toLowerCase();
    const bl = b.name.toLowerCase();
    const ra = al === ql ? 0 : al.startsWith(ql) ? 1 : 2;
    const rb = bl === ql ? 0 : bl.startsWith(ql) ? 1 : 2;
    if (ra !== rb) return ra - rb;
    return al.localeCompare(bl);
  });

  // Build a full ancestor map with up to 3 batched queries (one per tree level).
  // Each query fetches ALL needed parents at once, so it's max 4 total DB calls.
  const ancestorMap = new Map<string, AncestorRow>();

  async function fetchLevel(ids: string[]): Promise<void> {
    if (!ids.length) return;
    const { data } = await supabase
      .from('geo_zones')
      .select('id, name, parent_id')
      .in('id', ids);
    (data ?? []).forEach((z) => ancestorMap.set(z.id, z));
  }

  const level1Ids = [
    ...new Set(zones.filter((z) => z.parent_id).map((z) => z.parent_id as string)),
  ];
  await fetchLevel(level1Ids);

  const level2Ids = [
    ...new Set(
      level1Ids
        .map((id) => ancestorMap.get(id)?.parent_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  await fetchLevel(level2Ids);

  const level3Ids = [
    ...new Set(
      level2Ids
        .map((id) => ancestorMap.get(id)?.parent_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  await fetchLevel(level3Ids);

  const results = zones.map((zone) => {
    // Walk up the parent chain to build the full path: ["Belgrano", "CABA", "Argentina"]
    const path: string[] = [zone.name];
    let parentId = zone.parent_id as string | null;
    while (parentId) {
      const ancestor = ancestorMap.get(parentId);
      if (!ancestor) break;
      path.push(ancestor.name);
      parentId = ancestor.parent_id;
    }

    const forum = Array.isArray(zone.forums) ? zone.forums[0] : zone.forums;
    return {
      id: zone.id,
      name: zone.name,
      slug: zone.slug,
      level: zone.level,
      country_code: zone.country_code,
      hierarchy: path.join(' · '), // e.g. "Belgrano · Ciudad Autónoma de Buenos Aires · Argentina"
      forumId: (forum as { id: string } | null)?.id ?? zone.id,
    };
  });

  return NextResponse.json({ results });
}
