'use client';

import { MapPin, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PRIMARY_ZONE_CHANGE_COOLDOWN_DAYS } from '@democratia/config';

interface Zone { id: string; name: string; level: string; }
interface SecondaryZone { id: string; slot: number; weight: number; zone: { name: string; level: string } | null; }

interface Props {
  primaryZone: Zone | null;
  secondaryZones: SecondaryZone[];
  zoneChangedAt: string | null;
}

export function ProfileLocationSection({ primaryZone, secondaryZones, zoneChangedAt }: Props) {
  const canChange = !zoneChangedAt || (
    (Date.now() - new Date(zoneChangedAt).getTime()) / 86400000 > PRIMARY_ZONE_CHANGE_COOLDOWN_DAYS
  );

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
              <button className="text-muted-foreground hover:text-foreground p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" aria-label={`Remove ${sz.zone.name}`}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {secondaryZones.length < 2 && (
          <Button size="sm" variant="outline">
            <Plus className="h-3.5 w-3.5" />
            Add secondary neighborhood
          </Button>
        )}
        <p className="text-xs text-muted-foreground mt-2">Up to 2 secondary neighborhoods. Slot 1: 0.75×, Slot 2: 0.50× weight.</p>
      </div>
    </section>
  );
}
