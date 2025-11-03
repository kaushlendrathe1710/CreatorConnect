import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function StoriesRail() {
  const { data: stories = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/stories/feed"],
  });

  if (isLoading) {
    return (
      <div className="mb-6 border rounded-lg p-4 bg-card">
        <p className="text-sm text-muted-foreground">Loading stories...</p>
      </div>
    );
  }

  return (
    <div className="mb-6 border rounded-lg p-4 bg-card">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4">
          {/* Add Story Button */}
          <div className="flex flex-col items-center gap-2 cursor-pointer hover-elevate p-2 rounded-lg" data-testid="button-add-story">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-muted">
                <AvatarImage src="" />
                <AvatarFallback>+</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1">
                <Plus className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
            <span className="text-xs font-medium">Your story</span>
          </div>

          {/* User Stories */}
          {stories.map((story: any) => (
            <div
              key={story.id}
              className="flex flex-col items-center gap-2 cursor-pointer hover-elevate p-2 rounded-lg"
              data-testid={`story-${story.userId}`}
            >
              <div className="relative">
                <div className="p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500 rounded-full">
                  <Avatar className="w-16 h-16 border-2 border-background">
                    <AvatarImage src={story.user?.profileImageUrl} />
                    <AvatarFallback>{story.user?.username?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-xs font-medium truncate max-w-[70px]">
                {story.user?.username}
              </span>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
