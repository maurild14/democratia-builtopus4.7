import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@democratia/auth/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level');
  const parentId = searchParams.get('parentId');

  if (!level) return NextResponse.json({ error: 'level required' }, { status: 400 });

  const supabase = await createServerSupabase();
  let query = supabase.from('geo_zones').select('id, name, level, parent_id').eq('level', level).order('name');
  if (parentId) query = query.eq('parent_id', parentId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ zones: data });
}
