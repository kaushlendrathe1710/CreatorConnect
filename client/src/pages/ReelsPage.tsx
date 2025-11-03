import { useQuery } from "@tanstack/react-query";
import { InstagramLayout } from "@/components/InstagramLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Send, MoreVertical, Play } from "lucide-react";
import { useState } from "react";

export default function ReelsPage() {
  const { data: reels = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/reels/feed"],
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) {
    return (
      <InstagramLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading reels...</p>
        </div>
      </InstagramLayout>
    );
  }

  if (reels.length === 0) {
    return (
      <InstagramLayout>
        <div className="text-center py-12">
          <Play className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-2">No reels yet</p>
          <p className="text-sm text-muted-foreground">
            Reels will appear here when creators post them
          </p>
        </div>
      </InstagramLayout>
    );
  }

  const currentReel = reels[currentIndex];

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <InstagramLayout>
      <div className="h-[calc(100vh-64px)] relative bg-black">
        {/* Reel Video Container */}
        <div className="h-full flex items-center justify-center">
          <div className="relative w-full max-w-md h-full bg-black">
            {/* Video would go here - placeholder for now */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/30 flex items-center justify-center">
              <Play className="w-20 h-20 text-white/80" />
            </div>

            {/* Reel Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              {/* User Info */}
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="w-8 h-8 border-2 border-white">
                  <AvatarImage src={currentReel.user?.profileImageUrl} />
                  <AvatarFallback>{currentReel.user?.username?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm">{currentReel.user?.username}</span>
                <Button size="sm" variant="outline" className="ml-2 h-7 text-xs">
                  Follow
                </Button>
              </div>

              {/* Caption */}
              {currentReel.caption && (
                <p className="text-sm mb-2">{currentReel.caption}</p>
              )}
            </div>

            {/* Action Buttons (Right Side) */}
            <div className="absolute right-4 bottom-20 flex flex-col gap-4">
              <button 
                className="flex flex-col items-center gap-1"
                data-testid="button-like-reel"
              >
                <Heart className="w-7 h-7 text-white" />
                <span className="text-white text-xs font-semibold">
                  {currentReel.likesCount || 0}
                </span>
              </button>

              <button 
                className="flex flex-col items-center gap-1"
                data-testid="button-comment-reel"
              >
                <MessageCircle className="w-7 h-7 text-white" />
                <span className="text-white text-xs font-semibold">
                  {currentReel.commentsCount || 0}
                </span>
              </button>

              <button 
                className="flex flex-col items-center gap-1"
                data-testid="button-share-reel"
              >
                <Send className="w-7 h-7 text-white" />
              </button>

              <button 
                className="flex flex-col items-center gap-1"
                data-testid="button-more-reel"
              >
                <MoreVertical className="w-7 h-7 text-white" />
              </button>
            </div>

            {/* Navigation Arrows */}
            {currentIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover-elevate"
                data-testid="button-previous-reel"
              >
                ↑
              </button>
            )}
            {currentIndex < reels.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover-elevate"
                data-testid="button-next-reel"
              >
                ↓
              </button>
            )}
          </div>
        </div>

        {/* Reel Counter */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {reels.length}
        </div>
      </div>
    </InstagramLayout>
  );
}
