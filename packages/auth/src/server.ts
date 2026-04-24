import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@democratia/db';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = ReturnType<typeof createServerClient<any>>;

export type { Database };
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'preview-anon-key';

export async function createServerSupabase(): Promise<AnySupabase> {
  const cookieStore = await cookies();
  return createServerClient<any>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cookieStore.set(name, value, options as any)
            );
          } catch {
            // Server component — cookies can't be set (read-only context)
          }
        },
      },
    }
  );
}

export async function createServiceSupabase() {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient<any>(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'preview-service-key',
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function getSession() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data as UserProfile | null;
}
