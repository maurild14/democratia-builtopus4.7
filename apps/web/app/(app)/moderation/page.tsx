import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Shield, Flag, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getUserProfile, createServerSupabase } from '@democratia/auth/server';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ModerationPage() {
  const profile = await getUserProfile();
  if (!profile) redirect('/login');
  if (profile.role !== 'moderator' && profile.role !== 'admin') redirect('/dashboard');

  const supabase = await createServerSupabase();

  const { data: reports } = await supabase
    .from('content_reports')
    .select('id, target_type, target_id, reason, status, created_at, reporter_id')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(50);

  const { data: offTopicItems } = await supabase
    .from('threads')
    .select('id, title, created_at, forum_id')
    .eq('moderation_status', 'offtopic')
    .order('created_at', { ascending: false })
    .limit(20);

  const pendingCount = reports?.length ?? 0;
  const offTopicCount = offTopicItems?.length ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Moderation Panel</h1>
        </div>
        <p className="text-sm text-muted-foreground">Review user reports and manage content quality.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="card-editorial p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Pending Reports</p>
          <p className="font-display text-4xl">{pendingCount}</p>
        </Card>
        <Card className="card-editorial p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Off-topic Items</p>
          <p className="font-display text-4xl">{offTopicCount}</p>
        </Card>
        <Card className="card-editorial p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Your role</p>
          <Badge variant={profile.role === 'admin' ? 'inverted' : 'default'} className="mt-1">{profile.role}</Badge>
        </Card>
      </div>

      {/* Pending reports */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Flag className="h-5 w-5" />
          Pending Reports
        </h2>

        {reports && reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report) => (
              <Card key={report.id} className="card-editorial p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{report.target_type}</Badge>
                      <Badge variant="secondary">{report.reason}</Badge>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(report.created_at)}</span>
                    </div>
                    <p className="text-sm font-medium">Target ID: <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded-sm">{report.target_id}</code></p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                      <XCircle className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center border border-dashed border-border">
            <CheckCircle className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No pending reports. All clear.</p>
          </div>
        )}
      </section>

      {/* Off-topic items */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          AI-flagged Off-topic Content
        </h2>

        {offTopicItems && offTopicItems.length > 0 ? (
          <div className="space-y-3">
            {offTopicItems.map((item) => (
              <Card key={item.id} className="card-editorial p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="secondary" className="mb-1.5">off-topic</Badge>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(item.created_at)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/thread/${item.id}`}>Review</Link>
                    </Button>
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Restore
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center border border-dashed border-border">
            <CheckCircle className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No AI-flagged content.</p>
          </div>
        )}
      </section>
    </div>
  );
}
