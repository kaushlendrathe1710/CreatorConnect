import { Heart, MessageCircle, Share2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CommentsSection } from "@/components/CommentsSection";
import { useState } from "react";

interface PostCardProps {
  postId: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
  imageUrl?: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
  isSubscriberOnly?: boolean;
  isCreator?: boolean;
  hasLiked?: boolean;
  canView?: boolean;
}

export function PostCard({
  postId,
  username,
  displayName,
  avatarUrl,
  imageUrl,
  caption,
  likes,
  comments,
  timestamp,
  isSubscriberOnly = false,
  isCreator = false,
  hasLiked = false,
  canView = true,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(hasLiked);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = async () => {
    try {
      const method = isLiked ? "DELETE" : "POST";
      const response = await fetch(`/api/posts/${postId}/like`, {
        method,
        credentials: "include",
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <div className="bg-card border border-card-border rounded-md overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{displayName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm" data-testid="text-username">
              {displayName}
            </span>
            {isCreator && (
              <Badge variant="secondary" className="h-5 text-xs">
                Creator
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">@{username}</span>
        </div>
      </div>

      {imageUrl && (
        <div className="relative">
          <img
            src={imageUrl}
            alt="Post content"
            className="w-full aspect-square object-cover"
          />
          {isSubscriberOnly && !canView && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center text-white">
                <Lock className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm font-medium">Subscribe to view</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className={isLiked ? "text-red-500" : ""}
            onClick={handleLike}
            data-testid="button-like"
          >
            <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" data-testid="button-comment">
            <MessageCircle className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" data-testid="button-share">
            <Share2 className="w-6 h-6" />
          </Button>
        </div>

        <div>
          <p className="text-sm font-semibold mb-1" data-testid="text-likes">
            {likeCount.toLocaleString()} likes
          </p>
          <p className="text-sm">
            <span className="font-semibold">{username}</span> {caption}
          </p>
        </div>

        {canView && <CommentsSection postId={postId} initialCount={comments} />}

        <p className="text-xs text-muted-foreground">{timestamp}</p>
      </div>
    </div>
  );
}
