// Reference: javascript_database and javascript_log_in_with_replit blueprints
import {
  users,
  posts,
  follows,
  likes,
  comments,
  subscriptions,
  notifications,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, or, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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
}

export const storage = new DatabaseStorage();
