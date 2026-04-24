import { redirect } from 'next/navigation';
import { getUserProfile, createServerSupabase } from '@democratia/auth/server';
import { Separator } from '@/components/ui/separator';
import { ProfileIdentitySection } from './profile-identity';
import { ProfileLocationSection } from './profile-location';
import { ProfileNotificationsSection } from './profile-notifications';
import { ProfileAccountSection } from './profile-account';

export const dynamic = 'force-dynamic';

type SecondaryZoneRow = { id: string; slot: number; zone_id: string; weight?: number };
type GeoZoneRow = { id: string; name: string; level: string };

export default async function ProfilePage() {
  const profile = await getUserProfile();
  if (!profile) redirect('/login');

  const supabase = await createServerSupabase();

  const { data: secondaryZoneRows } = await supabase
    .from('user_secondary_zones')
    .select('id, slot, zone_id')
    .eq('user_id', profile.id)
    .order('slot');

  const szList = (secondaryZoneRows as SecondaryZoneRow[] | null) ?? [];
  const secondaryZones: { id: string; slot: number; weight: number; zone: { name: string; level: string } }[] = [];
  for (const sz of szList) {
    const { data: gz } = await supabase
      .from('geo_zones')
      .select('id, name, level')
      .eq('id', sz.zone_id)
      .single();
    if (gz) {
      const geoZone = gz as unknown as GeoZoneRow;
      secondaryZones.push({ id: sz.id, slot: sz.slot, weight: 0.75, zone: { name: geoZone.name, level: geoZone.level } });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: notifPrefs } = await (supabase as any)
    .from('user_notification_prefs')
    .select('*')
    .eq('user_id', profile.id)
    .single();

  const { data: primaryZoneRaw } = profile.primary_zone_id
    ? await supabase.from('geo_zones').select('name, level').eq('id', profile.primary_zone_id).single()
    : { data: null };
  const primaryZone = primaryZoneRaw as { name: string; level: string } | null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile &amp; Settings</h1>

      <div className="space-y-10">
        <ProfileIdentitySection
          pseudonym={profile.pseudonym}
          avatarUrl={profile.avatar_url}
          pseudonymChangedAt={profile.pseudonym_changed_at}
        />

        <Separator />

        <ProfileLocationSection
          primaryZone={primaryZone ? { name: primaryZone.name, level: primaryZone.level, id: profile.primary_zone_id! } : null}
          secondaryZones={secondaryZones}
          zoneChangedAt={profile.zone_changed_at}
        />

        <Separator />

        <ProfileNotificationsSection prefs={notifPrefs} userId={profile.id} />

        <Separator />

        <ProfileAccountSection profile={profile} />
      </div>
    </div>
  );
}
