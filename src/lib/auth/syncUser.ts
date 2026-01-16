import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * Synchronizes the currently authenticated Supabase user with the Prisma database.
 *
 * This function handles:
 * 1. Fetching the current user from Supabase.
 * 2. Checking if the user exists in Prisma by ID.
 * 3. "Self-healing": If not found by ID, checks by Email.
 *    - If found by Email (ID mismatch), updates Prisma ID to match Supabase ID.
 *    - If not found by Email, creates a new user in Prisma.
 *
 * @param userId Optional userId to verify against the Supabase session
 * @returns The Prisma user object or null if not authenticated
 */
export async function syncUserFromSupabase(targetUserId?: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      console.error("Supabase auth error or no user:", error);
      return null;
    }

    // If a targetUserId is provided, verify it matches
    if (targetUserId && supabaseUser.id !== targetUserId) {
      console.warn("Supabase user ID mismatch with provided target ID");
      return null;
    }

    const userId = supabaseUser.id;

    // 1. Try to find user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      return user;
    }

    // 2. Self-healing: User not found by ID. Check by Email.
    console.log("User not found by ID. Attempting self-healing for:", userId);

    if (!supabaseUser.email) {
      console.warn("Supabase user has no email, cannot self-heal by email.");
      return null;
    }

    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: supabaseUser.email },
      select: { id: true },
    });

    if (existingUserByEmail) {
      console.log(
        `User exists by email (${supabaseUser.email}) with different ID (${existingUserByEmail.id}). Syncing to Supabase ID (${userId}).`
      );

      // ID Update / Sync
      // Note: Updating ID can run into foreign key constraints if not configured with CASCADE.
      // Assuming typical Prisma/Postgres setup where we might strictly need to update.
      // If this fails due to FKs, manual intervention or raw SQL might be needed,
      // but standard Prisma update is the first best attempt.
      const updatedUser = await prisma.user.update({
        where: { email: supabaseUser.email },
        data: {
          id: userId,
          authProvider: "GOOGLE", // Assume connected via OAuth if managing via Supabase
          avatar:
            supabaseUser.user_metadata.avatar_url ||
            supabaseUser.user_metadata.picture,
          emailVerified: true,
          // Sync other fields if needed, but be careful not to overwrite custom data
        },
      });

      return updatedUser;
    } else {
      // 3. Create new user
      console.log("Creating new Prisma user for Supabase ID:", userId);
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          email: supabaseUser.email,
          name:
            supabaseUser.user_metadata.full_name ||
            supabaseUser.user_metadata.name ||
            "",
          avatar:
            supabaseUser.user_metadata.avatar_url ||
            supabaseUser.user_metadata.picture,
          authProvider: "GOOGLE", // Best guess for Supabase (often OAuth)
          role: (supabaseUser.user_metadata.role as any) || "BUYER",
          emailVerified: true,
        },
      });

      return newUser;
    }
  } catch (error) {
    console.error("Error in syncUserFromSupabase:", error);
    return null;
  }
}
