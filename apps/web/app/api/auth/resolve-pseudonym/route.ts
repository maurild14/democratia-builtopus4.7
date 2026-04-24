import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabase } from '@democratia/auth/server';

export async function GET(request: NextRequest) {
  const pseudonym = new URL(request.url).searchParams.get('pseudonym');
  if (!pseudonym) return NextResponse.json({ error: 'pseudonym required' }, { status: 400 });

  const supabase = await createServiceSupabase();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .ilike('pseudonym', pseudonym)
    .single();

  if (!profile) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { data: user } = await supabase.auth.admin.getUserById(profile.id);
  if (!user.user?.email) return NextResponse.json({ error: 'not found' }, { status: 404 });

  return NextResponse.json({ email: user.user.email });
}
