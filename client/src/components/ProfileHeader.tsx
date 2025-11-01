import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Settings, UserPlus, Check } from "lucide-react";
import { useState } from "react";

interface ProfileHeaderProps {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  followers: number;
  following: number;
  posts: number;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  isCreator?: boolean;
  subscriptionPrice?: number;
  isSubscribed?: boolean;
  onEditProfile?: () => void;
}

export function ProfileHeader({
  username,
  displayName,
  bio,
  avatarUrl,
  followers,
  following,
  posts,
  isOwnProfile = false,
  isFollowing: initialFollowing = false,
  isCreator = false,
  subscriptionPrice,
  isSubscribed: initialSubscribed = false,
  onEditProfile,
}: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [followerCount, setFollowerCount] = useState(followers);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowerCount(isFollowing ? followerCount - 1 : followerCount + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="text-2xl">{displayName[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold" data-testid="text-display-name">
                {displayName}
              </h1>
              {isCreator && (
                <Badge variant="secondary">Creator</Badge>
              )}
            </div>
            <p className="text-muted-foreground">@{username}</p>
          </div>

          <div className="flex gap-6 text-sm">
            <div>
              <span className="font-semibold" data-testid="text-posts">{posts}</span> posts
            </div>
            <div>
              <span className="font-semibold" data-testid="text-followers">
                {followerCount.toLocaleString()}
              </span>{" "}
              followers
            </div>
            <div>
              <span className="font-semibold" data-testid="text-following">{following}</span> following
            </div>
          </div>

          <p className="text-sm">{bio}</p>

          <div className="flex flex-wrap gap-3">
            {isOwnProfile ? (
              <Button 
                variant="secondary" 
                onClick={onEditProfile}
                data-testid="button-edit-profile"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant={isFollowing ? "secondary" : "default"}
                  onClick={handleFollow}
                  data-testid="button-follow"
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
                {isCreator && subscriptionPrice && (
                  <Button
                    variant={isSubscribed ? "outline" : "default"}
                    onClick={() => setIsSubscribed(!isSubscribed)}
                    data-testid="button-subscribe"
                  >
                    {isSubscribed ? "Subscribed" : `Subscribe $${(subscriptionPrice / 100).toFixed(2)}/mo`}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
