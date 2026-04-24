'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { GeoSelector } from '@/components/geo-selector';
import { createClientSupabase } from '@democratia/auth/client';
import { PRIMARY_ZONE_CHANGE_COOLDOWN_DAYS } from '@democratia/config';

interface Zone { id: string; name: string; level: string; }
interface SecondaryZone { id: string; slot: number; weight: number; zone: { name: string; level: string } | null; }

interface Props {
  primaryZone: Zone | null;
  secondaryZones: SecondaryZone[];
  zoneChangedAt: string | null;
  userId: string;
}

export function ProfileLocationSection({ primaryZone, secondaryZones, zoneChangedAt, userId }: Props) {
  const router = useRouter();
  const [primaryOpen, setPrimaryOpen] = useState(false);
  const [secondaryOpen, setSecondaryOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newZoneId, setNewZoneId] = useState('');
  const [secZoneId, setSecZoneId] = useState('');

  const canChange = !zoneChangedAt || (
    (Date.now() - new Date(zoneChangedAt).getTime()) / 86400000 > PRIMARY_ZONE_CHANGE_COOLDOWN_DAYS
  );

  async function handleChangePrimary() {
    if (!newZoneId) return;
    setSaving(true);
    const supabase = createClientSupabase();
    const { error } = await supabase
      .from('user_profiles')
      .update({
        primary_zone_id: newZoneId,
        zone_changed_at: new Date().toISOString(),
      })
      .eq('id', userId);
    setSaving(false);
    if (!error) { setPrimaryOpen(false); router.refresh(); }
  }

  async function handleAddSecondary() {
    if (!secZoneId) return;
    setSaving(true);
    const supabase = createClientSupabase();
    const nextSlot = secondaryZones.length + 1;
    const weight = nextSlot === 1 ? 0.75 : 0.50;
    const { error } = await supabase
      .from('user_secondary_zones')
      .insert({ user_id: userId, zone_id: secZoneId, slot: nextSlot, weight });
    setSaving(false);
    if (!error) { setSecondaryOpen(false); router.refresh(); }
  }

  async function handleRemoveSecondary(szId: string) {
    const supabase = createClientSupabase();
    await supabase.from('user_secondary_zones').delete().eq('id', szId);
    router.refresh();
  }

  return (
    <section aria-labelledby="location-heading">
      <h2 id="location-heading" className="text-lg font-semibold mb-4">Location</h2>

      {/* Primary */}
      <div className="mb-5">
        <p className="text-sm font-medium mb-2">Primary neighborhood</p>
        <div className="flex items-center gap-3">
          {primaryZone ? (
            <div className="flex items-center gap-2 border border-border px-3 py-2 flex-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{primaryZone.name}</span>
              <Badge variant="inverted" className="ml-auto">Primary · 1.0×</Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No primary neighborhood set.</p>
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={!canChange}
            title={!canChange ? `Next change available in ${PRIMARY_ZONE_CHANGE_COOLDOWN_DAYS} days` : undefined}
            onClick={() => { setNewZoneId(''); setPrimaryOpen(true); }}
          >
            Change
          </Button>
        </div>
        {!canChange && (
          <p className="text-xs text-muted-foreground mt-1">
            Primary neighborhood can be changed every {PRIMARY_ZONE_CHANGE_COOLDOWN_DAYS} days.
          </p>
        )}
      </div>

      {/* Secondary zones */}
      <div>
        <p className="text-sm font-medium mb-2">Secondary neighborhoods</p>
        <div className="space-y-2 mb-3">
          {secondaryZones.map((sz) => sz.zone && (
            <div key={sz.id} className="flex items-center gap-2 border border-border px-3 py-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{sz.zone.name}</span>
              <Badge variant="secondary" className="ml-auto">{sz.weight}×</Badge>
              <button
                className="text-muted-foreground hover:text-foreground p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label={`Remove ${sz.zone.name}`}
                onClick={() => handleRemoveSecondary(sz.id)}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {secondaryZones.length < 2 && (
          <Button size="sm" variant="outline" onClick={() => { setSecZoneId(''); setSecondaryOpen(true); }}>
            <Plus className="h-3.5 w-3.5" />
            Add secondary neighborhood
          </Button>
        )}
        <p className="text-xs text-muted-foreground mt-2">Up to 2 secondary neighborhoods. Slot 1: 0.75×, Slot 2: 0.50× weight.</p>
      </div>

      {/* Change primary dialog */}
      <Dialog open={primaryOpen} onOpenChange={setPrimaryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Primary Neighborhood</DialogTitle>
            <DialogDescription>
              Select your new primary neighborhood. You can change it again in {PRIMARY_ZONE_CHANGE_COOLDOWN_DAYS} days.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <GeoSelector value={newZoneId} onChange={(id) => setNewZoneId(id)} />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setPrimaryOpen(false)}>Cancel</Button>
            <Button disabled={!newZoneId || saving} onClick={handleChangePrimary}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add secondary dialog */}
      <Dialog open={secondaryOpen} onOpenChange={setSecondaryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Secondary Neighborhood</DialogTitle>
            <DialogDescription>
              Slot {secondaryZones.length + 1} · {secondaryZones.length === 0 ? '0.75×' : '0.50×'} weight in reports
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <GeoSelector value={secZoneId} onChange={(id) => setSecZoneId(id)} />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setSecondaryOpen(false)}>Cancel</Button>
            <Button disabled={!secZoneId || saving} onClick={handleAddSecondary}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
