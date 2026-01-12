/**
 * AUTH CONTEXT USAGE EXAMPLES
 *
 * Import the useAuth hook in any client component:
 */

"use client";

import { useAuth } from "@/contexts/AuthContext";

export function ExampleComponent() {
  const { user, loading, signOut } = useAuth();

  // Example 1: Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Example 2: Check if user is logged in
  if (!user) {
    return <div>Please log in</div>;
  }

  // Example 3: Access user data
  const userName = user.user_metadata?.full_name || user.email;
  const userEmail = user.email;
  const userAvatar =
    user.user_metadata?.avatar_url || user.user_metadata?.picture;

  // Example 4: Use signOut function
  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div>
      <h1>Welcome, {userName}!</h1>
      <p>Email: {userEmail}</p>
      {userAvatar && <img src={userAvatar} alt="Avatar" />}
      <button onClick={handleLogout}>Sign Out</button>
    </div>
  );
}

/**
 * AVAILABLE AUTH CONTEXT VALUES:
 *
 * user: User | null - The current Supabase user object
 *   - user.id - User ID
 *   - user.email - User email
 *   - user.user_metadata - Contains: full_name, avatar_url, picture, etc.
 *   - user.created_at - Account creation date
 *
 * loading: boolean - True when checking auth state
 *
 * signOut: () => Promise<void> - Function to sign out the user
 *
 * refreshUser: () => Promise<void> - Function to manually refresh user data
 */
