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
  phoneNumber: varchar("phone_number"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  bio: text("bio"),
  isCreator: boolean("is_creator").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
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
  imageUrl: text("image_url"), // Legacy field, nullable for backward compatibility
  mediaType: varchar("media_type").default("image"), // image, video, carousel
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

// ===== MEDIA ASSETS =====
// Shared media storage for posts, stories, reels
export const mediaAssets = pgTable(
  "media_assets",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    storagePath: text("storage_path").notNull(), // GCS path
    mediaType: varchar("media_type").notNull(), // image, video
    mimeType: varchar("mime_type"),
    durationMs: integer("duration_ms"), // for videos
    width: integer("width"),
    height: integer("height"),
    fileSize: integer("file_size"), // bytes
    thumbnailPath: text("thumbnail_path"), // for videos
    metadata: jsonb("metadata"), // additional metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_media_user").on(table.userId),
    index("idx_media_type").on(table.mediaType),
  ]
);

// Post media join table (for carousel posts)
export const postMedia = pgTable(
  "post_media",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    mediaAssetId: varchar("media_asset_id").notNull().references(() => mediaAssets.id, { onDelete: "cascade" }),
    orderIndex: integer("order_index").notNull().default(0),
    caption: text("caption"), // optional per-media caption
  },
  (table) => [
    unique().on(table.postId, table.mediaAssetId), // Prevent duplicate media in same post
    unique().on(table.postId, table.orderIndex), // Ensure unique ordering
    index("idx_post_media_post").on(table.postId),
    index("idx_post_media_asset").on(table.mediaAssetId),
  ]
);

// ===== STORIES =====
// Story sequences (groups of story items, expires in 24h)
export const storySequences = pgTable(
  "story_sequences",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    isHighlight: boolean("is_highlight").default(false).notNull(),
    highlightTitle: varchar("highlight_title"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_story_sequences_user").on(table.userId),
    index("idx_story_sequences_expires").on(table.expiresAt),
  ]
);

// Individual story items
export const storyItems = pgTable(
  "story_items",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    sequenceId: varchar("sequence_id").notNull().references(() => storySequences.id, { onDelete: "cascade" }),
    mediaAssetId: varchar("media_asset_id").notNull().references(() => mediaAssets.id, { onDelete: "cascade" }),
    caption: text("caption"),
    link: text("link"),
    orderIndex: integer("order_index").notNull().default(0),
    viewsCount: integer("views_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_story_items_sequence").on(table.sequenceId),
    index("idx_story_items_media").on(table.mediaAssetId),
  ]
);

// Story views tracking
export const storyViews = pgTable(
  "story_views",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    storyItemId: varchar("story_item_id").notNull().references(() => storyItems.id, { onDelete: "cascade" }),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique().on(table.storyItemId, table.userId),
    index("idx_story_views_story").on(table.storyItemId),
    index("idx_story_views_user").on(table.userId),
  ]
);

// ===== REELS =====
// Short-form vertical videos
export const reels = pgTable(
  "reels",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    mediaAssetId: varchar("media_asset_id").notNull().references(() => mediaAssets.id, { onDelete: "cascade" }),
    caption: text("caption"),
    hashtags: text("hashtags").array(),
    audioTrack: jsonb("audio_track"), // audio metadata
    likesCount: integer("likes_count").default(0).notNull(),
    viewsCount: integer("views_count").default(0).notNull(),
    commentsCount: integer("comments_count").default(0).notNull(),
    sharesCount: integer("shares_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_reels_user").on(table.userId),
    index("idx_reels_created").on(table.createdAt),
  ]
);

// Reel likes
export const reelLikes = pgTable(
  "reel_likes",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    reelId: varchar("reel_id").notNull().references(() => reels.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique().on(table.userId, table.reelId),
    index("idx_reel_likes_reel").on(table.reelId),
    index("idx_reel_likes_user").on(table.userId),
  ]
);

// Reel comments
export const reelComments = pgTable(
  "reel_comments",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    reelId: varchar("reel_id").notNull().references(() => reels.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_reel_comments_reel").on(table.reelId),
    index("idx_reel_comments_user").on(table.userId),
  ]
);

// ===== DIRECT MESSAGES =====
// Conversations
export const conversations = pgTable(
  "conversations",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    type: varchar("type").notNull().default("direct"), // direct, group
    title: varchar("title"), // for group chats
    lastMessageAt: timestamp("last_message_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_conversations_last_message").on(table.lastMessageAt),
  ]
);

// Conversation participants
export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role").default("member"), // member, admin (for groups)
    lastReadAt: timestamp("last_read_at"),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [
    unique().on(table.conversationId, table.userId),
    index("idx_conversation_participants_conversation").on(table.conversationId),
    index("idx_conversation_participants_user").on(table.userId),
  ]
);

