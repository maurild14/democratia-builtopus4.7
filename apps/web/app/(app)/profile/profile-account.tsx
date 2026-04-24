'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut } from 'lucide-react';
import { createClientSupabase } from '@democratia/auth/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface Profile { locale: string; theme: string; is_phone_verified: boolean; is_email_verified: boolean; }
interface Props { profile: Profile; }

export function ProfileAccountSection({ profile }: Props) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isDark, setIsDark] = useState(profile.theme === 'dark');

  async function logout() {
    setLoggingOut(true);
    const supabase = createClientSupabase();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  function toggleTheme(val: boolean) {
    setIsDark(val);
    document.documentElement.classList.toggle('dark', val);
    // Persist via API
    fetch('/api/profile/theme', { method: 'PATCH', body: JSON.stringify({ theme: val ? 'dark' : 'light' }), headers: { 'Content-Type': 'application/json' } });
  }

  return (
    <section aria-labelledby="account-heading">
      <h2 id="account-heading" className="text-lg font-semibold mb-4">Account &amp; Preferences</h2>

      <div className="space-y-4 mb-8">
        {/* Verification status */}
        <div className="flex items-center justify-between py-2 border-b border-border">
          <div>
            <p className="text-sm font-medium">Email verification</p>
            <p className="text-xs text-muted-foreground">Required for account access</p>
          </div>
          <span className={`text-xs font-semibold ${profile.is_email_verified ? 'text-foreground' : 'text-muted-foreground'}`}>
            {profile.is_email_verified ? 'Verified' : 'Pending'}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-border">
          <div>
            <p className="text-sm font-medium">Phone verification</p>
            <p className="text-xs text-muted-foreground">Required for forum participation</p>
          </div>
          <span className={`text-xs font-semibold ${profile.is_phone_verified ? 'text-foreground' : 'text-muted-foreground'}`}>
            {profile.is_phone_verified ? 'Verified' : 'Not verified'}
          </span>
        </div>

        {/* Dark mode */}
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode" className="font-medium cursor-pointer">Dark mode</Label>
          <Switch
            id="dark-mode"
            checked={isDark}
            onCheckedChange={toggleTheme}
            aria-label="Toggle dark mode"
          />
        </div>

        {/* Language */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Language</p>
          </div>
          <span className="text-sm text-muted-foreground">English (default)</span>
        </div>
      </div>

      {/* Help */}
      <div className="mb-8 p-4 border border-border">
        <p className="text-sm font-medium mb-1">Help</p>
        <div className="flex flex-col gap-1.5">
          <button className="text-sm text-muted-foreground hover:text-foreground text-left underline hover:no-underline">Watch welcome tutorial</button>
          <a href="/help" className="text-sm text-muted-foreground hover:text-foreground underline hover:no-underline">Help center</a>
        </div>
      </div>

      {/* Danger zone */}
      <div className="space-y-3 pt-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={logout}
          disabled={loggingOut}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Log out
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          Delete account
        </Button>
      </div>
    </section>
  );
}
