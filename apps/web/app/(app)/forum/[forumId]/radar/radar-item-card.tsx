'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Radio, ChevronDown, ChevronUp, ExternalLink, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';

interface RadarItem {
  id: string;
  item_type: string;
  title: string;
  ai_summary: string | null;
  source_url: string | null;
  source_name: string | null;
  published_at: string | null;
  is_debate_open: boolean;
  linked_thread_id: string | null;
  created_at: string;
}

interface Props {
  item: RadarItem;
  forumId: string;
  isAuthenticated: boolean;
}

export function RadarItemCard({ item, forumId, isAuthenticated }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [opening, setOpening] = useState(false);

  async function openDebate() {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (item.linked_thread_id) { router.push(`/thread/${item.linked_thread_id}`); return; }

    setOpening(true);
    const res = await fetch('/api/radar/open-debate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ radarItemId: item.id, forumId }),
    });
    const data = await res.json() as { threadId?: string };
    if (data.threadId) router.push(`/thread/${data.threadId}`);
    setOpening(false);
  }

  return (
    <Card className="card-editorial p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px]">
            {item.item_type.toUpperCase()}
          </Badge>
          {item.is_debate_open && <Badge variant="inverted" className="text-[10px]">Debate open</Badge>}
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatRelativeTime(item.published_at ?? item.created_at)}
        </span>
      </div>

      <h3 className="font-bold text-base mb-3 leading-snug">{item.title}</h3>

      {item.ai_summary && (
        <div className="mb-3">
          <div className="border border-border p-3 bg-muted/20">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Summary by AI</p>
            <p className={`text-xs text-muted-foreground leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}>
              {item.ai_summary}
            </p>
          </div>
          {item.ai_summary.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1.5 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 focus-visible:outline-none"
            >
              {expanded ? <><ChevronUp className="h-3 w-3" />Show less</> : <><ChevronDown className="h-3 w-3" />Read more</>}
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        <Button
          size="sm"
          variant={item.is_debate_open ? 'default' : 'outline'}
          onClick={openDebate}
          disabled={opening}
        >
          {opening && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          <Radio className="h-3.5 w-3.5" />
          {item.is_debate_open ? 'Join debate' : 'Open debate'}
        </Button>

        {item.source_url && (
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 underline"
          >
            {item.source_name ?? 'Source'} <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </Card>
  );
}
