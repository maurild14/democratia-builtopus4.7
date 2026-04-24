import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Users, MessageSquare, Radio, FileText, Flame, Clock, TrendingUp, ChevronDown } from 'lucide-react';
import { createServerSupabase, getUserProfile } from '@democratia/auth/server';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { VoteBar } from '@/components/vote-bar';
import { PipelineProgress } from '@/components/pipeline-progress';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import type { DeliberationStage } from '@democratia/db';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ forumId: string }> }

type ForumRow = { id: string; member_count: number; thread_count: number; geo_zone_id: string };

export default async function ForumPage({ params }: Props) {
  const { forumId } = await params;
  const supabase = await createServerSupabase();
  const profile = await getUserProfile();

  const { data: forumRaw } = await supabase
    .from('forums')
    .select('id, member_count, thread_count, geo_zone_id')
    .eq('id', forumId)
    .single();

  if (!forumRaw) notFound();
  const forum = forumRaw as unknown as ForumRow;

  const { data: zone } = await supabase
    .from('geo_zones')
    .select('id, name, slug, level')
    .eq('id', forum.geo_zone_id)
    .single();

  const { data: threadRows } = await supabase
    .from('threads')
    .select('id, title, body, vote_agree, vote_disagree, vote_pass, comment_count, created_at, is_deliberation, deliberation_stage, author_id')
    .eq('forum_id', forumId)
    .neq('moderation_status', 'removed')
    .order('hot_score', { ascending: false })
    .limit(20);

  const threadList = (threadRows ?? []) as Thread[];
  const authorIds = [...new Set(threadList.map((t) => t.author_id).filter((id): id is string => !!id))];
  const pseudonymMap: Record<string, string> = {};
  if (authorIds.length) {
    const { data: profilesRaw } = await supabase
      .from('user_profiles')
      .select('id, pseudonym')
      .in('id', authorIds);
    const profiles = (profilesRaw as unknown as { id: string; pseudonym: string }[] | null) ?? [];
    for (const p of profiles) pseudonymMap[p.id] = p.pseudonym;
  }

  const { data: radarItems } = await supabase
    .from('radar_items')
    .select('id, title, item_type, ai_summary, created_at')
    .eq('forum_id', forumId)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: reports } = await supabase
    .from('reports')
    .select('id, title, type, created_at')
    .eq('forum_id', forumId)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Forum header */}
      <div className="mb-6 pb-6 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{zone?.level}</Badge>
              <span className="text-xs text-muted-foreground">/{zone?.slug}</span>
            </div>
            <h1 className="text-3xl font-bold">{zone?.name}</h1>
          </div>

          <button className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-sm hover:bg-accent transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Navigate
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{formatNumber(forum.member_count)} members</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" />
            <span>{formatNumber(forum.thread_count)} threads</span>
          </div>
        </div>

        {!profile && (
          <div className="mt-4 p-3 border border-border bg-muted/30 text-sm text-muted-foreground flex items-center justify-between">
            <span>You&apos;re viewing in read-only mode.</span>
            <Link href="/register" className="text-foreground font-medium underline hover:no-underline">Join to participate</Link>
          </div>
        )}
      </div>

      {/* 3 nav blocks */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { href: '#threads', icon: MessageSquare, label: 'Discussion', count: forum.thread_count },
          { href: '#radar', icon: Radio, label: 'Civic Radar', count: radarItems?.length ?? 0 },
          { href: '#reports', icon: FileText, label: 'Reports', count: reports?.length ?? 0 },
        ].map((block) => (
          <a key={block.label} href={block.href} className="group block">
            <Card className="card-editorial p-4 text-center hover:bg-accent/50 transition-colors">
              <block.icon className="h-5 w-5 mx-auto mb-2 text-muted-foreground group-hover:text-foreground transition-colors" />
              <p className="text-sm font-medium">{block.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatNumber(block.count)}</p>
            </Card>
          </a>
        ))}
      </div>

      {/* Threads section */}
      <section id="threads" className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Discussion Threads</h2>
          {profile && (
            <Button size="sm" asChild>
              <Link href={`/forum/${forumId}/threads/new`}>New thread</Link>
            </Button>
          )}
        </div>

        <Tabs defaultValue="hot">
          <TabsList className="mb-4">
            <TabsTrigger value="hot"><Flame className="h-3.5 w-3.5 mr-1.5" />Hot</TabsTrigger>
            <TabsTrigger value="new"><Clock className="h-3.5 w-3.5 mr-1.5" />New</TabsTrigger>
            <TabsTrigger value="top"><TrendingUp className="h-3.5 w-3.5 mr-1.5" />Top</TabsTrigger>
          </TabsList>

          <TabsContent value="hot">
            <ThreadList threads={threadList} pseudonymMap={pseudonymMap} />
          </TabsContent>
          <TabsContent value="new">
            <ThreadList
              threads={[...threadList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())}
              pseudonymMap={pseudonymMap}
            />
          </TabsContent>
          <TabsContent value="top">
            <ThreadList
              threads={[...threadList].sort((a, b) => (b.vote_agree + b.vote_disagree + b.vote_pass) - (a.vote_agree + a.vote_disagree + a.vote_pass))}
              pseudonymMap={pseudonymMap}
            />
          </TabsContent>
        </Tabs>
      </section>

      {/* Radar section */}
      <section id="radar" className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Civic Radar</h2>
          <Link href={`/forum/${forumId}/radar`} className="text-sm text-muted-foreground hover:text-foreground underline">View all</Link>
        </div>
        {radarItems && radarItems.length > 0 ? (
          <div className="space-y-3">
            {radarItems.slice(0, 3).map((item) => (
              <Card key={item.id} className="card-editorial p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="outline" className="text-[10px]">{item.item_type?.toUpperCase()}</Badge>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(item.created_at)}</span>
                    </div>
                    <p className="font-medium text-sm">{item.title}</p>
                    {item.ai_summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.ai_summary}</p>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">No radar items yet for this forum.</p>
        )}
      </section>

      {/* Reports section */}
      <section id="reports">
        <h2 className="text-xl font-bold mb-4">Reports</h2>
        {reports && reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report) => (
              <Link key={report.id} href={`/reports/${report.id}`} className="block group">
                <Card className="card-editorial p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="secondary" className="mb-1.5">{report.type}</Badge>
                      <p className="font-medium text-sm">{report.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(report.created_at)}</p>
                    </div>
                    <FileText className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">No reports published yet.</p>
        )}
      </section>
    </div>
  );
}

