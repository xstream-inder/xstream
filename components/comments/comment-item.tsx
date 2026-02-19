"use client";

import { useState, useTransition, useOptimistic } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/components/providers/auth-modal-provider";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  createComment,
  deleteComment,
  toggleCommentLike,
  updateComment,
  getComments,
  type CommentWithUser,
} from "@/server/actions/comment";
import { formatDistanceToNow } from "date-fns";

type CommentItemProps = {
  comment: CommentWithUser;
  videoId: string;
  depth?: number;
  maxDepth?: number;
};

export default function CommentItem({
  comment,
  videoId,
  depth = 0,
  maxDepth = 3,
}: CommentItemProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { openModal } = useAuthModal();
  const { confirm } = useConfirm();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);
  const [displayContent, setDisplayContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentWithUser[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [replyNextCursor, setReplyNextCursor] = useState<string | null>(null);
  
  // Optimistic updates for replies
  const [optimisticReplies, addOptimisticReply] = useOptimistic(
    replies,
    (state, newReply: CommentWithUser) => [newReply, ...state]
  );

  const [isPending, startTransition] = useTransition();

  // Local state for like optimistic updates
  const [optimisticLiked, setOptimisticLiked] = useState(comment.isLiked || false);
  const [optimisticLikesCount, setOptimisticLikesCount] = useState(comment.likesCount);

  const isOwner = session?.user?.id === comment.userId;
  const canReply = depth < maxDepth;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      openModal("signin");
      return;
    }

    if (!replyContent.trim()) {
      setError("Reply cannot be empty");
      return;
    }

    setError("");
    setIsSubmitting(true);

    // Optimistically add the reply
    const optimisticReply: CommentWithUser = {
      id: `temp-${Date.now()}`,
      content: replyContent.trim(),
      userId: session.user.id!,
      videoId,
      parentId: comment.id,
      likesCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: session.user.id!,
        username: session.user.username || "Anonymous",
        avatarUrl: session.user.avatarUrl || null,
      },
      isLiked: false,
      replyCount: 0,
    };

    startTransition(() => {
      addOptimisticReply(optimisticReply);
    });

    setReplyContent("");
    setIsReplying(false);

    const result = await createComment({
      content: replyContent.trim(),
      videoId,
      parentId: comment.id,
    });

    setIsSubmitting(false);

    if (result.success && result.comment) {
      // Replace optimistic reply with real one
      setReplies((prev) => [result.comment!, ...prev.filter(r => r.id !== optimisticReply.id)]);
      setShowReplies(true);
    } else {
      setError(result.error || "Failed to post reply");
      // Remove optimistic reply on error
      setReplies((prev) => prev.filter(r => r.id !== optimisticReply.id));
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editContent.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const result = await updateComment({
      commentId: comment.id,
      content: editContent.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsEditing(false);
      const trimmed = editContent.trim();
      setEditContent(trimmed);
      setDisplayContent(trimmed);
    } else {
      setError(result.error || "Failed to update comment");
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Comment',
      message: 'Are you sure you want to delete this comment?',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) return;

    const result = await deleteComment(comment.id);

    if (!result.success) {
      setError(result.error || "Failed to delete comment");
    }
  };

  const handleLike = async () => {
    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }

    // Optimistic update
    const newLiked = !optimisticLiked;
    setOptimisticLiked(newLiked);
    setOptimisticLikesCount((prev) => newLiked ? prev + 1 : prev - 1);

    const result = await toggleCommentLike(comment.id);

    if (!result.success) {
      // Revert on error
      setOptimisticLiked(!newLiked);
      setOptimisticLikesCount((prev) => newLiked ? prev - 1 : prev + 1);
    }
  };

  const loadReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }

    if (replies.length > 0) {
      setShowReplies(true);
      return;
    }

    setIsLoadingReplies(true);
    
    const result = await getComments({
      videoId,
      parentId: comment.id,
      limit: 5,
    });

    setIsLoadingReplies(false);

    if (result.success && result.comments) {
      setReplies(result.comments);
      setReplyNextCursor(result.nextCursor || null);
      setShowReplies(true);
    }
  };

  const loadMoreReplies = async () => {
    if (!replyNextCursor || isLoadingReplies) return;

    setIsLoadingReplies(true);
    
    const result = await getComments({
      videoId,
      parentId: comment.id,
      cursor: replyNextCursor,
      limit: 5,
    });

    setIsLoadingReplies(false);

    if (result.success && result.comments) {
      setReplies((prev) => [...prev, ...(result.comments || [])]);
      setReplyNextCursor(result.nextCursor || null);
    }
  };

  const replyCount = comment.replyCount || 0;

  return (
    <div className={`${depth > 0 ? "ml-8 mt-4" : ""}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.user.avatarUrl ? (
            <img
              src={comment.user.avatarUrl}
              alt={comment.user.username}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-dark-600 flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300 font-semibold">
                {comment.user.username[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{comment.user.username}</span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.updatedAt > comment.createdAt && (
              <span className="text-xs text-gray-500">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleEdit} className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-xred-500"
                rows={3}
                maxLength={2000}
                disabled={isSubmitting}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-1 bg-xred-600 text-white text-sm rounded-lg hover:bg-xred-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(displayContent);
                    setError("");
                  }}
                  className="px-3 py-1 bg-gray-300 dark:bg-dark-600 text-gray-800 dark:text-gray-200 text-sm rounded-lg hover:bg-gray-400 dark:hover:bg-dark-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
              {displayContent}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 text-sm ${
                  optimisticLiked
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:text-blue-600"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill={optimisticLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
                {optimisticLikesCount > 0 && <span>{optimisticLikesCount}</span>}
              </button>

              {canReply && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600"
                >
                  Reply
                </button>
              )}

              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}

          {/* Reply Form */}
          {isReplying && (
            <form onSubmit={handleReply} className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Reply to ${comment.user.username}...`}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-xred-500"
                rows={2}
                maxLength={2000}
                disabled={isSubmitting}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !replyContent.trim()}
                  className="px-3 py-1 bg-xred-600 text-white text-sm rounded-lg hover:bg-xred-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Reply"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent("");
                    setError("");
                  }}
                  className="px-3 py-1 bg-gray-300 dark:bg-dark-600 text-gray-800 dark:text-gray-200 text-sm rounded-lg hover:bg-gray-400 dark:hover:bg-dark-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Load Replies Button */}
          {replyCount > 0 && (
            <button
              onClick={loadReplies}
              className="mt-3 text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              {isLoadingReplies ? (
                "Loading..."
              ) : showReplies ? (
                <>Hide {replyCount} {replyCount === 1 ? "reply" : "replies"}</>
              ) : (
                <>View {replyCount} {replyCount === 1 ? "reply" : "replies"}</>
              )}
            </button>
          )}

          {/* Nested Replies */}
          {showReplies && optimisticReplies.length > 0 && (
            <div className="mt-4 space-y-4">
              {optimisticReplies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  videoId={videoId}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                />
              ))}
              
              {/* Load More Replies */}
              {replyNextCursor && (
                <button
                  onClick={loadMoreReplies}
                  disabled={isLoadingReplies}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {isLoadingReplies ? "Loading..." : "Load more replies"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
