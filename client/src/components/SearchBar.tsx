import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Post } from "@shared/schema";

interface SearchUser {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  isCreator: boolean;
  bio: string | null;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const isHashtagQuery = query.startsWith("#");

  const { data: users = [], isLoading: usersLoading } = useQuery<SearchUser[]>({
    queryKey: ["/api/search/users", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || isHashtagQuery) return [];
      const response = await fetch(`/api/search/users?q=${encodeURIComponent(debouncedQuery)}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: debouncedQuery.length > 0 && !isHashtagQuery,
  });

  const { data: hashtagPosts = [], isLoading: hashtagsLoading } = useQuery<Post[]>({
    queryKey: ["/api/search/hashtags", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || !isHashtagQuery) return [];
      const hashtag = debouncedQuery.slice(1); // Remove #
      const response = await fetch(`/api/search/hashtags?q=${encodeURIComponent(hashtag)}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: debouncedQuery.length > 1 && isHashtagQuery,
  });

  const handleUserClick = (username: string) => {
    setQuery("");
    setOpen(false);
    setLocation(`/profile/${username}`);
  };

  const isLoading = usersLoading || hashtagsLoading;

  return (
    <Popover open={open && query.length > 0} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users, hashtags..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => query.length > 0 && setOpen(true)}
            className="pl-9 pr-9"
            data-testid="input-search"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => {
                setQuery("");
                setOpen(false);
              }}
              data-testid="button-clear-search"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Searching...
          </div>
        ) : isHashtagQuery ? (
          hashtagPosts.length > 0 ? (
            <div className="divide-y max-h-96 overflow-y-auto">
              <div className="p-3 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  <p className="font-semibold">{query}</p>
                  <span className="text-sm text-muted-foreground">
                    {hashtagPosts.length} {hashtagPosts.length === 1 ? 'post' : 'posts'}
                  </span>
                </div>
              </div>
              {hashtagPosts.slice(0, 10).map((post) => (
                <button
                  key={post.id}
                  onClick={() => {
                    setQuery("");
                    setOpen(false);
                    // Could navigate to a post detail page or stay on feed
                  }}
                  className="w-full p-3 hover-elevate text-left"
                  data-testid={`search-result-post-${post.id}`}
                >
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post preview"
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                  )}
                  {post.caption && (
                    <p className="text-sm line-clamp-2">{post.caption}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{post.likesCount} likes</span>
                    <span>{post.commentsCount} comments</span>
                  </div>
                </button>
              ))}
            </div>
          ) : debouncedQuery.length > 1 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No posts found for {query}
            </div>
          ) : null
        ) : users.length > 0 ? (
          <div className="divide-y max-h-96 overflow-y-auto">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserClick(user.username)}
                className="w-full flex items-center gap-3 p-3 hover-elevate text-left"
                data-testid={`search-result-${user.username}`}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={user.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                  />
                  <AvatarFallback>
                    {user.firstName?.[0] || user.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.username}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    @{user.username}
                  </p>
                </div>
                {user.isCreator && (
                  <span className="text-xs text-muted-foreground">Creator</span>
                )}
              </button>
            ))}
          </div>
        ) : debouncedQuery.length > 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No users found
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
