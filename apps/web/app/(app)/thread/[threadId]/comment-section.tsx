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
  userCommentVotes: Record<string, 'agree' | 'disagree' | 'pass'>;
}

function countDescendants(comments: Comment[], parentId: string): number {
  const children = comments.filter((c) => c.parent_id === parentId);
  return children.reduce((sum, child) => sum + 1 + countDescendants(comments, child.id), 0);
}

export function CommentSection({ threadId, initialComments, profile, isLocked, userCommentVotes }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  function toggleCollapse(id: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

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
        collapsedIds={collapsedIds}
        toggleCollapse={toggleCollapse}
        profile={profile}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        newComment={newComment}
        setNewComment={setNewComment}
        onSubmit={submitComment}
        loading={loading}
        isLocked={isLocked}
        userCommentVotes={userCommentVotes}
      />
    </div>
  );
}

function CommentTree({
  comments,
  parentId,
  depth,
  collapsedIds,
  toggleCollapse,
  profile,
  replyingTo,
  setReplyingTo,
  newComment,
  setNewComment,
  onSubmit,
  loading,
  isLocked,
  userCommentVotes,
}: {
  comments: Comment[];
  parentId: string | null;
  depth: number;
  collapsedIds: Set<string>;
  toggleCollapse: (id: string) => void;
  profile: { id: string; pseudonym: string } | null;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  newComment: string;
  setNewComment: (v: string) => void;
  onSubmit: (parentId: string | null, depth: number, replyToPseudonym?: string) => Promise<void>;
  loading: boolean;
  isLocked: boolean;
  userCommentVotes: Record<string, 'agree' | 'disagree' | 'pass'>;
}) {
  const children = comments.filter((c) => c.parent_id === parentId);
  if (children.length === 0) return null;

  return (
    <div className="space-y-1">
      {children.map((comment) => {
        const collapsed = collapsedIds.has(comment.id);
        const descendantCount = countDescendants(comments, comment.id);
        const hasChildren = comments.some((c) => c.parent_id === comment.id);
        const hasSubcontent = replyingTo === comment.id || hasChildren;

        return (
          <div key={comment.id}>
            <CommentCard
              comment={comment}
              depth={depth}
              collapsed={collapsed}
              descendantCount={descendantCount}
              onToggleCollapse={() => toggleCollapse(comment.id)}
              profile={profile}
              isReplying={replyingTo === comment.id}
              onReply={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              isLocked={isLocked}
              initialUserVote={userCommentVotes[comment.id]}
            />

            {/* Thread line block — shown when expanded and there is subcontent */}
            {!collapsed && hasSubcontent && (
              <div className="ml-3 flex mt-1">
                {/* Clickable thread line — clicking it collapses this comment's subtree */}
                <button
                  onClick={() => toggleCollapse(comment.id)}
                  className="w-4 flex-none group self-stretch cursor-pointer"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <div className="w-px h-full mx-auto bg-border group-hover:bg-foreground transition-colors duration-150" />
                </button>

                <div className="flex-1 pl-3 space-y-3">
                  {/* Reply composer */}
                  {replyingTo === comment.id && profile && !isLocked && depth < 5 && (
                    <CommentComposer
                      value={newComment}
                      onChange={setNewComment}
                      onSubmit={() => onSubmit(comment.id, depth + 1, comment.user_profiles?.pseudonym)}
                      loading={loading}
                      placeholder={`Reply to ${comment.user_profiles?.pseudonym ?? 'user'}...`}
                      onCancel={() => setReplyingTo(null)}
                    />
                  )}

                  {/* Recursive children */}
                  <CommentTree
                    comments={comments}
                    parentId={comment.id}
                    depth={depth + 1}
                    collapsedIds={collapsedIds}
                    toggleCollapse={toggleCollapse}
                    profile={profile}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    onSubmit={onSubmit}
                    loading={loading}
                    isLocked={isLocked}
                    userCommentVotes={userCommentVotes}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CommentCard({
  comment,
  depth,
  collapsed,
  descendantCount,
  onToggleCollapse,
  profile,
  isReplying,
  onReply,
  isLocked,
  initialUserVote,
}: {
  comment: Comment;
  depth: number;
  collapsed: boolean;
  descendantCount: number;
  onToggleCollapse: () => void;
  profile: { id: string; pseudonym: string } | null;
  isReplying: boolean;
  onReply: () => void;
  isLocked: boolean;
  initialUserVote?: 'agree' | 'disagree' | 'pass';
}) {
  const [agree, setAgree] = useState(comment.vote_agree);
  const [disagree, setDisagree] = useState(comment.vote_disagree);
  const [pass, setPass] = useState(comment.vote_pass);
  const [userVote, setUserVote] = useState<'agree' | 'disagree' | 'pass' | undefined>(initialUserVote);
  const [voteLoading, setVoteLoading] = useState(false);

  const isAuthenticated = !!profile;

  async function handleVote(value: 'agree' | 'disagree' | 'pass') {
    if (!isAuthenticated || voteLoading) return;
    setVoteLoading(true);
    const supabase = createClientSupabase();
    const { data: result } = await supabase.rpc('upsert_vote', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id ?? '',
      p_target_type: 'comment',
      p_target_id: comment.id,
      p_value: value,
      p_weight: 1.0,
    });
    if (result?.[0]) {
      setAgree(result[0].agree);
      setDisagree(result[0].disagree);
      setPass(result[0].pass);
      setUserVote(value);
    }
    setVoteLoading(false);
  }

  return (
    <div className="py-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
        <button
          onClick={onToggleCollapse}
          className="font-mono shrink-0 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label={collapsed ? 'Expand thread' : 'Collapse thread'}
          aria-expanded={!collapsed}
        >
          {collapsed ? '[+]' : '[−]'}
        </button>

        {comment.reply_to_pseudonym && depth >= 5 && (
          <span className="text-foreground">in reply to @{comment.reply_to_pseudonym}</span>
        )}
        <strong className="text-foreground">{comment.user_profiles?.pseudonym ?? 'anonymous'}</strong>
        <span>·</span>
        <time dateTime={comment.created_at}>{formatRelativeTime(comment.created_at)}</time>
        {collapsed && descendantCount > 0 && (
          <span className="italic">
            · {descendantCount} {descendantCount === 1 ? 'reply' : 'replies'} hidden
          </span>
        )}
      </div>

      {!collapsed && (
        <>
          <p className="text-sm leading-relaxed">{comment.body}</p>
          <div className="mt-3">
            <VoteBar
              agree={agree}
              disagree={disagree}
              pass={pass}
              userVote={userVote}
              onVote={isAuthenticated ? handleVote : undefined}
              disabled={voteLoading}
              showButtons={isAuthenticated && !isLocked}
              size="sm"
            />
          </div>
          {profile && !isLocked && depth < 5 && (
            <div className="mt-2">
              <button
                onClick={onReply}
                className={cn(
                  'text-xs flex items-center gap-1 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                  isReplying ? 'text-foreground' : 'text-muted-foreground'
                )}
                aria-expanded={isReplying}
              >
                <MessageSquare className="h-3 w-3" />
                Reply
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CommentComposer({
  value,
  onChange,
  onSubmit,
  loading,
  placeholder,
  onCancel,
}: {
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
