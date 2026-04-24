import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
  {
    variants: {
      variant: {
        default: 'border border-foreground text-foreground rounded-full',
        inverted: 'border border-background bg-foreground text-background rounded-full',
        secondary: 'border border-muted-foreground text-muted-foreground rounded-full',
        destructive: 'border border-destructive text-destructive rounded-full',
        outline: 'border border-foreground rounded-sm',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
