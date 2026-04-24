import Link from 'next/link';
import { MapPin, Users, MessageSquare, Globe, ChevronRight, Star, Plus } from 'lucide-react';
import { getUserProfile, createServerSupabase } from '@democratia/auth/server';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type ZoneWithForum = {
  id: string;
  name: string;
  slug: string;
  level: string;
  forums: { id: string; member_count: number; thread_count: number }[] | null;
};

export default async function DashboardPage() {
  const profile = await getUserProfile();
  if (!profile) return null;

  const supabase = await createServerSupabase();

  const primaryZone = profile.primary_zone_id
    ? ((await supabase.from('geo_zones').select('id, name, slug, level, forums(id, member_count, thread_count)').eq('id', profile.primary_zone_id).single()).data as unknown as ZoneWithForum | null)
    : null;

  type SecondaryZoneRow = { id: string; zone_id: string; slot: number };
  type AncestorRow = { ancestor_id: string; depth: number };

  const { data: secondaryZonesRaw } = await supabase
    .from('user_secondary_zones')
    .select('id, zone_id, slot')
    .eq('user_id', profile.id)
    .order('slot');
  const secondaryZonesList = (secondaryZonesRaw as SecondaryZoneRow[] | null) ?? [];

  const secondaryZones: ZoneWithForum[] = [];
  for (const sz of secondaryZonesList) {
    const { data } = await supabase
      .from('geo_zones')
      .select('id, name, slug, level, forums(id, member_count, thread_count)')
      .eq('id', sz.zone_id)
      .single();
    if (data) secondaryZones.push(data as unknown as ZoneWithForum);
  }

  const ancestorZones: ZoneWithForum[] = [];
  if (profile.primary_zone_id) {
    const { data: ancestorRows } = await supabase
      .from('geo_zone_ancestors')
      .select('ancestor_id, depth')
      .eq('zone_id', profile.primary_zone_id)
      .gt('depth', 0)
      .order('depth');
    const ancestorList = (ancestorRows as AncestorRow[] | null) ?? [];

    for (const row of ancestorList) {
      const { data } = await supabase
        .from('geo_zones')
        .select('id, name, slug, level, forums(id, member_count, thread_count)')
        .eq('id', row.ancestor_id)
        .single();
      if (data) ancestorZones.push(data as unknown as ZoneWithForum);
    }
  }

  const greeting = getGreeting();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">{greeting}</p>
        <h1 className="text-3xl font-bold mt-1">{profile.pseudonym}</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {primaryZone && (
          <ForumCard
            zone={primaryZone}
            badge={{ label: 'Primary', variant: 'inverted' }}
            icon={<MapPin className="h-4 w-4" />}
          />
        )}

        {secondaryZones.map((zone) => (
          <ForumCard
            key={zone.id}
            zone={zone}
            badge={{ label: 'Secondary', variant: 'default' }}
            icon={<Star className="h-4 w-4" />}
          />
        ))}

        {ancestorZones.map((zone) => (
          <ForumCard
            key={zone.id}
            zone={zone}
            badge={null}
            icon={<Globe className="h-4 w-4" />}
          />
        ))}

        <Link href="/explore" className="group block">
          <Card className="card-editorial h-full p-6 hover:bg-accent/50 transition-colors flex flex-col items-center justify-center text-center gap-3 min-h-[180px]">
            <div className="flex h-12 w-12 items-center justify-center border border-dashed border-border group-hover:border-foreground transition-colors">
              <Globe className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <div>
              <p className="font-semibold">Forum Explorer</p>
              <p className="text-xs text-muted-foreground mt-0.5">Search any community worldwide</p>
            </div>
          </Card>
        </Link>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/explore">
            <Globe className="h-3.5 w-3.5" />
            Explore forums
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/profile">
            <Plus className="h-3.5 w-3.5" />
            Add secondary neighborhood
          </Link>
        </Button>
      </div>
    </div>
  );
}

interface ForumCardProps {
  zone: ZoneWithForum;
  badge: { label: string; variant: 'default' | 'inverted' | 'secondary' } | null;
  icon: React.ReactNode;
}

function ForumCard({ zone, badge, icon }: ForumCardProps) {
  const forum = Array.isArray(zone.forums) ? zone.forums[0] : zone.forums;
  const forumId = forum?.id ?? zone.id;

  return (
    <Link href={`/forum/${forumId}`} className="group block">
      <Card className="card-editorial h-full p-6 hover:bg-accent/50 transition-colors min-h-[180px] flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {icon}
              <span className="text-xs uppercase tracking-widest font-medium">{zone.level}</span>
            </div>
            {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
          </div>
          <h2 className="font-bold text-lg leading-tight">{zone.name}</h2>
        </div>

        <div className="flex items-center gap-4 mt-4">
          {forum && (
            <>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{formatNumber(forum.member_count)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{formatNumber(forum.thread_count)} threads</span>
              </div>
            </>
          )}
          <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </div>
      </Card>
    </Link>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
