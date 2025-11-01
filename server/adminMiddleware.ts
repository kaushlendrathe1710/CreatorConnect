import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

/**
 * Middleware to check if user is an admin
 * Must be used after isAuthenticated middleware
 */
export async function isAdmin(req: any, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.user.claims || !req.user.claims.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }

    // Attach user to request for convenience
    req.adminUser = user;
    next();
  } catch (error) {
    console.error("Error in isAdmin middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
