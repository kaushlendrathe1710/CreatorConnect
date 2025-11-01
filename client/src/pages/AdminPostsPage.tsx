import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Lock } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminPostsPage() {
  const { toast } = useToast();
  
  const { data: posts = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/posts"],
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return apiRequest(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      toast({
        title: "Post Deleted",
        description: "Post has been removed from the platform",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold" data-testid="admin-posts-title">
            Content Management
          </h2>
          <p className="text-muted-foreground mt-2">
            Manage all posts and content on the platform
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: any) => (
              <Card key={post.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={post.imageUrl}
                    alt={post.caption || "Post"}
                    className="w-full h-full object-cover"
                  />
                  {post.isSubscriberOnly && (
                    <div className="absolute top-2 right-2">
                      <Lock className="w-5 h-5 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm line-clamp-2">{post.caption || "No caption"}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>❤️ {post.likesCount || 0} likes</span>
                    <span>💬 {post.commentsCount || 0} comments</span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => deletePostMutation.mutate(post.id)}
                    disabled={deletePostMutation.isPending}
                    data-testid={`button-delete-post-${post.id}`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Post
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
