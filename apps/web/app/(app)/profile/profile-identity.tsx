'use client';

import { useState } from 'react';
import { User, Edit2, Loader2 } from 'lucide-react';
import { createClientSupabase } from '@democratia/auth/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PSEUDONYM_CHANGE_COOLDOWN_DAYS } from '@democratia/config';

interface Props {
  pseudonym: string;
  avatarUrl: string | null;
  pseudonymChangedAt: string | null;
}

export function ProfileIdentitySection({ pseudonym, avatarUrl, pseudonymChangedAt }: Props) {
  const [editing, setEditing] = useState(false);
  const [newPseudonym, setNewPseudonym] = useState(pseudonym);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canChange = !pseudonymChangedAt || (
    (Date.now() - new Date(pseudonymChangedAt).getTime()) / 86400000 > PSEUDONYM_CHANGE_COOLDOWN_DAYS
  );

  const nextChangeDate = pseudonymChangedAt
    ? new Date(new Date(pseudonymChangedAt).getTime() + PSEUDONYM_CHANGE_COOLDOWN_DAYS * 86400000)
    : null;

  async function savePseudonym() {
    if (newPseudonym === pseudonym || !newPseudonym.trim()) { setEditing(false); return; }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(newPseudonym)) {
      setError('Only letters, numbers, underscores. 3–30 characters.');
      return;
    }
    setLoading(true);
    const supabase = createClientSupabase();
    const { error: err } = await supabase.from('user_profiles').update({
      pseudonym: newPseudonym,
      pseudonym_changed_at: new Date().toISOString(),
    }).eq('id', (await supabase.auth.getUser()).data.user?.id ?? '');

    if (err) { setError(err.message); setLoading(false); return; }
    setSuccess(true);
    setEditing(false);
    setLoading(false);
  }

  return (
    <section aria-labelledby="identity-heading">
      <h2 id="identity-heading" className="text-lg font-semibold mb-4">Identity</h2>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-16 w-16 items-center justify-center border-2 border-border">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <User className="h-7 w-7 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="font-medium">{success ? newPseudonym : pseudonym}</p>
          <p className="text-xs text-muted-foreground">Your public pseudonym</p>
        </div>
      </div>

      {editing ? (
        <div className="space-y-3 max-w-sm">
          <div className="space-y-1.5">
            <Label htmlFor="new-pseudonym">New pseudonym</Label>
            <Input
              id="new-pseudonym"
              value={newPseudonym}
              onChange={(e) => { setNewPseudonym(e.target.value); setError(null); }}
              placeholder="new_pseudonym"
              maxLength={30}
              autoFocus
            />
            {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={savePseudonym} disabled={loading}>
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setNewPseudonym(pseudonym); }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setEditing(true)}
          disabled={!canChange}
          title={!canChange && nextChangeDate ? `Available on ${nextChangeDate.toLocaleDateString()}` : undefined}
        >
          <Edit2 className="h-3.5 w-3.5" />
          Change pseudonym
          {!canChange && nextChangeDate && (
            <span className="ml-1 text-muted-foreground text-xs">({nextChangeDate.toLocaleDateString()})</span>
          )}
        </Button>
      )}
    </section>
  );
}
