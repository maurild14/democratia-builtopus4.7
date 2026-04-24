import Link from 'next/link';
import { Download, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Proposal {
  title: string;
  description: string;
  rationale: string;
  addressee: string;
  consensusSupport: number;
}

interface Props {
  result: {
    proposals: unknown;
    executive_summary: string | null;
    open_data_url: string | null;
    metrics: unknown;
  };
  threadTitle: string;
  forumName: string;
}

export function Layer5Proposals({ result, threadTitle, forumName }: Props) {
  const proposals = (result.proposals as Proposal[] | null) ?? [];
  const metrics = result.metrics as { totalParticipants?: number; consensusRate?: number } | null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-2">Action &amp; Proposals</h2>
        <p className="text-sm text-muted-foreground">
          Formal proposals generated from the deliberation of &ldquo;{threadTitle}&rdquo; in {forumName}.
        </p>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {metrics.totalParticipants !== undefined && (
            <Card className="card-editorial p-4 text-center">
              <p className="font-display text-4xl">{metrics.totalParticipants}</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Participants</p>
            </Card>
          )}
          {metrics.consensusRate !== undefined && (
            <Card className="card-editorial p-4 text-center">
              <p className="font-display text-4xl">{Math.round(metrics.consensusRate * 100)}%</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Consensus rate</p>
            </Card>
          )}
        </div>
      )}

      {/* Proposals */}
      {proposals.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-semibold">Policy Proposals</h3>
          {proposals.map((p, i) => (
            <Card key={i} className="card-editorial p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center bg-foreground text-background text-xs font-bold rounded-full">{i + 1}</span>
                  <h4 className="font-semibold">{p.title}</h4>
                </div>
                <Badge variant="secondary">{Math.round((p.consensusSupport ?? 0) * 100)}% support</Badge>
              </div>
              <p className="text-sm leading-relaxed mb-3">{p.description}</p>
              <p className="text-xs text-muted-foreground">{p.rationale}</p>
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Addressed to:</span>
                <strong className="text-foreground">{p.addressee}</strong>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="card-editorial p-8 text-center">
          <p className="text-muted-foreground text-sm">Proposals are being generated. Check back shortly.</p>
        </Card>
      )}

      {/* Download */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
        {result.open_data_url ? (
          <Button variant="outline" size="sm" asChild>
            <a href={result.open_data_url} download>
              <Download className="h-3.5 w-3.5" />
              Download open data (CSV)
            </a>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <Download className="h-3.5 w-3.5" />
            Open data (pending)
          </Button>
        )}
        <Button variant="outline" size="sm" asChild>
          <Link href="/api/public/v1/reports">
            <ExternalLink className="h-3.5 w-3.5" />
            Public API
          </Link>
        </Button>
      </div>
    </div>
  );
}
