// Reference: javascript_database and javascript_log_in_with_replit blueprints
import {
  users,
  posts,
  follows,
  likes,
  comments,
  subscriptions,
  notifications,
  mediaAssets,
  postMedia,
  storySequences,
  storyItems,
  storyViews,
  reels,
  reelLikes,
  reelComments,
  conversations,
  conversationParticipants,
  messages,
  type User,
  type UpsertUser,
  type Post,
  type InsertPost,
  type Comment,
  type InsertComment,
  type Follow,
  type Like,
  type Subscription,
  type Notification,
  type MediaAsset,
  type InsertMediaAsset,
  type PostMedia,
  type InsertPostMedia,
  type StorySequence,
  type InsertStorySequence,
  type StoryItem,
  type InsertStoryItem,
  type Reel,
  type InsertReel,
  type ReelComment,
  type InsertReelComment,
  type Conversation,
  type InsertConversation,
  type ConversationParticipant,
  type InsertConversationParticipant,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, or, inArray, ilike, gt, lt } from "drizzle-orm";

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: UpsertUser): Promise<User>;
  
  // User profile operations
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: string): Promise<Post | undefined>;
  getPostsByUser(userId: string, limit?: number): Promise<Post[]>;
  getFeedPosts(userId: string, limit?: number): Promise<Post[]>;
  getExplorePosts(limit?: number): Promise<Post[]>;
  deletePost(id: string): Promise<void>;
  incrementPostLikes(postId: string): Promise<void>;
  decrementPostLikes(postId: string): Promise<void>;
  incrementPostComments(postId: string): Promise<void>;
  incrementPostViews(postId: string): Promise<void>;
  
  // Follow operations
  createFollow(followerId: string, followingId: string): Promise<Follow>;
  deleteFollow(followerId: string, followingId: string): Promise<void>;
  getFollowers(userId: string): Promise<Follow[]>;
  getFollowing(userId: string): Promise<Follow[]>;
  getFollowersCount(userId: string): Promise<number>;
  getFollowingCount(userId: string): Promise<number>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  
  // Like operations
  createLike(userId: string, postId: string): Promise<Like>;
  deleteLike(userId: string, postId: string): Promise<void>;
  hasLiked(userId: string, postId: string): Promise<boolean>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: string): Promise<Comment[]>;
  
  // Subscription operations
  createSubscription(subscriberId: string, creatorId: string, stripeSubscriptionId: string): Promise<Subscription>;
  updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription>;
  getSubscription(subscriberId: string, creatorId: string): Promise<Subscription | undefined>;
  getSubscriptionsByCreator(creatorId: string): Promise<Subscription[]>;
  getSubscriptionsBySubscriber(subscriberId: string): Promise<Subscription[]>;
  getActiveSubscribersCount(creatorId: string): Promise<number>;
  hasActiveSubscription(subscriberId: string, creatorId: string): Promise<boolean>;
  
  // Notification operations
  createNotification(notification: Omit<Notification, "id" | "createdAt">): Promise<Notification>;
  getNotificationsByUser(userId: string, limit?: number): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
  
  // Search operations
  searchUsers(query: string, limit?: number): Promise<User[]>;
  searchPostsByHashtag(hashtag: string, limit?: number): Promise<Post[]>;
  
  // Media Asset operations
  createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset>;
  getMediaAsset(id: string): Promise<MediaAsset | undefined>;
  getMediaAssetsByUser(userId: string, limit?: number): Promise<MediaAsset[]>;
  
  // Post Media operations (for carousel)
  createPostMedia(postMedia: InsertPostMedia): Promise<PostMedia>;
  getPostMedia(postId: string): Promise<PostMedia[]>;
  
  // Story operations
  createStorySequence(sequence: InsertStorySequence): Promise<StorySequence>;
  createStoryItem(item: InsertStoryItem): Promise<StoryItem>;
  getActiveStories(userId: string): Promise<any[]>; // Stories from followed users
  getUserStories(userId: string): Promise<any>;
  deleteStory(storyId: string): Promise<void>;
  deleteExpiredStories(): Promise<void>;
  createStoryView(storyItemId: string, userId: string): Promise<void>;
  
  // Reel operations
  createReel(reel: InsertReel): Promise<Reel>;
  getReel(id: string): Promise<Reel | undefined>;
  getReelsFeed(userId: string, limit?: number): Promise<any[]>;
  getUserReels(userId: string, limit?: number): Promise<Reel[]>;
  createReelLike(userId: string, reelId: string): Promise<void>;
  deleteReelLike(userId: string, reelId: string): Promise<void>;
  hasLikedReel(userId: string, reelId: string): Promise<boolean>;
  incrementReelLikes(reelId: string): Promise<void>;
  decrementReelLikes(reelId: string): Promise<void>;
  incrementReelViews(reelId: string): Promise<void>;
  createReelComment(comment: InsertReelComment): Promise<ReelComment>;
  getReelComments(reelId: string): Promise<ReelComment[]>;
  
  // Direct Message operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | undefined>;
  getUserConversations(userId: string): Promise<any[]>;
  findDirectConversation(userId1: string, userId2: string): Promise<Conversation | undefined>;
  addConversationParticipant(participant: InsertConversationParticipant): Promise<ConversationParticipant>;
  getConversationParticipants(conversationId: string): Promise<ConversationParticipant[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(conversationId: string, limit?: number): Promise<Message[]>;
  markConversationAsRead(conversationId: string, userId: string): Promise<void>;
  updateConversationTimestamp(conversationId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const updateData: Partial<User> = { stripeCustomerId };
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async getPostsByUser(userId: string, limit: number = 50): Promise<Post[]> {
    return db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async getFeedPosts(userId: string, limit: number = 50): Promise<Post[]> {
    // Get posts from users that the current user follows
    const followingUsers = await db
      .select({ id: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));

    if (followingUsers.length === 0) {
      return [];
    }

    const followingIds = followingUsers.map(f => f.id);
    
    return db
      .select()
      .from(posts)
      .where(inArray(posts.userId, followingIds))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async getExplorePosts(limit: number = 50): Promise<Post[]> {
    return db
      .select()
      .from(posts)
      .where(eq(posts.isSubscriberOnly, false))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async incrementPostLikes(postId: string): Promise<void> {
    await db
      .update(posts)
      .set({ likesCount: sql`${posts.likesCount} + 1` })
      .where(eq(posts.id, postId));
  }

  async decrementPostLikes(postId: string): Promise<void> {
    await db
      .update(posts)
      .set({ likesCount: sql`${posts.likesCount} - 1` })
      .where(eq(posts.id, postId));
  }

  async incrementPostComments(postId: string): Promise<void> {
    await db
      .update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, postId));
  }

  async incrementPostViews(postId: string): Promise<void> {
    await db
      .update(posts)
      .set({ viewsCount: sql`${posts.viewsCount} + 1` })
      .where(eq(posts.id, postId));
  }

  // Follow operations
  async createFollow(followerId: string, followingId: string): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values({ followerId, followingId })
      .returning();
    return follow;
  }

  async deleteFollow(followerId: string, followingId: string): Promise<void> {
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  }

  async getFollowers(userId: string): Promise<Follow[]> {
    return db.select().from(follows).where(eq(follows.followingId, userId));
  }

  async getFollowing(userId: string): Promise<Follow[]> {
    return db.select().from(follows).where(eq(follows.followerId, userId));
  }

  async getFollowersCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followingId, userId));
    return Number(result[0]?.count || 0);
  }

  async getFollowingCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followerId, userId));
    return Number(result[0]?.count || 0);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    return !!follow;
  }

  // Like operations
  async createLike(userId: string, postId: string): Promise<Like> {
    const [like] = await db.insert(likes).values({ userId, postId }).returning();
    return like;
  }

  async deleteLike(userId: string, postId: string): Promise<void> {
    await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
  }

  async hasLiked(userId: string, postId: string): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    return !!like;
  }

  // Comment operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getCommentsByPost(postId: string): Promise<Comment[]> {
    return db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }

  // Subscription operations
  async createSubscription(
    subscriberId: string,
    creatorId: string,
    stripeSubscriptionId: string
  ): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values({
        subscriberId,
        creatorId,
        stripeSubscriptionId,
        status: "active",
      })
      .returning();
    return subscription;
  }

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription;
  }

  async getSubscription(subscriberId: string, creatorId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.subscriberId, subscriberId),
          eq(subscriptions.creatorId, creatorId)
        )
      );
    return subscription;
  }

  async getSubscriptionsByCreator(creatorId: string): Promise<Subscription[]> {
    return db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.creatorId, creatorId))
      .orderBy(desc(subscriptions.createdAt));
  }

  async getSubscriptionsBySubscriber(subscriberId: string): Promise<Subscription[]> {
    return db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.subscriberId, subscriberId))
      .orderBy(desc(subscriptions.createdAt));
  }

  async getActiveSubscribersCount(creatorId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.creatorId, creatorId),
          eq(subscriptions.status, "active")
        )
      );
    return Number(result[0]?.count || 0);
  }

  async hasActiveSubscription(subscriberId: string, creatorId: string): Promise<boolean> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.subscriberId, subscriberId),
          eq(subscriptions.creatorId, creatorId),
          eq(subscriptions.status, "active")
        )
      );
    return !!subscription;
  }

  // Notification operations
  async createNotification(
    notification: Omit<Notification, "id" | "createdAt">
  ): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification as any)
      .returning();
    return newNotification;
  }

  async getNotificationsByUser(userId: string, limit: number = 50): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return Number(result[0]?.count || 0);
  }

  // Search operations
  async searchUsers(query: string, limit: number = 20): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.username, `%${query}%`),
          ilike(users.firstName, `%${query}%`),
          ilike(users.lastName, `%${query}%`)
        )
      )
      .limit(limit);
  }

  async searchPostsByHashtag(hashtag: string, limit: number = 50): Promise<Post[]> {
    // Remove # if present
    const cleanHashtag = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;
    
    return db
      .select()
      .from(posts)
      .where(sql`${posts.hashtags} @> ARRAY[${cleanHashtag}]::text[]`)
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  // Media Asset operations
  async createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset> {
    const [newAsset] = await db.insert(mediaAssets).values(asset).returning();
    return newAsset;
  }

  async getMediaAsset(id: string): Promise<MediaAsset | undefined> {
    const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
    return asset;
  }

  async getMediaAssetsByUser(userId: string, limit: number = 100): Promise<MediaAsset[]> {
    return db.select().from(mediaAssets).where(eq(mediaAssets.userId, userId)).orderBy(desc(mediaAssets.createdAt)).limit(limit);
  }

  // Post Media operations
  async createPostMedia(pm: InsertPostMedia): Promise<PostMedia> {
    const [newPostMedia] = await db.insert(postMedia).values(pm).returning();
    return newPostMedia;
  }

  async getPostMedia(postId: string): Promise<PostMedia[]> {
    return db.select().from(postMedia).where(eq(postMedia.postId, postId)).orderBy(postMedia.orderIndex);
  }

  // Story operations
  async createStorySequence(sequence: InsertStorySequence): Promise<StorySequence> {
    const [newSequence] = await db.insert(storySequences).values(sequence).returning();
    return newSequence;
  }

  async createStoryItem(item: InsertStoryItem): Promise<StoryItem> {
    const [newItem] = await db.insert(storyItems).values(item).returning();
    return newItem;
  }

  async getActiveStories(userId: string): Promise<any[]> {
    // Get stories from users that current user follows
    const followingUsers = await db.select({ id: follows.followingId }).from(follows).where(eq(follows.followerId, userId));
    if (followingUsers.length === 0) return [];
    
    const followingIds = followingUsers.map(f => f.id);
    const now = new Date();
    
    // Get non-expired story sequences
    const sequences = await db
      .select()
      .from(storySequences)
      .where(and(inArray(storySequences.userId, followingIds), gt(storySequences.expiresAt, now), eq(storySequences.isHighlight, false)))
      .orderBy(desc(storySequences.createdAt));
    
    return sequences;
  }

  async getUserStories(userId: string): Promise<any> {
    const now = new Date();
    const [sequence] = await db
      .select()
      .from(storySequences)
      .where(and(eq(storySequences.userId, userId), gt(storySequences.expiresAt, now), eq(storySequences.isHighlight, false)))
      .orderBy(desc(storySequences.createdAt))
      .limit(1);
    
    if (!sequence) return null;
    
    const items = await db.select().from(storyItems).where(eq(storyItems.sequenceId, sequence.id)).orderBy(storyItems.orderIndex);
    return { ...sequence, items };
  }

  async deleteStory(storyId: string): Promise<void> {
    await db.delete(storySequences).where(eq(storySequences.id, storyId));
  }

  async deleteExpiredStories(): Promise<void> {
    const now = new Date();
    await db.delete(storySequences).where(and(lt(storySequences.expiresAt, now), eq(storySequences.isHighlight, false)));
  }

  async createStoryView(storyItemId: string, userId: string): Promise<void> {
    await db.insert(storyViews).values({ storyItemId, userId }).onConflictDoNothing();
    await db.update(storyItems).set({ viewsCount: sql`${storyItems.viewsCount} + 1` }).where(eq(storyItems.id, storyItemId));
  }

  // Reel operations
  async createReel(reel: InsertReel): Promise<Reel> {
    const [newReel] = await db.insert(reels).values(reel).returning();
    return newReel;
  }

  async getReel(id: string): Promise<Reel | undefined> {
    const [reel] = await db.select().from(reels).where(eq(reels.id, id));
    return reel;
  }

  async getReelsFeed(userId: string, limit: number = 20): Promise<any[]> {
    return db.select().from(reels).orderBy(desc(reels.createdAt)).limit(limit);
  }

  async getUserReels(userId: string, limit: number = 50): Promise<Reel[]> {
    return db.select().from(reels).where(eq(reels.userId, userId)).orderBy(desc(reels.createdAt)).limit(limit);
  }

  async createReelLike(userId: string, reelId: string): Promise<void> {
    await db.insert(reelLikes).values({ userId, reelId });
    await this.incrementReelLikes(reelId);
  }

  async deleteReelLike(userId: string, reelId: string): Promise<void> {
    await db.delete(reelLikes).where(and(eq(reelLikes.userId, userId), eq(reelLikes.reelId, reelId)));
    await this.decrementReelLikes(reelId);
  }

  async hasLikedReel(userId: string, reelId: string): Promise<boolean> {
    const [like] = await db.select().from(reelLikes).where(and(eq(reelLikes.userId, userId), eq(reelLikes.reelId, reelId)));
    return !!like;
  }

  async incrementReelLikes(reelId: string): Promise<void> {
    await db.update(reels).set({ likesCount: sql`${reels.likesCount} + 1` }).where(eq(reels.id, reelId));
  }

  async decrementReelLikes(reelId: string): Promise<void> {
    await db.update(reels).set({ likesCount: sql`${reels.likesCount} - 1` }).where(eq(reels.id, reelId));
  }

  async incrementReelViews(reelId: string): Promise<void> {
    await db.update(reels).set({ viewsCount: sql`${reels.viewsCount} + 1` }).where(eq(reels.id, reelId));
  }

  async createReelComment(comment: InsertReelComment): Promise<ReelComment> {
    const [newComment] = await db.insert(reelComments).values(comment).returning();
    await db.update(reels).set({ commentsCount: sql`${reels.commentsCount} + 1` }).where(eq(reels.id, comment.reelId));
    return newComment;
  }

  async getReelComments(reelId: string): Promise<ReelComment[]> {
    return db.select().from(reelComments).where(eq(reelComments.reelId, reelId)).orderBy(desc(reelComments.createdAt));
  }

  // Direct Message operations
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConv] = await db.insert(conversations).values(conversation).returning();
    return newConv;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conv;
  }

  async getUserConversations(userId: string): Promise<any[]> {
    const userConvs = await db
      .select({ conversationId: conversationParticipants.conversationId })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, userId));
    
    if (userConvs.length === 0) return [];
    
    const convIds = userConvs.map(c => c.conversationId);
    return db.select().from(conversations).where(inArray(conversations.id, convIds)).orderBy(desc(conversations.lastMessageAt));
  }

  async findDirectConversation(userId1: string, userId2: string): Promise<Conversation | undefined> {
    const user1Convs = await db
      .select({ conversationId: conversationParticipants.conversationId })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, userId1));
    
    const user2Convs = await db
      .select({ conversationId: conversationParticipants.conversationId })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, userId2));
    
    const user1ConvIds = user1Convs.map(c => c.conversationId);
    const user2ConvIds = user2Convs.map(c => c.conversationId);
    const sharedConvId = user1ConvIds.find(id => user2ConvIds.includes(id));
    
    if (!sharedConvId) return undefined;
    
    const [conv] = await db.select().from(conversations).where(and(eq(conversations.id, sharedConvId), eq(conversations.type, "direct")));
    return conv;
  }

  async addConversationParticipant(participant: InsertConversationParticipant): Promise<ConversationParticipant> {
    const [newParticipant] = await db.insert(conversationParticipants).values(participant).returning();
    return newParticipant;
  }

  async getConversationParticipants(conversationId: string): Promise<ConversationParticipant[]> {
    const participants = await db.select().from(conversationParticipants).where(eq(conversationParticipants.conversationId, conversationId));
    return participants;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    await this.updateConversationTimestamp(message.conversationId);
    return newMessage;
  }

  async getMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(desc(messages.createdAt)).limit(limit);
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    await db
      .update(conversationParticipants)
      .set({ lastReadAt: new Date() })
      .where(and(eq(conversationParticipants.conversationId, conversationId), eq(conversationParticipants.userId, userId)));
  }

  async updateConversationTimestamp(conversationId: string): Promise<void> {
    await db.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, conversationId));
  }
}

export const storage = new DatabaseStorage();
