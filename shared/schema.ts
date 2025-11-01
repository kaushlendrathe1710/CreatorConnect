import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Reference: javascript_log_in_with_replit blueprint
// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table - extended for creator functionality
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  bio: text("bio"),
  isCreator: boolean("is_creator").default(false).notNull(),
  subscriptionPrice: integer("subscription_price"), // in cents
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeAccountId: varchar("stripe_account_id"), // for payouts
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Posts table
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  hashtags: text("hashtags").array(),
  isSubscriberOnly: boolean("is_subscriber_only").default(false).notNull(),
  likesCount: integer("likes_count").default(0).notNull(),
  commentsCount: integer("comments_count").default(0).notNull(),
  viewsCount: integer("views_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Follows table
export const follows = pgTable(
  "follows",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    followerId: varchar("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    followingId: varchar("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique().on(table.followerId, table.followingId),
    index("idx_follows_follower").on(table.followerId),
    index("idx_follows_following").on(table.followingId),
  ]
);

// Likes table
export const likes = pgTable(
  "likes",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique().on(table.userId, table.postId),
    index("idx_likes_post").on(table.postId),
    index("idx_likes_user").on(table.userId),
  ]
);

// Comments table
export const comments = pgTable(
  "comments",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_comments_post").on(table.postId),
    index("idx_comments_user").on(table.userId),
  ]
);

// Subscriptions table
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    subscriberId: varchar("subscriber_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    stripeSubscriptionId: varchar("stripe_subscription_id").unique(),
    status: varchar("status").notNull(), // active, cancelled, past_due
    currentPeriodEnd: timestamp("current_period_end"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique().on(table.subscriberId, table.creatorId),
    index("idx_subscriptions_subscriber").on(table.subscriberId),
    index("idx_subscriptions_creator").on(table.creatorId),
  ]
);

// Notifications table
export const notifications = pgTable(
  "notifications",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type").notNull(), // like, comment, follow, subscription
    actorId: varchar("actor_id").references(() => users.id, { onDelete: "cascade" }),
    postId: varchar("post_id").references(() => posts.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_notifications_user").on(table.userId),
    index("idx_notifications_created").on(table.createdAt),
  ]
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
  likes: many(likes),
  comments: many(comments),
  subscriptionsAsSubscriber: many(subscriptions, { relationName: "subscriber" }),
  subscriptionsAsCreator: many(subscriptions, { relationName: "creator" }),
  notifications: many(notifications),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  likes: many(likes),
  comments: many(comments),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  subscriber: one(users, {
    fields: [subscriptions.subscriberId],
    references: [users.id],
    relationName: "subscriber",
  }),
  creator: one(users, {
    fields: [subscriptions.creatorId],
    references: [users.id],
    relationName: "creator",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [notifications.postId],
    references: [posts.id],
  }),
}));

// Insert and select types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  likesCount: true,
  commentsCount: true,
  viewsCount: true,
  createdAt: true,
});
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type Follow = typeof follows.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
