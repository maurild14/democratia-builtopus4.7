'use client';

import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateVotePercentages } from '@/lib/utils';

interface VoteBarProps {
  agree: number;
  disagree: number;
  pass: number;
  userVote?: 'agree' | 'disagree' | 'pass' | null;
  onVote?: (value: 'agree' | 'disagree' | 'pass') => void;
  disabled?: boolean;
  showButtons?: boolean;
  size?: 'sm' | 'md';
}

export function VoteBar({
  agree,
  disagree,
  pass,
  userVote,
  onVote,
  disabled = false,
  showButtons = true,
  size = 'md',
}: VoteBarProps) {
  const pct = calculateVotePercentages(agree, disagree, pass);

  return (
    <div className="space-y-2">
      {/* Bar */}
      <div className="flex h-2 w-full overflow-hidden rounded-none bg-muted" role="meter" aria-label={`Votes: ${pct.agree}% agree, ${pct.disagree}% disagree, ${pct.pass}% pass`}>
        <div
          className="vote-agree transition-all duration-500"
          style={{ width: `${pct.agree}%` }}
        />
        <div
          className="vote-disagree transition-all duration-500"
          style={{ width: `${pct.disagree}%` }}
        />
        <div
          className="vote-pass transition-all duration-500"
          style={{ width: `${pct.pass}%` }}
        />
      </div>

      {/* Stats row */}
      <div className={cn('flex items-center gap-4 text-muted-foreground', size === 'sm' ? 'text-xs' : 'text-xs')}>
        <span className="font-medium text-foreground">{pct.agree}% agree</span>
        <span>{pct.disagree}% disagree</span>
        <span>{pct.pass}% pass</span>
        <span className="ml-auto">{pct.total.toLocaleString()} votes</span>
      </div>

      {/* Vote buttons */}
      {showButtons && onVote && (
        <div className={cn('flex items-center gap-2 mt-3', size === 'sm' ? 'gap-1.5' : '')}>
          {(['agree', 'disagree', 'pass'] as const).map((v) => {
            const isActive = userVote === v;
            const icons = { agree: ThumbsUp, disagree: ThumbsDown, pass: Minus };
            const Icon = icons[v];
            const labels = { agree: 'Agree', disagree: 'Disagree', pass: 'Pass' };
            return (
              <button
                key={v}
                onClick={() => onVote(v)}
                disabled={disabled}
                aria-pressed={isActive}
                aria-label={labels[v]}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium border transition-all duration-150',
                  'rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  isActive
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                )}
              >
                <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                <span className="hidden sm:inline">{labels[v]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
