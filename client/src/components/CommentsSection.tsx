import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

interface CommentsSectionProps {
  postId: number;
  initialCount: number;
}

export function CommentsSection({ postId, initialCount }: CommentsSectionProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();

  const { data: comments = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/posts", postId, "comments"],
    enabled: showComments,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/posts/${postId}/comments`, { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
      setNewComment("");
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment.trim());
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowComments(!showComments)}
        className="text-sm text-muted-foreground hover:text-foreground"
        data-testid="button-toggle-comments"
      >
        {showComments ? "Hide" : "View all"} {initialCount} comments
      </button>

      {showComments && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.user?.avatarUrl} />
                    <AvatarFallback>
                      {comment.user?.firstName?.[0] || comment.user?.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted rounded-md p-3">
                      <p className="text-sm font-semibold">
                        {`${comment.user?.firstName || ""} ${comment.user?.lastName || ""}`.trim() ||
                          comment.user?.username ||
                          "Unknown"}
                      </p>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-3">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
              data-testid="input-comment"
            />
            <Button
              onClick={handleSubmit}
              disabled={createCommentMutation.isPending || !newComment.trim()}
              data-testid="button-post-comment"
            >
              {createCommentMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
