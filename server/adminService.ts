import { storage } from "./storage";

const SUPER_ADMIN_EMAIL = "kaushlendra.k12@fms.edu";
const SUPER_ADMIN_USERNAME = "superadmin";

/**
 * Initialize super admin user in the database
 * This function runs on server startup to ensure the super admin exists
 */
export async function initializeSuperAdmin() {
  try {
    // Check if super admin already exists
    let adminUser = await storage.getUserByEmail(SUPER_ADMIN_EMAIL);

    if (!adminUser) {
      console.log("Creating super admin user...");
      
      // Create super admin user
      adminUser = await storage.createUser({
        email: SUPER_ADMIN_EMAIL,
        username: SUPER_ADMIN_USERNAME,
        firstName: "Super",
        lastName: "Admin",
        phoneNumber: "0000000000",
        bio: "Platform Administrator",
        profileImageUrl: null,
        isCreator: true, // Admins can also be creators
        isAdmin: true,
        subscriptionPrice: null,
      });

      console.log("✅ Super admin user created successfully");
    } else {
      // Ensure existing user has admin privileges
      if (!adminUser.isAdmin) {
        console.log("Updating existing user to admin...");
        await storage.updateUser(adminUser.id, { isAdmin: true });
        console.log("✅ User updated to admin successfully");
      } else {
        console.log("✅ Super admin user already exists");
      }
    }

    return adminUser;
  } catch (error) {
    console.error("❌ Error initializing super admin:", error);
    throw error;
  }
}

/**
 * Check if a user is the super admin (cannot be deleted/demoted)
 */
export function isSuperAdmin(email: string): boolean {
  return email === SUPER_ADMIN_EMAIL;
}
