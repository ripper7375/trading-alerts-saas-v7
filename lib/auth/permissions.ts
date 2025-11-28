import { AuthError, TierAccessError } from './errors';
import { getSession, getUserTier } from './session';

/**
 * Permission checking utilities
 * Centralized tier and role-based access control
 */

export interface PermissionCheck {
  canAccess: boolean;
  reason?: string;
  requiredTier?: 'FREE' | 'PRO';
  requiredRole?: 'USER' | 'ADMIN';
}

/**
 * Check if user has permission for a specific feature
 */
export async function hasPermission(
  feature: string,
  _resource?: string
): Promise<PermissionCheck> {
  const session = await getSession();

  if (!session?.user) {
    return {
      canAccess: false,
      reason: 'Authentication required',
      requiredRole: 'USER',
    };
  }

  const userTier = session.user.tier as 'FREE' | 'PRO';
  const userRole = session.user.role as 'USER' | 'ADMIN';

  // Admin has access to everything
  if (userRole === 'ADMIN') {
    return {
      canAccess: true,
      requiredRole: 'ADMIN',
    };
  }

  // Feature-specific permissions
  switch (feature) {
    case 'admin_dashboard':
      return {
        canAccess: false,
        reason: 'Administrator access required',
        requiredRole: 'ADMIN',
      };

    case 'all_symbols':
      return {
        canAccess: userTier === 'PRO',
        reason:
          userTier === 'FREE'
            ? 'All symbols require PRO tier subscription'
            : undefined,
        requiredTier: 'PRO',
      };

    case 'all_timeframes':
      return {
        canAccess: userTier === 'PRO',
        reason:
          userTier === 'FREE'
            ? 'All timeframes require PRO tier subscription'
            : undefined,
        requiredTier: 'PRO',
      };

    case 'alerts':
      const alertLimit = userTier === 'PRO' ? 20 : 5;
      return {
        canAccess: true,
        reason: `${userTier} tier allows ${alertLimit} alerts maximum`,
        requiredTier: userTier,
      };

    case 'watchlist':
      const watchlistLimit = userTier === 'PRO' ? 50 : 5;
      return {
        canAccess: true,
        reason: `${userTier} tier allows ${watchlistLimit} watchlist items maximum`,
        requiredTier: userTier,
      };

    case 'api_access':
      const rateLimit = userTier === 'PRO' ? 300 : 60; // requests per hour
      return {
        canAccess: true,
        reason: `${userTier} tier: ${rateLimit} API requests per hour`,
        requiredTier: userTier,
      };

    case 'affiliate_dashboard':
      const isAffiliateUser = session.user.isAffiliate;
      return {
        canAccess: isAffiliateUser,
        reason: isAffiliateUser
          ? undefined
          : 'Affiliate status required. Apply to become an affiliate.',
        requiredRole: 'USER',
      };

    case 'affiliate_codes':
      return {
        canAccess: session.user.isAffiliate,
        reason: session.user.isAffiliate
          ? undefined
          : 'Affiliate status required to access codes',
        requiredRole: 'USER',
      };

    case 'commission_reports':
      return {
        canAccess: session.user.isAffiliate,
        reason: session.user.isAffiliate
          ? undefined
          : 'Affiliate status required to view commissions',
        requiredRole: 'USER',
      };

    default:
      return {
        canAccess: true,
        reason: 'Unknown feature - defaulting to allowed',
      };
  }
}

/**
 * Middleware function to check permissions and throw appropriate error
 */
export async function checkPermission(
  feature: string,
  resource?: string
): Promise<void> {
  const permission = await hasPermission(feature, resource);

  if (!permission.canAccess) {
    if (permission.requiredRole === 'ADMIN') {
      throw new AuthError('Administrator access required', 'FORBIDDEN', 403);
    }

    if (permission.requiredTier === 'PRO') {
      throw new TierAccessError(
        permission.reason || 'PRO tier subscription required'
      );
    }

    throw new AuthError(permission.reason || 'Access denied', 'FORBIDDEN', 403);
  }
}

/**
 * Higher-order component pattern for permission checking
 */
export function withPermission(
  feature: string,
  resource?: string
): () => Promise<void> {
  return async function requirePermission() {
    await checkPermission(feature, resource);
  };
}

/**
 * Check if user can access specific symbol
 */
export async function canAccessSymbol(symbol: string): Promise<boolean> {
  const userTier = await getUserTier();

  // FREE tier symbols
  const freeSymbols = ['BTCUSD', 'EURUSD', 'USDJPY', 'US30', 'XAUUSD'];

  if (userTier === 'FREE') {
    return freeSymbols.includes(symbol);
  }

  // PRO tier has access to all symbols
  return true;
}

/**
 * Check if user can access specific timeframe
 */
export async function canAccessTimeframe(timeframe: string): Promise<boolean> {
  const userTier = await getUserTier();

  // FREE tier timeframes
  const freeTimeframes = ['H1', 'H4', 'D1'];

  if (userTier === 'FREE') {
    return freeTimeframes.includes(timeframe);
  }

  // PRO tier has access to all timeframes
  return true;
}

/**
 * Check if user can access symbol+timeframe combination
 */
export async function canAccessCombination(
  symbol: string,
  timeframe: string
): Promise<boolean> {
  const [symbolAccess, timeframeAccess] = await Promise.all([
    canAccessSymbol(symbol),
    canAccessTimeframe(timeframe),
  ]);

  return symbolAccess && timeframeAccess;
}

/**
 * Get user's available symbols based on tier
 */
export async function getAccessibleSymbols(): Promise<string[]> {
  const userTier = await getUserTier();

  const freeSymbols = ['BTCUSD', 'EURUSD', 'USDJPY', 'US30', 'XAUUSD'];
  const proSymbols = [
    'AUDJPY',
    'AUDUSD',
    'BTCUSD',
    'ETHUSD',
    'EURUSD',
    'GBPJPY',
    'GBPUSD',
    'NDX100',
    'NZDUSD',
    'US30',
    'USDCAD',
    'USDCHF',
    'USDJPY',
    'XAGUSD',
    'XAUUSD',
  ];

  return userTier === 'PRO' ? proSymbols : freeSymbols;
}

/**
 * Get user's available timeframes based on tier
 */
export async function getAccessibleTimeframes(): Promise<string[]> {
  const userTier = await getUserTier();

  const freeTimeframes = ['H1', 'H4', 'D1'];
  const proTimeframes = [
    'M5',
    'M15',
    'M30',
    'H1',
    'H2',
    'H4',
    'H8',
    'H12',
    'D1',
  ];

  return userTier === 'PRO' ? proTimeframes : freeTimeframes;
}

/**
 * Check if user is approaching their tier limits
 */
export async function checkTierLimits(
  feature: 'alerts' | 'watchlist',
  currentCount: number
): Promise<{ canCreate: boolean; remaining: number; limit: number }> {
  const userTier = await getUserTier();

  const limits = {
    FREE: { alerts: 5, watchlist: 5 },
    PRO: { alerts: 20, watchlist: 50 },
  };

  const limit = limits[userTier][feature];
  const remaining = Math.max(0, limit - currentCount);

  return {
    canCreate: currentCount < limit,
    remaining,
    limit,
  };
}
