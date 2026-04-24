import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabase } from '@democratia/auth/server';
import { generateRadarSummary } from '@democratia/llm';

// Vercel Cron: every 6 hours
export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '');
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: implement CABA and SF scrapers in packages/geo/sources
  // For now, return a placeholder response
  return NextResponse.json({ message: 'Radar ingestion triggered', timestamp: new Date().toISOString() });
}

export async function POST(request: NextRequest) {
  const user = await import('@democratia/auth').then((m) => m.getUser());
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { forumId, title, itemType, originalText, sourceUrl, sourceName, publishedAt } = await request.json() as {
    forumId: string; title: string; itemType: string;
    originalText?: string; sourceUrl?: string; sourceName?: string; publishedAt?: string;
  };

  const supabase = await createServiceSupabase();

  // Check if item already exists (dedup by title + forumId)
  const { data: existing } = await supabase.from('radar_items').select('id').eq('forum_id', forumId).eq('title', title).single();
  if (existing) return NextResponse.json({ id: existing.id, skipped: true });

  // Generate AI summary
  const aiSummary = originalText
    ? await generateRadarSummary({ title, itemType, originalText, jurisdiction: forumId })
    : null;

  const { data, error } = await supabase.from('radar_items').insert({
    forum_id: forumId,
    item_type: itemType as 'law' | 'decree' | 'budget' | 'report' | 'resolution' | 'other',
    title,
    source_url: sourceUrl,
    source_name: sourceName,
    original_text: originalText,
    ai_summary: aiSummary,
    published_at: publishedAt,
  }).select('id').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
