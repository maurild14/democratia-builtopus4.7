import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@democratia/auth/server';
import { K_ANONYMITY_MIN } from '@democratia/config';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const forumId = searchParams.get('forumId');
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  const supabase = await createServerSupabase();
  let query = supabase
    .from('reports')
    .select('id, title, report_type, executive_summary, created_at, forum_id')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (forumId) query = query.eq('forum_id', forumId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data,
    meta: { page, limit, k_anonymity: K_ANONYMITY_MIN },
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  });
}