interface Thread {
  id: string;
  title: string;
  body: string;
  vote_agree: number;
  vote_disagree: number;
  vote_pass: number;
  comment_count: number;
  created_at: string;
  is_deliberation: boolean;
  deliberation_stage: string | null;
  author_id: string | null;
}

function ThreadList({ threads, pseudonymMap }: { threads: Thread[]; pseudonymMap: Record<string, string> }) {
  if (threads.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No threads yet. Be the first to start a discussion.</p>;
  }

  return (
    <div className="space-y-3">
      {threads.map((thread) => (
        <Link key={thread.id} href={`/thread/${thread.id}`} className="block group">
          <Card className="card-editorial p-5 hover:bg-accent/50 transition-colors">
            {thread.is_deliberation && (
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="inverted">In Deliberation</Badge>
                {thread.deliberation_stage && (
                  <PipelineProgress
                    currentStage={thread.deliberation_stage as DeliberationStage}
                    className="scale-75 origin-left"
                  />
                )}
              </div>
            )}

            <h3 className="font-semibold text-base mb-2 group-hover:underline">{thread.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{thread.body}</p>

            <VoteBar
              agree={thread.vote_agree}
              disagree={thread.vote_disagree}
              pass={thread.vote_pass}
              showButtons={false}
              size="sm"
            />

            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span>by {thread.author_id ? (pseudonymMap[thread.author_id] ?? 'anonymous') : 'anonymous'}</span>
              <span>·</span>
              <span>{thread.comment_count} comments</span>
              <span>·</span>
              <span>{formatRelativeTime(thread.created_at)}</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
