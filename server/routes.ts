// Reference: javascript_log_in_with_replit, javascript_stripe, javascript_object_storage blueprints
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";
import Stripe from "stripe";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

// Initialize Stripe if keys are provided
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // ===== OBJECT STORAGE ROUTES =====
  // Serve objects with ACL check (public objects don't require auth)
  app.get("/objects/:objectPath(*)", async (req: any, res) => {
    const userId = req.isAuthenticated?.() ? req.user?.claims?.sub : undefined;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get upload URL for object entity
  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  // Set ACL policy for uploaded media
  app.put("/api/objects/media", isAuthenticated, async (req: any, res) => {
    if (!req.body.mediaURL) {
      return res.status(400).json({ error: "mediaURL is required" });
    }

    const userId = req.user.claims.sub;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.mediaURL,
        {
          owner: userId,
          visibility: req.body.isPublic ? "public" : "private",
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting media ACL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve public assets
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ===== AUTH ROUTES =====
  // Public endpoint to check auth status - returns user or null
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
        return res.json(null);
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.json(null);
      }

      // Get additional stats
      const followersCount = await storage.getFollowersCount(userId);
      const followingCount = await storage.getFollowingCount(userId);
      const posts = await storage.getPostsByUser(userId);

      res.json({
        ...user,
        followersCount,
        followingCount,
        postsCount: posts.length,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.json(null);
    }
  });

  // ===== USER ROUTES =====
  app.get("/api/users/:username", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const followersCount = await storage.getFollowersCount(user.id);
      const followingCount = await storage.getFollowingCount(user.id);
      const posts = await storage.getPostsByUser(user.id);

      // Check if current user is following/subscribed to this user
      let isFollowing = false;
      let isSubscribed = false;
      if (req.isAuthenticated()) {
        const currentUserId = (req.user as any).claims.sub;
        isFollowing = await storage.isFollowing(currentUserId, user.id);
        isSubscribed = await storage.hasActiveSubscription(currentUserId, user.id);
      }

      res.json({
        ...user,
        followersCount,
        followingCount,
        postsCount: posts.length,
        isFollowing,
        isSubscribed,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile - supports both /profile and /:id routes
  app.put("/api/users/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { username, firstName, lastName, bio, isCreator, subscriptionPrice } = req.body;

      // Validate subscription price for creators (already in cents from client)
      if (isCreator && subscriptionPrice) {
        if (subscriptionPrice < 100) {
          return res.status(400).json({ message: "Subscription price must be at least $1.00" });
        }
      }

      const updated = await storage.updateUser(userId, {
        username,
        firstName,
        lastName,
        bio,
        isCreator,
        subscriptionPrice: subscriptionPrice || null,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Also support updating via user ID
  app.put("/api/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const targetUserId = req.params.id;

      // Only allow users to update their own profile
      if (userId !== targetUserId) {
        return res.status(403).json({ message: "You can only update your own profile" });
      }

      const { username, firstName, lastName, bio, isCreator, subscriptionPrice } = req.body;

      // Validate subscription price for creators (already in cents from client)
      if (isCreator && subscriptionPrice) {
        if (subscriptionPrice < 100) {
          return res.status(400).json({ message: "Subscription price must be at least $1.00" });
        }
      }

      const updated = await storage.updateUser(userId, {
        username,
        firstName,
        lastName,
        bio,
        isCreator,
        subscriptionPrice: subscriptionPrice || null,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get user posts by username
  app.get("/api/users/:username/posts", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const posts = await storage.getPostsByUser(user.id);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // ===== POST ROUTES =====
  app.post("/api/posts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertPostSchema.parse({
        ...req.body,
        userId,
      });

      const post = await storage.createPost(validatedData);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(400).json({ message: "Failed to create post" });
    }
  });

  app.get("/api/posts/feed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const posts = await storage.getFeedPosts(userId);

      // Enrich posts with user data and like status
      const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
          const user = await storage.getUser(post.userId);
          const hasLiked = await storage.hasLiked(userId, post.id);
          
          // Check if user can view subscriber-only content
          let canView = !post.isSubscriberOnly;
          if (post.isSubscriberOnly && userId !== post.userId) {
            canView = await storage.hasActiveSubscription(userId, post.userId);
          }

          return {
            ...post,
            user,
            hasLiked,
            canView,
          };
        })
      );

      res.json(enrichedPosts);
    } catch (error) {
      console.error("Error fetching feed:", error);
      res.status(500).json({ message: "Failed to fetch feed" });
    }
  });

  app.get("/api/posts/explore", async (req, res) => {
    try {
      const posts = await storage.getExplorePosts();
      
      const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
          const user = await storage.getUser(post.userId);
          return { ...post, user };
        })
      );

      res.json(enrichedPosts);
    } catch (error) {
      console.error("Error fetching explore posts:", error);
      res.status(500).json({ message: "Failed to fetch explore posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const user = await storage.getUser(post.userId);
      
      // Check viewing permissions
      let canView = !post.isSubscriberOnly;
      if (post.isSubscriberOnly && req.isAuthenticated()) {
        const currentUserId = (req.user as any).claims.sub;
        if (currentUserId !== post.userId) {
          canView = await storage.hasActiveSubscription(currentUserId, post.userId);
        } else {
          canView = true; // Creator can always view their own posts
        }
      }

      res.json({ ...post, user, canView });
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.delete("/api/posts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const post = await storage.getPost(req.params.id);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deletePost(req.params.id);
      res.json({ message: "Post deleted" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // ===== LIKE ROUTES =====
  app.post("/api/posts/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = req.params.id;

      const hasLiked = await storage.hasLiked(userId, postId);
      if (hasLiked) {
        return res.status(400).json({ message: "Already liked" });
      }

      await storage.createLike(userId, postId);
      await storage.incrementPostLikes(postId);

      // Create notification for post owner
      const post = await storage.getPost(postId);
      if (post && post.userId !== userId) {
        await storage.createNotification({
          userId: post.userId,
          type: "like",
          actorId: userId,
          postId,
          message: "liked your post",
          isRead: false,
        });
      }

      res.json({ message: "Post liked" });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete("/api/posts/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = req.params.id;

      await storage.deleteLike(userId, postId);
      await storage.decrementPostLikes(postId);

      res.json({ message: "Post unliked" });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  // ===== COMMENT ROUTES =====
  // Get comments for a post (requires authorization for subscriber-only posts)
  app.get("/api/posts/:id/comments", async (req: any, res) => {
    try {
      const postId = req.params.id;
      const post = await storage.getPost(postId);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Check if user can view subscriber-only content
      if (post.isSubscriberOnly) {
        // Must be authenticated to view subscriber-only comments
        if (!req.isAuthenticated || !req.isAuthenticated()) {
          return res.status(401).json({ message: "Authentication required" });
        }

        const userId = req.user.claims.sub;

        // Owner or active subscriber can view
        if (post.userId !== userId) {
          const hasSubscription = await storage.hasActiveSubscription(userId, post.userId);
          if (!hasSubscription) {
            return res.status(403).json({ message: "Subscription required" });
          }
        }
      }

      const comments = await storage.getCommentsByPost(postId);

      // Enrich comments with user data
      const enrichedComments = await Promise.all(
        comments.map(async (comment) => {
          const user = await storage.getUser(comment.userId);
          return { ...comment, user };
        })
      );

      res.json(enrichedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Create a comment
  app.post("/api/posts/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = req.params.id;

      const validatedData = insertCommentSchema.parse({
        userId,
        postId,
        content: req.body.content,
      });

      const comment = await storage.createComment(validatedData);
      await storage.incrementPostComments(postId);

      // Create notification for post owner
      const post = await storage.getPost(postId);
      if (post && post.userId !== userId) {
        await storage.createNotification({
          userId: post.userId,
          type: "comment",
          actorId: userId,
          postId,
          message: "commented on your post",
          isRead: false,
        });
      }

      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(400).json({ message: "Failed to create comment" });
    }
  });

  // ===== FOLLOW ROUTES =====
  app.post("/api/users/:id/follow", isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const followingId = req.params.id;

      if (followerId === followingId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }

      const isFollowing = await storage.isFollowing(followerId, followingId);
      if (isFollowing) {
        return res.status(400).json({ message: "Already following" });
      }

      await storage.createFollow(followerId, followingId);

      // Create notification
      await storage.createNotification({
        userId: followingId,
        type: "follow",
        actorId: followerId,
        postId: null,
        message: "started following you",
        isRead: false,
      });

      res.json({ message: "User followed" });
    } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete("/api/users/:id/follow", isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const followingId = req.params.id;

      await storage.deleteFollow(followerId, followingId);
      res.json({ message: "User unfollowed" });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  // ===== SUBSCRIPTION & STRIPE ROUTES =====
  if (stripe) {
    app.post("/api/create-subscription", isAuthenticated, async (req: any, res) => {
      try {
        const subscriberId = req.user.claims.sub;
        const { creatorId } = req.body;

        const subscriber = await storage.getUser(subscriberId);
        const creator = await storage.getUser(creatorId);

        if (!creator || !creator.isCreator || !creator.subscriptionPrice) {
          return res.status(400).json({ message: "Invalid creator" });
        }

        // Check if already subscribed
        const existingSub = await storage.getSubscription(subscriberId, creatorId);
        if (existingSub && existingSub.status === "active") {
          return res.status(400).json({ message: "Already subscribed" });
        }

        // Create or get Stripe customer
        let stripeCustomerId = subscriber?.stripeCustomerId;
        if (!stripeCustomerId) {
          const customer = await stripe!.customers.create({
            email: subscriber?.email || undefined,
            metadata: { userId: subscriberId },
          });
          stripeCustomerId = customer.id;
          await storage.updateUserStripeInfo(subscriberId, stripeCustomerId);
        }

        // Create Stripe Price for this subscription
        const price = await stripe!.prices.create({
          currency: "usd",
          unit_amount: creator.subscriptionPrice,
          recurring: {
            interval: "month",
          },
          product_data: {
            name: `Subscription to ${creator.username || creator.firstName}`,
          },
        });

        // Create subscription
        const subscription = await stripe!.subscriptions.create({
          customer: stripeCustomerId,
          items: [{ price: price.id }],
          payment_behavior: "default_incomplete",
          payment_settings: {
            save_default_payment_method: "on_subscription",
          },
          expand: ["latest_invoice.payment_intent"],
        });

        // Save subscription to database
        await storage.createSubscription(
          subscriberId,
          creatorId,
          subscription.id
        );

        // Create notification
        await storage.createNotification({
          userId: creatorId,
          type: "subscription",
          actorId: subscriberId,
          postId: null,
          message: "subscribed to your content",
          isRead: false,
        });

        const invoice = subscription.latest_invoice as Stripe.Invoice & {
          payment_intent?: Stripe.PaymentIntent | string;
        };
        const paymentIntent = invoice?.payment_intent;
        const clientSecret = typeof paymentIntent === 'string' 
          ? null 
          : (paymentIntent as Stripe.PaymentIntent)?.client_secret;

        res.json({
          subscriptionId: subscription.id,
          clientSecret,
        });
      } catch (error: any) {
        console.error("Error creating subscription:", error);
        res.status(500).json({ message: error.message });
      }
    });

    app.post("/api/cancel-subscription", isAuthenticated, async (req: any, res) => {
      try {
        const subscriberId = req.user.claims.sub;
        const { creatorId } = req.body;

        const subscription = await storage.getSubscription(subscriberId, creatorId);
        if (!subscription || !subscription.stripeSubscriptionId) {
          return res.status(404).json({ message: "Subscription not found" });
        }

        await stripe!.subscriptions.cancel(subscription.stripeSubscriptionId);
        await storage.updateSubscription(subscription.id, { status: "cancelled" });

        res.json({ message: "Subscription cancelled" });
      } catch (error: any) {
        console.error("Error cancelling subscription:", error);
        res.status(500).json({ message: error.message });
      }
    });
  }

  // ===== NOTIFICATION ROUTES =====
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotificationsByUser(userId);

      // Enrich with actor data
      const enrichedNotifications = await Promise.all(
        notifications.map(async (notification) => {
          const actor = notification.actorId
            ? await storage.getUser(notification.actorId)
            : null;
          return { ...notification, actor };
        })
      );

      res.json(enrichedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // ===== DASHBOARD ROUTES =====
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isCreator) {
        return res.status(403).json({ message: "Not a creator" });
      }

      const subscribersCount = await storage.getActiveSubscribersCount(userId);
      const subscriptions = await storage.getSubscriptionsByCreator(userId);
      const posts = await storage.getPostsByUser(userId);

      // Calculate total earnings (mock for now, would need Stripe webhooks for real data)
      const monthlyRevenue = subscribersCount * (user.subscriptionPrice || 0) / 100;

      res.json({
        subscribersCount,
        monthlyRevenue,
        totalEarnings: monthlyRevenue * 6, // Mock: 6 months average
        postsCount: posts.length,
        totalViews: posts.reduce((acc, post) => acc + post.viewsCount, 0),
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
