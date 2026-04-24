'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@democratia/auth/client';
import { VoteBar } from '@/components/vote-bar';

interface Props {
  threadId: string;
  initialAgree: number;
  initialDisagree: number;
  initialPass: number;
  initialUserVote?: 'agree' | 'disagree' | 'pass';
  isAuthenticated: boolean;
}

export function ThreadVoteClient({
  threadId,
  initialAgree,
  initialDisagree,
  initialPass,
  initialUserVote,
  isAuthenticated,
}: Props) {
  const router = useRouter();
  const [agree, setAgree] = useState(initialAgree);
  const [disagree, setDisagree] = useState(initialDisagree);
  const [pass, setPass] = useState(initialPass);
  const [userVote, setUserVote] = useState<'agree' | 'disagree' | 'pass' | undefined>(initialUserVote);
  const [loading, setLoading] = useState(false);

  async function handleVote(value: 'agree' | 'disagree' | 'pass') {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (loading) return;
    setLoading(true);

    const supabase = createClientSupabase();
    const { data: result } = await supabase.rpc('upsert_vote', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id ?? '',
      p_target_type: 'thread',
      p_target_id: threadId,
      p_value: value,
      p_weight: 1.0,
    });

    if (result && result[0]) {
      setAgree(result[0].agree);
      setDisagree(result[0].disagree);
      setPass(result[0].pass);
      setUserVote(value);
    }
    setLoading(false);
  }

  return (
    <VoteBar
      agree={agree}
      disagree={disagree}
      pass={pass}
      userVote={userVote}
      onVote={handleVote}
      disabled={loading}
      showButtons
    />
  );
}
