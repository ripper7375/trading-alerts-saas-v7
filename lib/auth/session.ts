import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth';

import { authOptions } from './auth-options';
import { AuthError } from './errors';

/**
 * Get current server session
 * Wrapper around NextAuth's getServerSession with consistent error handling
 */
export async function getSession(): Promise<Session | null> {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Require authentication - throws error if no session
 * Use this for protected API routes and server components
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new AuthError(
      'You must be signed in to access this resource',
      'UNAUTHORIZED',
      401
    );
  }

  return session;
}

/**
 * Get current user session data
 * Returns user object with id, email, name, tier, role
 */
export async function getUserSession(): Promise<Session['user'] | null> {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  return session.user;
}

/**
 * Get current user's tier (FREE or PRO)
 * Defaults to FREE if no session or tier not set
 */
export async function getUserTier(): Promise<'FREE' | 'PRO'> {
  const session = await getSession();
  return (session?.user?.tier as 'FREE' | 'PRO') || 'FREE';
}

/**
 * Get current user's role (USER or ADMIN)
 * Defaults to USER if no session or role not set
 */
export async function getUserRole(): Promise<'USER' | 'ADMIN'> {
  const session = await getSession();
  return (session?.user?.role as 'USER' | 'ADMIN') || 'USER';
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'ADMIN';
}

/**
 * Check if current user has specific tier
 */
export async function hasTier(requiredTier: 'FREE' | 'PRO'): Promise<boolean> {
  const userTier = await getUserTier();

  if (requiredTier === 'FREE') {
    return true; // All users have at least FREE tier access
  }

  return userTier === 'PRO';
}

/**
 * Check if current user has admin role
 * Throws error if not admin
 */
export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth();

  if (session.user.role !== 'ADMIN') {
    throw new AuthError('Administrator access required', 'FORBIDDEN', 403);
  }

  return session;
}

/**
 * Check if current user has required tier
 * Throws error if tier requirement not met
 */
export async function requireTier(
  requiredTier: 'FREE' | 'PRO'
): Promise<Session> {
  const session = await requireAuth();
  const userTier = session.user.tier as 'FREE' | 'PRO';

  if (requiredTier === 'PRO' && userTier !== 'PRO') {
    throw new AuthError(
      'PRO tier subscription required for this feature',
      'TIER_ACCESS_ERROR',
      403
    );
  }

  return session;
}

/**
 * Middleware-compatible session checker
 * Returns session or redirects (for use in middleware.ts)
 */
export async function getSessionOrRedirect(
  _request: Request
): Promise<Session | null> {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  return session;
}
