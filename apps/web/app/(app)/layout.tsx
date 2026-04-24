import { redirect } from 'next/navigation';
import { getUserProfile } from '@democratia/auth/server';
import { createServerSupabase } from '@democratia/auth/server';
import { AppNavbar } from '@/components/layout/navbar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getUserProfile();
  if (!profile) redirect('/login');

  const supabase = await createServerSupabase();
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('is_read', false);

  return (
    <div className="min-h-dvh flex flex-col">
      <AppNavbar
        user={{ pseudonym: profile.pseudonym, role: profile.role }}
        unreadCount={count ?? 0}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
