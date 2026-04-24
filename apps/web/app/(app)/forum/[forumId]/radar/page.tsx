import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Radio, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { createServerSupabase, getUserProfile } from '@democratia/auth/server';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';
import { RadarItemCard } from './radar-item-card';
import type { RadarItemType } from '@democratia/db';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ forumId: string }> }

export default async function RadarPage({ params }: Props) {
  const { forumId } = await params;
  const supabase = await createServerSupabase();
  const profile = await getUserProfile();

  const { data: forumRaw } = await supabase
    .from('forums')
    .select('id, geo_zone_id')
    .eq('id', forumId)
    .single();

  if (!forumRaw) notFound();
  const forum = forumRaw as unknown as { id: string; geo_zone_id: string };

  const { data: zoneRaw } = await supabase
    .from('geo_zones')
    .select('name, level')
    .eq('id', forum.geo_zone_id)
    .single();
  const zone = zoneRaw ?? { name: '', level: '' };

  const { data: items } = await supabase
    .from('radar_items')
    .select('*')
    .eq('forum_id', forumId)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-border">
        <nav className="text-sm text-muted-foreground mb-3" aria-label="Breadcrumb">
          <Link href={`/forum/${forumId}`} className="hover:text-foreground">{zone.name}</Link>
          {' / '}
          <span className="text-foreground">Civic Radar</span>
        </nav>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Civic Radar</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Legislative actions and public data for {zone.name}, simplified by AI for informed citizen debate.
            </p>
          </div>
          <Badge variant="inverted" className="whitespace-nowrap">Live feed</Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main feed */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Legislative Updates</h2>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-1.5">
              {(['All', 'Law', 'Decree', 'Budget', 'Report'] as const).map((filter) => (
                <button
                  key={filter}
                  className="px-3 py-1 text-xs border border-border rounded-full hover:border-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {items && items.length > 0 ? items.map((item) => (
              <RadarItemCard
                key={item.id}
                item={item}
                forumId={forumId}
                isAuthenticated={!!profile}
              />
            )) : (
              <div className="py-16 text-center">
                <Radio className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">No radar items yet for this forum.</p>
                <p className="text-xs text-muted-foreground mt-1">Data is ingested every 6 hours.</p>
              </div>
            )}
          </div>
        </div>

        {/* Transparency sidebar */}
        <div className="space-y-4">
          <h2 className="font-semibold">Transparency</h2>

          <Card className="card-editorial p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Annual Budget Execution</p>
            <p className="font-display text-5xl mb-1">64%</p>
            <p className="text-xs text-muted-foreground mb-4">of allocated funds used — Q3 Target</p>
            <div className="w-full bg-muted h-2">
              <div className="bg-foreground h-2 transition-all" style={{ width: '64%' }} />
            </div>
          </Card>

          <Card className="card-editorial p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Pending legislation</p>
            <p className="font-display text-5xl mb-1">12</p>
            <p className="text-xs text-muted-foreground">bills in committee</p>
          </Card>

          <Card className="card-editorial p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Open Debates</p>
            <p className="font-display text-5xl mb-1">{items?.filter((i) => i.is_debate_open).length ?? 0}</p>
            <p className="text-xs text-muted-foreground">active forum threads</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
