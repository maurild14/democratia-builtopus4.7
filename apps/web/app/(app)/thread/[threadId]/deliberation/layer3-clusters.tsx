'use client';

import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Statement { id: string; text: string; is_consensus: boolean; is_divisive: boolean; }
interface Props {
  result: { cluster_data: unknown; metrics: unknown };
  statements: Statement[];
}

const CLUSTER_COLORS = ['#000000', '#555555', '#999999', '#cccccc'];

export function Layer3Clusters({ result, statements }: Props) {
  const clusterData = result.cluster_data as {
    points?: { x: number; y: number; cluster: number; userId: string }[];
    centroids?: { x: number; y: number }[];
  } | null;

  const consensus = statements.filter((s) => s.is_consensus);
  const divisive = statements.filter((s) => s.is_divisive && !s.is_consensus);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-2">Opinion Clusters</h2>
        <p className="text-sm text-muted-foreground">
          Participants have been grouped by voting patterns. Each dot represents a participant.
        </p>
      </div>

      {/* Scatter plot */}
      <Card className="card-editorial p-6">
        <p className="text-sm font-medium mb-4">Participant opinion map</p>
        {clusterData?.points && clusterData.points.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <XAxis type="number" dataKey="x" hide />
              <YAxis type="number" dataKey="y" hide />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={() => null}
              />
              <Scatter data={clusterData.points}>
                {clusterData.points.map((point, i) => (
                  <Cell key={i} fill={CLUSTER_COLORS[point.cluster % CLUSTER_COLORS.length]} opacity={0.7} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48 bg-muted/30">
            <p className="text-sm text-muted-foreground">Scatter plot will appear once clustering completes.</p>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4">
          {CLUSTER_COLORS.slice(0, 4).map((color, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-muted-foreground">Cluster {i + 1}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Consensus statements */}
      {consensus.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Badge variant="inverted">Consensus</Badge>
            <span className="text-sm text-muted-foreground">All clusters agree on these</span>
          </h3>
          <div className="space-y-2">
            {consensus.map((s) => (
              <Card key={s.id} className="card-editorial p-4 border-l-4 border-l-foreground">
                <p className="text-sm">{s.text}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Divisive statements */}
      {divisive.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Badge variant="secondary">Divisive</Badge>
            <span className="text-sm text-muted-foreground">Clusters disagree on these</span>
          </h3>
          <div className="space-y-2">
            {divisive.map((s) => (
              <Card key={s.id} className="card-editorial p-4 border-l-4 border-l-zinc-400">
                <p className="text-sm">{s.text}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
