'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Minus, CheckCircle } from 'lucide-react';
import { createClientSupabase } from '@democratia/auth/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Statement {
  id: string;
  text: string;
  source: string;
  vote_agree: number;
  vote_disagree: number;
  vote_pass: number;
}

interface Props {
  statements: Statement[];
  userVoteMap: Record<string, string>;
  threadId: string;
  isAuthenticated: boolean;
}

export function Layer2StatementVoting({ statements, userVoteMap, threadId, isAuthenticated }: Props) {
  const unvoted = statements.filter((s) => !userVoteMap[s.id]);
  const [queue, setQueue] = useState(unvoted);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [voted, setVoted] = useState<Record<string, 'agree' | 'disagree' | 'pass'>>(
    Object.fromEntries(Object.entries(userVoteMap).map(([k, v]) => [k, v as 'agree' | 'disagree' | 'pass']))
  );
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(unvoted.length === 0);

  const current = queue[currentIdx];
  const progress = statements.length > 0 ? Math.round(((statements.length - queue.length + currentIdx) / statements.length) * 100) : 100;

  async function vote(value: 'agree' | 'disagree' | 'pass') {
    if (!current || loading || !isAuthenticated) return;
    setLoading(true);

    const supabase = createClientSupabase();
    await supabase.rpc('upsert_vote', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id ?? '',
      p_target_type: 'statement',
      p_target_id: current.id,
      p_value: value,
      p_weight: 1.0,
    });

    setVoted((prev) => ({ ...prev, [current.id]: value }));

    if (currentIdx >= queue.length - 1) setDone(true);
    else setCurrentIdx((i) => i + 1);
    setLoading(false);
  }

  if (done || statements.length === 0) {
    return (
      <div className="text-center py-16">
        <CheckCircle className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">All statements voted</h2>
        <p className="text-muted-foreground text-sm">Thank you for participating. Results will be processed when voting closes.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Vote on Statements</h2>
        <Badge variant="secondary">{currentIdx + 1} / {queue.length} remaining</Badge>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-muted mb-8">
        <div className="h-1 bg-foreground transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Statement card */}
      <div className="relative min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Card className="card-editorial p-8 sm:p-10">
              {current.source === 'user_proposed' && (
                <Badge variant="secondary" className="mb-4">User proposed</Badge>
              )}
              <p className="text-lg sm:text-xl font-medium leading-relaxed">{current.text}</p>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Vote buttons */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => vote('disagree')}
          disabled={loading || !isAuthenticated}
          className="flex flex-col items-center gap-2 p-4 border border-border hover:border-foreground hover:bg-accent transition-all rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 group"
          aria-label="Disagree"
        >
          <div className="flex h-14 w-14 items-center justify-center border-2 border-border group-hover:border-foreground group-hover:bg-foreground group-hover:text-background transition-all rounded-full">
            <ThumbsDown className="h-6 w-6" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">Disagree</span>
        </button>

        <button
          onClick={() => vote('pass')}
          disabled={loading || !isAuthenticated}
          className="flex flex-col items-center gap-2 p-4 border border-border hover:border-muted-foreground hover:bg-accent transition-all rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          aria-label="Pass"
        >
          <div className="flex h-10 w-10 items-center justify-center border border-border rounded-full">
            <Minus className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">Pass</span>
        </button>

        <button
          onClick={() => vote('agree')}
          disabled={loading || !isAuthenticated}
          className="flex flex-col items-center gap-2 p-4 border border-border hover:border-foreground hover:bg-accent transition-all rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 group"
          aria-label="Agree"
        >
          <div className="flex h-14 w-14 items-center justify-center border-2 border-border group-hover:border-foreground group-hover:bg-foreground group-hover:text-background transition-all rounded-full">
            <ThumbsUp className="h-6 w-6" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">Agree</span>
        </button>
      </div>

      {!isAuthenticated && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          <a href="/login" className="underline hover:text-foreground">Log in</a> to vote on statements.
        </p>
      )}
    </div>
  );
}
