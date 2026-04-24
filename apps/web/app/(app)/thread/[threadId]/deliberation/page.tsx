import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabase, getUserProfile } from '@democratia/auth/server';
import { PipelineProgress } from '@/components/pipeline-progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Layer2StatementVoting } from './layer2-voting';
import { Layer3Clusters } from './layer3-clusters';
import { Layer4Synthesis } from './layer4-synthesis';
import { Layer5Proposals } from './layer5-proposals';
import type { DeliberationStage } from '@democratia/db';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ threadId: string }> }

export default async function DeliberationPage({ params }: Props) {
  const { threadId } = await params;
  const supabase = await createServerSupabase();
  const profile = await getUserProfile();

  type ThreadRow = {
    id: string; forum_id: string; title: string; is_deliberation: boolean;
    deliberation_stage: string | null;
  };

  const { data: threadRaw } = await supabase
    .from('threads')
    .select('id, forum_id, title, is_deliberation, deliberation_stage')
    .eq('id', threadId)
    .single();

  if (!threadRaw) notFound();
  const thread = threadRaw as unknown as ThreadRow;
  if (!thread.is_deliberation) notFound();

  const { data: forumRaw } = await supabase
    .from('forums')
    .select('id, geo_zone_id')
    .eq('id', thread.forum_id)
    .single();
  const forum = forumRaw as unknown as { id: string; geo_zone_id: string } | null;

  const { data: zoneRaw } = forum
    ? await supabase.from('geo_zones').select('name').eq('id', forum.geo_zone_id).single()
    : { data: null };
  const zoneName = zoneRaw?.name ?? 'Forum';

  const { data: statements } = await supabase
    .from('statements')
    .select('id, text, source, status, vote_agree, vote_disagree, vote_pass, is_consensus, is_divisive, consensus_score, cluster_id, created_at')
    .eq('thread_id', threadId)
    .eq('status', 'active')
    .order('created_at');

  const { data: resultRaw } = await supabase
    .from('deliberation_results')
    .select('*')
    .eq('thread_id', threadId)
    .single();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = resultRaw as any;

  const { data: userVotes } = profile ? await supabase
    .from('votes')
    .select('target_id, value')
    .eq('user_id', profile.id)
    .eq('target_type', 'statement')
    .in('target_id', (statements ?? []).map((s) => s.id))
    : { data: [] };

  const userVoteMap = Object.fromEntries((userVotes ?? []).map((v) => [v.target_id, v.value]));

  const stage = (thread.deliberation_stage ?? 'layer1') as DeliberationStage;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="text-sm text-muted-foreground mb-3" aria-label="Breadcrumb">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          {' / '}
          <Link href={`/forum/${forum?.id}`} className="hover:text-foreground">{zoneName}</Link>
          {' / '}
          <Link href={`/thread/${threadId}`} className="hover:text-foreground">Thread</Link>
          {' / '}
          <span className="text-foreground">Deliberation</span>
        </nav>

        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="inverted" className="mb-2">In Deliberation</Badge>
            <h1 className="text-2xl font-bold leading-tight">{thread.title}</h1>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto pb-2">
          <PipelineProgress currentStage={stage} />
        </div>
      </div>

      {/* Stage-specific content */}
      {stage === 'layer1' && (
        <Card className="card-editorial p-8 text-center">
          <p className="text-muted-foreground mb-4">This thread is being monitored for elevation criteria. Once it reaches the engagement threshold, statement extraction will begin.</p>
          <p className="text-sm font-medium">Current stage: Free Conversation</p>
        </Card>
      )}

      {stage === 'layer2' && (
        <Layer2StatementVoting
          statements={statements ?? []}
          userVoteMap={userVoteMap}
          threadId={threadId}
          isAuthenticated={!!profile}
        />
      )}

      {stage === 'layer3' && result && (
        <Layer3Clusters result={result} statements={statements ?? []} />
      )}

      {stage === 'layer4' && result && (
        <Layer4Synthesis result={result} />
      )}

      {stage === 'layer5' && result && (
        <Layer5Proposals result={result} threadTitle={thread.title} forumName={zoneName} />
      )}
    </div>
  );
}
