import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Props {
  result: { synthesis_text: string | null; dissent_text: string | null; executive_summary: string | null };
}

export function Layer4Synthesis({ result }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-2">Deliberation Synthesis</h2>
        <p className="text-sm text-muted-foreground">
          An inclusive synthesis of all positions, preserving minority voices.
        </p>
      </div>

      {result.executive_summary && (
        <Card className="card-editorial p-6 section-inverted">
          <Badge className="border-white/40 text-white mb-3">Executive Summary</Badge>
          <p className="text-zinc-200 leading-relaxed text-sm">{result.executive_summary}</p>
        </Card>
      )}

      {result.synthesis_text && (
        <div>
          <h3 className="font-semibold mb-3">Areas of Agreement</h3>
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
            <p>{result.synthesis_text}</p>
          </div>
        </div>
      )}

      {result.dissent_text && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              Dissenting Voices
              <Badge variant="secondary">Minority positions</Badge>
            </h3>
            <Card className="card-editorial p-5 border-l-4 border-l-zinc-400">
              <p className="text-sm leading-relaxed text-muted-foreground">{result.dissent_text}</p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
