import { ProfileHeader } from "../ProfileHeader";

export default function ProfileHeaderExample() {
  return (
    <div className="max-w-2xl mx-auto">
      <ProfileHeader
        username="sarahcreates"
        displayName="Sarah Creates"
        bio="Digital artist & content creator 🎨 Sharing exclusive tutorials and behind-the-scenes content"
        avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
        followers={15234}
        following={342}
        posts={128}
        isCreator={true}
        subscriptionPrice={9.99}
      />
    </div>
  );
}
