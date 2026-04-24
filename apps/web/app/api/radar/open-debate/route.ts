import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabase, getUser } from '@democratia/auth/server';

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { radarItemId, forumId } = await request.json() as { radarItemId: string; forumId: string };
  const supabase = await createServiceSupabase();

  const { data: item } = await supabase.from('radar_items').select('*').eq('id', radarItemId).single();
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (item.linked_thread_id) return NextResponse.json({ threadId: item.linked_thread_id });

  const { data: profile } = await supabase.from('user_profiles').select('id').eq('id', user.id).single();
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const { data: thread, error } = await supabase.from('threads').insert({
    forum_id: forumId,
    author_id: user.id,
    title: `Debate: ${item.title}`,
    body: item.ai_summary ?? item.title,
    radar_item_id: radarItemId,
  }).select('id').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from('radar_items').update({ is_debate_open: true, linked_thread_id: thread.id }).eq('id', radarItemId);

  return NextResponse.json({ threadId: thread.id });
}
