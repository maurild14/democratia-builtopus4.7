'use client';

import { useState } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { createClientSupabase } from '@democratia/auth/client';
import { Button } from '@/components/ui/button';
import { VoteBar } from '@/components/vote-bar';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  body: string;
  depth: number;
  parent_id: string | null;
  reply_to_pseudonym: string | null;
  vote_agree: number;
  vote_disagree: number;
  vote_pass: number;
  created_at: string;
  user_profiles?: { pseudonym: string } | null;
}

interface Props {
  threadId: string;
  initialComments: Comment[];
  profile: { id: string; pseudonym: string } | null;
  isLocked: boolean;
}

export function CommentSection({ threadId, initialComments, profile, isLocked }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  async function submitComment(parentId: string | null, depth: number, replyToPseudonym?: string) {
    if (!newComment.trim() || !profile) return;
    setLoading(true);

    const supabase = createClientSupabase();
    const { data, error } = await supabase
      .from('comments')
      .insert({
        thread_id: threadId,
        author_id: profile.id,
        parent_id: parentId,
        depth: Math.min(depth, 5),
        reply_to_pseudonym: replyToPseudonym ?? null,
        body: newComment.trim(),
      })
      .select('*, user_profiles(pseudonym)')
      .single();

    if (!error && data) {
      setComments((prev) => [...prev, data as Comment]);
      setNewComment('');
      setReplyingTo(null);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* New top-level comment */}
      {profile && !isLocked && (
        <CommentComposer
          value={newComment}
          onChange={setNewComment}
          onSubmit={() => submitComment(null, 0)}
          loading={loading}
          placeholder="Add a comment..."
        />
      )}

      {isLocked && (
        <p className="text-sm text-muted-foreground border border-border p-3">
          This thread is in deliberation — comments are locked. Participate via the pipeline instead.
        </p>
      )}

      {/* Comment tree */}
      <CommentTree
        comments={comments}
        parentId={null}
        depth={0}
        profile={profile}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        newComment={newComment}
        setNewComment={setNewComment}
        onSubmit={submitComment}
        loading={loading}
        isLocked={isLocked}
      />
    </div>
  );
}

function CommentTree({
  comments,
  parentId,
  depth,
  profile,
  replyingTo,
  setReplyingTo,
  newComment,
  setNewComment,
  onSubmit,
  loading,
  isLocked,
}: {
  comments: Comment[];
  parentId: string | null;
  depth: number;
  profile: { id: string; pseudonym: string } | null;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  newComment: string;
  setNewComment: (v: string) => void;
  onSubmit: (parentId: string | null, depth: number, replyToPseudonym?: string) => Promise<void>;
  loading: boolean;
  isLocked: boolean;
}) {
  const children = comments.filter((c) => c.parent_id === parentId);
  if (children.length === 0) return null;

  return (
    <div className={cn('space-y-4', depth > 0 && 'ml-6 pl-4 border-l border-border')}>
      {children.map((comment) => (
        <div key={comment.id}>
          <CommentCard
            comment={comment}
            depth={depth}
            profile={profile}
            isReplying={replyingTo === comment.id}
            onReply={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            isLocked={isLocked}
          />

          {replyingTo === comment.id && profile && !isLocked && depth < 5 && (
            <div className="mt-3 ml-6 pl-4 border-l border-border">
              <CommentComposer
                value={newComment}
                onChange={setNewComment}
                onSubmit={() => onSubmit(comment.id, depth + 1, comment.user_profiles?.pseudonym)}
                loading={loading}
                placeholder={`Reply to ${comment.user_profiles?.pseudonym ?? 'user'}...`}
                onCancel={() => setReplyingTo(null)}
              />
            </div>
          )}

          <CommentTree
            comments={comments}
            parentId={comment.id}
            depth={depth + 1}
            profile={profile}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            newComment={newComment}
            setNewComment={setNewComment}
            onSubmit={onSubmit}
            loading={loading}
            isLocked={isLocked}
          />
        </div>
      ))}
    </div>
  );
}

function CommentCard({ comment, depth, profile, isReplying, onReply, isLocked }: {
  comment: Comment;
  depth: number;
  profile: { id: string; pseudonym: string } | null;
  isReplying: boolean;
  onReply: () => void;
  isLocked: boolean;
}) {
  return (
    <div className="py-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
        {comment.reply_to_pseudonym && depth >= 5 && (
          <span className="text-foreground">in reply to @{comment.reply_to_pseudonym}</span>
        )}
        <strong className="text-foreground">{comment.user_profiles?.pseudonym ?? 'anonymous'}</strong>
        <span>·</span>
        <time dateTime={comment.created_at}>{formatRelativeTime(comment.created_at)}</time>
      </div>

      <p className="text-sm leading-relaxed">{comment.body}</p>

      <div className="mt-2 flex items-center gap-3">
        <VoteBar
          agree={comment.vote_agree}
          disagree={comment.vote_disagree}
          pass={comment.vote_pass}
          showButtons={false}
          size="sm"
        />
        {profile && !isLocked && depth < 5 && (
          <button
            onClick={onReply}
            className={cn('text-xs flex items-center gap-1 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring', isReplying ? 'text-foreground' : 'text-muted-foreground')}
            aria-expanded={isReplying}
          >
            <MessageSquare className="h-3 w-3" />
            Reply
          </button>
        )}
      </div>
    </div>
  );
}

function CommentComposer({ value, onChange, onSubmit, loading, placeholder, onCancel }: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  placeholder: string;
  onCancel?: () => void;
}) {
  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
        aria-label={placeholder}
      />
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onSubmit} disabled={loading || !value.trim()}>
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Post
        </Button>
        {onCancel && (
          <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </div>
  );
}
