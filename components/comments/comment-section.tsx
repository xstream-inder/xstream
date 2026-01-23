"use client";

import { useState, useTransition, useOptimistic } from "react";
import { createComment, type CommentWithUser } from "@/server/actions/comment";
import CommentItem from "./comment-item";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/components/providers/auth-modal-provider";

type CommentSectionProps = {
  videoId: string;
  initialComments: CommentWithUser[];
  initialNextCursor: string | null;
};

export default function CommentSection({
  videoId,
  initialComments,
  initialNextCursor,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { openModal } = useAuthModal();
  const [comments, setComments] = useState<CommentWithUser[]>(initialComments);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  
  // Optimistic updates for new comments
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment: CommentWithUser) => [newComment, ...state]
  );

  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      openModal("signin");
      return;
    }

    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setError("");
    setIsSubmitting(true);

    // Optimistically add the comment
    const optimisticComment: CommentWithUser = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      userId: session.user.id!,
      videoId,
      parentId: null,
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
      addOptimisticComment(optimisticComment);
    });

    setContent("");

    const result = await createComment({
      content: content.trim(),
      videoId,
    });

    setIsSubmitting(false);

    if (result.success && result.comment) {
      // Replace optimistic comment with real one
      setComments((prev) => [result.comment!, ...prev.filter(c => c.id !== optimisticComment.id)]);
    } else {
      setError(result.error || "Failed to post comment");
      // Remove optimistic comment on error
      setComments((prev) => prev.filter(c => c.id !== optimisticComment.id));
    }
  };

  const loadMoreComments = async () => {
    if (!nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    
    try {
      const response = await fetch(
        `/api/comments?videoId=${videoId}&cursor=${nextCursor}&limit=10`
      );
      
      if (!response.ok) throw new Error("Failed to fetch comments");
      
      const data = await response.json();
      
      setComments((prev) => [...prev, ...data.comments]);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("Error loading more comments:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">
        Comments ({optimisticComments.length})
      </h2>

      {/* Comment Form */}
      {session?.user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            {session.user.avatarUrl && (
              <img
                src={session.user.avatarUrl}
                alt={session.user.username || "User"}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                maxLength={2000}
                disabled={isSubmitting}
              />
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {content.length}/2000
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="px-4 py-2 bg-xred-600 text-white rounded-lg hover:bg-xred-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Posting..." : "Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 border border-border rounded-lg text-center bg-card">
          <p className="text-muted-foreground">
            <button
              onClick={() => openModal("signin")}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </button>{" "}
            to leave a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {optimisticComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} videoId={videoId} />
        ))}

        {optimisticComments.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No comments yet. Be the first to comment!
          </p>
        )}

        {/* Load More Button */}
        {nextCursor && (
          <div className="flex justify-center pt-4">
            <button
              onClick={loadMoreComments}
              disabled={isLoadingMore}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? "Loading..." : "Load More Comments"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