// Messages - using 'any' type to avoid circular reference in self-referencing FK
export const messages: any = pgTable(
  "messages",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    content: text("content"),
    mediaAssetId: varchar("media_asset_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    replyToId: varchar("reply_to_id"), // Self-reference, will add FK via raw SQL after table creation
    status: varchar("status").default("sent"), // sent, delivered, read
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_messages_conversation").on(table.conversationId),
    index("idx_messages_sender").on(table.senderId),
    index("idx_messages_created").on(table.createdAt),
    index("idx_messages_reply_to").on(table.replyToId),
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
  mediaAssets: many(mediaAssets),
  storySequences: many(storySequences),
  reels: many(reels),
  conversationParticipants: many(conversationParticipants),
  messages: many(messages),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  likes: many(likes),
  comments: many(comments),
  postMedia: many(postMedia),
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

export const mediaAssetsRelations = relations(mediaAssets, ({ one, many }) => ({
  user: one(users, {
    fields: [mediaAssets.userId],
    references: [users.id],
  }),
  postMedia: many(postMedia),
  storyItems: many(storyItems),
  reels: many(reels),
  messages: many(messages),
}));

export const postMediaRelations = relations(postMedia, ({ one }) => ({
  post: one(posts, {
    fields: [postMedia.postId],
    references: [posts.id],
  }),
  mediaAsset: one(mediaAssets, {
    fields: [postMedia.mediaAssetId],
    references: [mediaAssets.id],
  }),
}));

export const storySequencesRelations = relations(storySequences, ({ one, many }) => ({
  user: one(users, {
    fields: [storySequences.userId],
    references: [users.id],
  }),
  storyItems: many(storyItems),
}));

export const storyItemsRelations = relations(storyItems, ({ one, many }) => ({
  sequence: one(storySequences, {
    fields: [storyItems.sequenceId],
    references: [storySequences.id],
  }),
  mediaAsset: one(mediaAssets, {
    fields: [storyItems.mediaAssetId],
    references: [mediaAssets.id],
  }),
  views: many(storyViews),
}));

export const storyViewsRelations = relations(storyViews, ({ one }) => ({
  storyItem: one(storyItems, {
    fields: [storyViews.storyItemId],
    references: [storyItems.id],
  }),
  user: one(users, {
    fields: [storyViews.userId],
    references: [users.id],
  }),
}));

export const reelsRelations = relations(reels, ({ one, many }) => ({
  user: one(users, {
    fields: [reels.userId],
    references: [users.id],
  }),
  mediaAsset: one(mediaAssets, {
    fields: [reels.mediaAssetId],
    references: [mediaAssets.id],
  }),
  likes: many(reelLikes),
  comments: many(reelComments),
}));

export const reelLikesRelations = relations(reelLikes, ({ one }) => ({
  user: one(users, {
    fields: [reelLikes.userId],
    references: [users.id],
  }),
  reel: one(reels, {
    fields: [reelLikes.reelId],
    references: [reels.id],
  }),
}));

export const reelCommentsRelations = relations(reelComments, ({ one }) => ({
  user: one(users, {
    fields: [reelComments.userId],
    references: [users.id],
  }),
  reel: one(reels, {
    fields: [reelComments.reelId],
    references: [reels.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  mediaAsset: one(mediaAssets, {
    fields: [messages.mediaAssetId],
    references: [mediaAssets.id],
  }),
  replyTo: one(messages, {
    fields: [messages.replyToId],
    references: [messages.id],
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

// Media Assets
export const insertMediaAssetSchema = createInsertSchema(mediaAssets).omit({
  id: true,
  createdAt: true,
});
export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;
export type MediaAsset = typeof mediaAssets.$inferSelect;

// Post Media
export const insertPostMediaSchema = createInsertSchema(postMedia).omit({
  id: true,
});
export type InsertPostMedia = z.infer<typeof insertPostMediaSchema>;
export type PostMedia = typeof postMedia.$inferSelect;

// Story Sequences
export const insertStorySequenceSchema = createInsertSchema(storySequences).omit({
  id: true,
  createdAt: true,
});
export type InsertStorySequence = z.infer<typeof insertStorySequenceSchema>;
export type StorySequence = typeof storySequences.$inferSelect;

// Story Items
export const insertStoryItemSchema = createInsertSchema(storyItems).omit({
  id: true,
  viewsCount: true,
  createdAt: true,
});
export type InsertStoryItem = z.infer<typeof insertStoryItemSchema>;
export type StoryItem = typeof storyItems.$inferSelect;

// Story Views
export type StoryView = typeof storyViews.$inferSelect;

// Reels
export const insertReelSchema = createInsertSchema(reels).omit({
  id: true,
  likesCount: true,
  viewsCount: true,
  commentsCount: true,
  sharesCount: true,
  createdAt: true,
});
export type InsertReel = z.infer<typeof insertReelSchema>;
export type Reel = typeof reels.$inferSelect;

// Reel Likes
export type ReelLike = typeof reelLikes.$inferSelect;

// Reel Comments
export const insertReelCommentSchema = createInsertSchema(reelComments).omit({
  id: true,
  createdAt: true,
});
export type InsertReelComment = z.infer<typeof insertReelCommentSchema>;
export type ReelComment = typeof reelComments.$inferSelect;

// Conversations
export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Conversation Participants
export const insertConversationParticipantSchema = createInsertSchema(conversationParticipants).omit({
  id: true,
  joinedAt: true,
});
export type InsertConversationParticipant = z.infer<typeof insertConversationParticipantSchema>;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;

// Messages
export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
