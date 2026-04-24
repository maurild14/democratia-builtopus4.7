import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabase, getUserProfile } from '@democratia/auth/server';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PipelineProgress } from '@/components/pipeline-progress';
import { CommentSection } from './comment-section';
import { formatRelativeTime } from '@/lib/utils';
import type { DeliberationStage } from '@democratia/db';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ threadId: string }> }

type ThreadRow = {
  id: string;
  forum_id: string;
  author_id: string;
  title: string;
  body: string;
  image_urls: string[];
  vote_agree: number;
  vote_disagree: number;
  vote_pass: number;
  comment_count: number;
  is_deliberation: boolean;
  deliberation_stage: string | null;
  edited_at: string | null;
  created_at: string;
};

type CommentRow = {
  id: string;
  author_id: string | null;
  parent_id: string | null;
  depth: number;
  reply_to_pseudonym: string | null;
  body: string;
  vote_agree: number;
  vote_disagree: number;
  vote_pass: number;
  created_at: string;
  pseudonym?: string;
  user_profiles?: { pseudonym: string } | null;
};

export default async function ThreadPage({ params }: Props) {
  const { threadId } = await params;
  const supabase = await createServerSupabase();
  const profile = await getUserProfile();

  const { data: threadRaw } = await supabase
    .from('threads')
    .select('id, forum_id, author_id, title, body, image_urls, vote_agree, vote_disagree, vote_pass, comment_count, is_deliberation, deliberation_stage, edited_at, created_at')
    .eq('id', threadId)
    .neq('moderation_status', 'removed')
    .single();

  if (!threadRaw) notFound();
  const thread = threadRaw as unknown as ThreadRow;

  const { data: forumRaw } = await supabase
    .from('forums')
    .select('id, geo_zone_id')
    .eq('id', thread.forum_id)
    .single();
  const forum = forumRaw as unknown as { id: string; geo_zone_id: string } | null;

  const { data: zone } = forum
    ? await supabase.from('geo_zones').select('name, slug').eq('id', forum.geo_zone_id).single()
    : { data: null };

  const { data: authorProfile } = await supabase
    .from('user_profiles')
    .select('pseudonym')
    .eq('id', thread.author_id)
    .single();

  const { data: commentRows } = await supabase
    .from('comments')
    .select('id, author_id, parent_id, depth, reply_to_pseudonym, body, vote_agree, vote_disagree, vote_pass, created_at')
    .eq('thread_id', threadId)
    .neq('moderation_status', 'removed')
    .order('created_at', { ascending: true })
    .limit(200);

  const commentList = (commentRows ?? []) as CommentRow[];
  const commentAuthorIds = [...new Set(commentList.map((c) => c.author_id).filter((id): id is string => !!id))];
  const commentPseudonymMap: Record<string, string> = {};
  if (commentAuthorIds.length) {
    const { data: cProfiles } = await supabase
      .from('user_profiles')
      .select('id, pseudonym')
      .in('id', commentAuthorIds);
    for (const p of cProfiles ?? []) commentPseudonymMap[p.id] = p.pseudonym;
  }
  const commentsWithPseudonym = commentList.map((c) => ({
    ...c,
    user_profiles: c.author_id
      ? { pseudonym: commentPseudonymMap[c.author_id] ?? 'anonymous' }
      : null,
  }));

  const userCommentVotesMap: Record<string, 'agree' | 'disagree' | 'pass'> = {};
  if (profile && commentList.length) {
    const commentIds = commentList.map((c) => c.id);
    const { data: cvotes } = await supabase
      .from('votes')
      .select('target_id, value')
      .eq('user_id', profile.id)
      .eq('target_type', 'comment')
      .in('target_id', commentIds);
    for (const v of cvotes ?? []) {
      userCommentVotesMap[v.target_id] = v.value as 'agree' | 'disagree' | 'pass';
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {forum && zone && (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link href={`/forum/${forum.id}`} className="hover:text-foreground">{zone.name}</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Thread</span>
        </nav>
      )}

      {thread.is_deliberation && (
        <div className="mb-6 p-4 border border-foreground bg-foreground/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="inverted">In Deliberation</Badge>
              <span className="text-xs text-muted-foreground">This thread has entered the deliberation pipeline.</span>
            </div>
            <Link href={`/thread/${threadId}/deliberation`}>
              <Button size="sm" variant="outline">View pipeline →</Button>
            </Link>
          </div>
          {thread.deliberation_stage && (
            <div className="mt-4">
              <PipelineProgress currentStage={thread.deliberation_stage as DeliberationStage} />
            </div>
          )}
        </div>
      )}

      <article>
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-3">{thread.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>by <strong className="text-foreground">{authorProfile?.pseudonym ?? 'anonymous'}</strong></span>
            <span>·</span>
            <time dateTime={thread.created_at}>{formatRelativeTime(thread.created_at)}</time>
            {thread.edited_at && <span className="italic">(edited)</span>}
          </div>
        </header>

        <div className="prose prose-sm max-w-none mb-6 text-foreground leading-relaxed">
          <p>{thread.body}</p>
        </div>

        {thread.image_urls && thread.image_urls.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-6">
            {thread.image_urls.map((url: string, i: number) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt={`Thread image ${i + 1}`} className="w-full border border-border object-cover aspect-video" />
            ))}
          </div>
        )}

      </article>

      <Separator className="my-8" />

      <section id="comments" aria-label="Comments">
        <h2 className="text-lg font-semibold mb-6">
          {thread.comment_count} {thread.comment_count === 1 ? 'Comment' : 'Comments'}
        </h2>
        <CommentSection
          threadId={threadId}
          initialComments={commentsWithPseudonym}
          profile={profile ? { id: profile.id, pseudonym: profile.pseudonym } : null}
          isLocked={thread.is_deliberation}
          userCommentVotes={userCommentVotesMap}
        />
      </section>
    </div>
  );
}
