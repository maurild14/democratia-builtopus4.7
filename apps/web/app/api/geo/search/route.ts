import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@democratia/auth/server';

export async function GET(request: NextRequest) {
  const q = new URL(request.url).searchParams.get('q')?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const supabase = await createServerSupabase();

  const { data } = await supabase
    .from('geo_zones')
    .select('id, name, slug, level, country_code, parent_id, forums(id)')
    .textSearch('name', q, { type: 'websearch', config: 'unaccent_config' })
    .limit(10);

  const results = (data ?? []).map((zone) => {
    const forum = Array.isArray(zone.forums) ? zone.forums[0] : zone.forums;
    return {
      id: zone.id,
      name: zone.name,
      slug: zone.slug,
      level: zone.level,
      country_code: zone.country_code,
      hierarchy: buildHierarchy(zone),
      forumId: forum?.id ?? zone.id,
    };
  });

  return NextResponse.json({ results });
}

function buildHierarchy(zone: { name: string; level: string; country_code: string }): string {
  const parts = [zone.name];
  if (zone.level === 'neighborhood') parts.push('neighborhood');
  parts.push(zone.country_code);
  return parts.join(' · ');
}
