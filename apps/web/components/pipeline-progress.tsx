import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const STAGES = [
  { id: 'layer1', label: 'Discussion', short: '1' },
  { id: 'layer2', label: 'Statements', short: '2' },
  { id: 'layer3', label: 'Clustering', short: '3' },
  { id: 'layer4', label: 'Synthesis', short: '4' },
  { id: 'layer5', label: 'Proposals', short: '5' },
] as const;

type Stage = (typeof STAGES)[number]['id'];

interface PipelineProgressProps {
  currentStage: Stage;
  className?: string;
}

const stageOrder: Record<Stage, number> = {
  layer1: 0, layer2: 1, layer3: 2, layer4: 3, layer5: 4,
};

export function PipelineProgress({ currentStage, className }: PipelineProgressProps) {
  const currentIdx = stageOrder[currentStage];

  return (
    <div className={cn('flex items-center gap-0', className)} role="progressbar" aria-label={`Deliberation pipeline: step ${currentIdx + 1} of 5`} aria-valuenow={currentIdx + 1} aria-valuemin={1} aria-valuemax={5}>
      {STAGES.map((stage, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const future = idx > currentIdx;

        return (
          <div key={stage.id} className="flex items-center">
            {/* Node */}
            <div className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
              done && 'border-foreground bg-foreground text-background',
              active && 'border-foreground bg-foreground text-background ring-2 ring-foreground ring-offset-2',
              future && 'border-border bg-background text-muted-foreground',
            )}>
              {done ? <Check className="h-3.5 w-3.5" /> : <span>{stage.short}</span>}
            </div>

            {/* Label below (hidden on small screens) */}
            <div className="absolute mt-10 hidden sm:block">
              <span className={cn('text-[10px] font-medium whitespace-nowrap', active ? 'text-foreground' : 'text-muted-foreground')}>
                {stage.label}
              </span>
            </div>

            {/* Connector */}
            {idx < STAGES.length - 1 && (
              <div className={cn('h-[2px] w-8 sm:w-12 transition-colors', done ? 'bg-foreground' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
