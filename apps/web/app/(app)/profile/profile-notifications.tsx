'use client';

import { useState } from 'react';
import { createClientSupabase } from '@democratia/auth/client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface NotifPrefs {
  reply_to_thread: boolean;
  reply_to_comment: boolean;
  content_offtopic: boolean;
  thread_entered_deliberation: boolean;
  radar_primary: boolean;
  radar_secondary: boolean;
  report_generated: boolean;
  periodic_report: boolean;
  statement_approved: boolean;
}

interface Props {
  prefs: NotifPrefs | null;
  userId: string;
}

const NOTIF_FIELDS: { key: keyof NotifPrefs; label: string; description: string; mandatory?: boolean }[] = [
  { key: 'reply_to_thread', label: 'Replies to my threads', description: 'When someone replies to a thread you started.' },
  { key: 'reply_to_comment', label: 'Replies to my comments', description: 'When someone replies to your comment.' },
  { key: 'content_offtopic', label: 'Content flagged off-topic', description: 'When your content is flagged. Required.', mandatory: true },
  { key: 'thread_entered_deliberation', label: 'Thread entered deliberation', description: 'When a thread you follow reaches the pipeline.' },
  { key: 'radar_primary', label: 'Radar — primary neighborhood', description: 'New legislative items in your main forum.' },
  { key: 'radar_secondary', label: 'Radar — secondary neighborhoods', description: 'New legislative items in your secondary forums.' },
  { key: 'report_generated', label: 'Report published in my forum', description: 'When a deliberative report is published.' },
  { key: 'periodic_report', label: 'Periodic reports available', description: 'Weekly forum summary reports.' },
  { key: 'statement_approved', label: 'My proposed statement approved', description: 'When a statement you proposed is accepted.' },
];

export function ProfileNotificationsSection({ prefs, userId }: Props) {
  const defaults: NotifPrefs = {
    reply_to_thread: true, reply_to_comment: true, content_offtopic: true,
    thread_entered_deliberation: true, radar_primary: true, radar_secondary: false,
    report_generated: true, periodic_report: true, statement_approved: true,
  };

  const [values, setValues] = useState<NotifPrefs>(prefs ?? defaults);

  async function toggle(key: keyof NotifPrefs, val: boolean) {
    const next = { ...values, [key]: val };
    setValues(next);
    const supabase = createClientSupabase();
    await supabase.from('user_notification_prefs').upsert({ user_id: userId, ...next });
  }

  return (
    <section aria-labelledby="notif-heading">
      <h2 id="notif-heading" className="text-lg font-semibold mb-4">Notifications</h2>
      <div className="space-y-4">
        {NOTIF_FIELDS.map(({ key, label, description, mandatory }) => (
          <div key={key} className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor={`notif-${key}`} className="font-medium cursor-pointer">{label}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
            <Switch
              id={`notif-${key}`}
              checked={values[key]}
              onCheckedChange={(val) => !mandatory && toggle(key, val)}
              disabled={mandatory}
              aria-label={label}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
