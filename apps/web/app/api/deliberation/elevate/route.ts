import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabase, getUser } from '@democratia/auth/server';
import { extractStatements } from '@democratia/llm';

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { threadId } = await request.json() as { threadId: string };
  if (!threadId) return NextResponse.json({ error: 'threadId required' }, { status: 400 });

  const supabase = await createServiceSupabase();

  // Fetch thread and comments
  const { data: thread } = await supabase.from('threads').select('*, forums(geo_zones(name))').eq('id', threadId).single();
  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

  const { data: comments } = await supabase.from('comments').select('body').eq('thread_id', threadId).neq('moderation_status', 'removed').limit(100);

  // Mark thread as in deliberation
  await supabase.from('threads').update({
    is_deliberation: true,
    deliberation_stage: 'layer2',
    deliberation_started_at: new Date().toISOString(),
  }).eq('id', threadId);

  // Extract statements via Claude
  const forumName = (thread.forums as { geo_zones?: { name: string } } | null)?.geo_zones?.name ?? 'Forum';
  const statements = await extractStatements({
    threadTitle: thread.title,
    threadBody: thread.body,
    comments: (comments ?? []).map((c) => c.body),
    forumTopic: forumName,
  });

  // Insert statements
  await supabase.from('statements').insert(
    statements.map((s) => ({
      thread_id: threadId,
      text: s.text,
      source: 'ai_extracted' as const,
      status: 'active' as const,
    }))
  );

  return NextResponse.json({ success: true, statementsCount: statements.length });
}
