import { InstagramLayout } from "@/components/InstagramLayout";
import { SearchBar } from "@/components/SearchBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/search/users?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <InstagramLayout>
      <div className="max-w-xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-6">Search</h2>
        
        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users, creators..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10"
            data-testid="input-search"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              data-testid="button-clear-search"
            >
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {searchQuery ? (
          <div className="space-y-2">
            {searchResults.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No users found
              </p>
            ) : (
              searchResults.map((user) => (
                <Card
                  key={user.id}
                  className="cursor-pointer hover-elevate"
                  onClick={() => setLocation(`/profile/${user.username}`)}
                  data-testid={`search-result-${user.username}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                        <AvatarFallback>{user.username?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{user.username}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.isCreator
                            ? "Creator"
                            : "User"}
                        </p>
                      </div>
                      {user.isCreator && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Creator
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Search for creators and users
            </p>
          </div>
        )}
      </div>
    </InstagramLayout>
  );
}
