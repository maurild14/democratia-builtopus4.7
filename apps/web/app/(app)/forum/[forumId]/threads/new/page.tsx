'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, ImagePlus, X } from 'lucide-react';
import { createClientSupabase } from '@democratia/auth/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export default function NewThreadPage() {
  const router = useRouter();
  const { forumId } = useParams<{ forumId: string }>();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 10) { setError('Title must be at least 10 characters.'); return; }
    if (body.trim().length < 20) { setError('Body must be at least 20 characters.'); return; }
    setLoading(true);
    setError(null);

    const supabase = createClientSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: thread, error: insertError } = await supabase
      .from('threads')
      .insert({
        forum_id: forumId,
        author_id: user.id,
        title: title.trim(),
        body: body.trim(),
        image_urls: [],
      })
      .select('id')
      .single();

    if (insertError || !thread) {
      setError(insertError?.message ?? 'Failed to create thread.');
      setLoading(false);
      return;
    }

    router.push(`/thread/${thread.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link href={`/forum/${forumId}`} className="hover:text-foreground">Forum</Link>
        {' / '}
        <span className="text-foreground">New thread</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Start a discussion</h1>
        <p className="mt-1 text-sm text-muted-foreground">Share a topic, question, or proposal with your community.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title <span aria-hidden className="text-destructive">*</span></Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(null); }}
            placeholder="A clear, specific question or statement"
            aria-required
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">{title.length}/200 characters</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="body">Details <span aria-hidden className="text-destructive">*</span></Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => { setBody(e.target.value); setError(null); }}
            placeholder="Provide context, evidence, and your perspective. Be respectful and factual."
            rows={8}
            aria-required
            maxLength={10000}
            className="resize-y"
          />
          <p className="text-xs text-muted-foreground">{body.length}/10000 characters</p>
        </div>

        <div className="p-4 border border-dashed border-border rounded-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ImagePlus className="h-4 w-4" />
            <span>Image attachments — coming soon</span>
          </div>
        </div>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Post thread
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/forum/${forumId}`}>Cancel</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Threads with enough engagement may be elevated to the deliberation pipeline for structured civic consensus.
        </p>
      </form>
    </div>
  );
}
