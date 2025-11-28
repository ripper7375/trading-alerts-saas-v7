import { Session } from 'next-auth';
import {
  hasPermission,
  checkPermission,
  withPermission,
  canAccessSymbol,
  canAccessTimeframe,
  canAccessCombination,
  getAccessibleSymbols,
  getAccessibleTimeframes,
  checkTierLimits,
} from '@/lib/auth/permissions';
import { AuthError, TierAccessError } from '@/lib/auth/errors';

// Mock session helper
jest.mock('@/lib/auth/session', () => ({
  getSession: jest.fn(),
  getUserTier: jest.fn(),
}));

import { getSession, getUserTier } from '@/lib/auth/session';

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
const mockGetUserTier = getUserTier as jest.MockedFunction<typeof getUserTier>;

describe('Permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockSession = (
    tier: 'FREE' | 'PRO' = 'FREE',
    role: 'USER' | 'ADMIN' = 'USER',
    isAffiliate = false
  ): Session => ({
    user: {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      tier,
      role,
      isAffiliate,
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  });

  describe('hasPermission', () => {
    it('should require authentication for features', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await hasPermission('alerts');
      expect(result.canAccess).toBe(false);
      expect(result.reason).toBe('Authentication required');
      expect(result.requiredRole).toBe('USER');
    });

    it('should allow admin access to everything', async () => {
      mockGetSession.mockResolvedValue(createMockSession('FREE', 'ADMIN'));

      const result = await hasPermission('admin_dashboard');
      expect(result.canAccess).toBe(true);
      expect(result.requiredRole).toBe('ADMIN');
    });

    it('should deny admin_dashboard for regular users', async () => {
      mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER'));

      const result = await hasPermission('admin_dashboard');
      expect(result.canAccess).toBe(false);
      expect(result.reason).toBe('Administrator access required');
      expect(result.requiredRole).toBe('ADMIN');
    });

    describe('all_symbols permission', () => {
      it('should deny FREE tier access to all symbols', async () => {
        mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER'));

        const result = await hasPermission('all_symbols');
        expect(result.canAccess).toBe(false);
        expect(result.reason).toBe('All symbols require PRO tier subscription');
        expect(result.requiredTier).toBe('PRO');
      });

      it('should allow PRO tier access to all symbols', async () => {
        mockGetSession.mockResolvedValue(createMockSession('PRO', 'USER'));

        const result = await hasPermission('all_symbols');
        expect(result.canAccess).toBe(true);
        expect(result.reason).toBeUndefined();
        expect(result.requiredTier).toBe('PRO');
      });
    });

    describe('all_timeframes permission', () => {
      it('should deny FREE tier access to all timeframes', async () => {
        mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER'));

        const result = await hasPermission('all_timeframes');
        expect(result.canAccess).toBe(false);
        expect(result.reason).toBe('All timeframes require PRO tier subscription');
        expect(result.requiredTier).toBe('PRO');
      });

      it('should allow PRO tier access to all timeframes', async () => {
        mockGetSession.mockResolvedValue(createMockSession('PRO', 'USER'));

        const result = await hasPermission('all_timeframes');
        expect(result.canAccess).toBe(true);
      });
    });

    describe('alerts permission', () => {
      it('should allow alerts with FREE tier limit (5)', async () => {
        mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER'));

        const result = await hasPermission('alerts');
        expect(result.canAccess).toBe(true);
        expect(result.reason).toContain('FREE tier allows 5 alerts maximum');
        expect(result.requiredTier).toBe('FREE');
      });

      it('should allow alerts with PRO tier limit (20)', async () => {
        mockGetSession.mockResolvedValue(createMockSession('PRO', 'USER'));

        const result = await hasPermission('alerts');
        expect(result.canAccess).toBe(true);
        expect(result.reason).toContain('PRO tier allows 20 alerts maximum');
        expect(result.requiredTier).toBe('PRO');
      });
    });

    describe('watchlist permission', () => {
      it('should allow watchlist with FREE tier limit (5)', async () => {
        mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER'));

        const result = await hasPermission('watchlist');
        expect(result.canAccess).toBe(true);
        expect(result.reason).toContain('FREE tier allows 5 watchlist items maximum');
      });

      it('should allow watchlist with PRO tier limit (50)', async () => {
        mockGetSession.mockResolvedValue(createMockSession('PRO', 'USER'));

        const result = await hasPermission('watchlist');
        expect(result.canAccess).toBe(true);
        expect(result.reason).toContain('PRO tier allows 50 watchlist items maximum');
      });
    });

    describe('api_access permission', () => {
      it('should allow FREE tier API access with 60 req/hour', async () => {
        mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER'));

        const result = await hasPermission('api_access');
        expect(result.canAccess).toBe(true);
        expect(result.reason).toContain('FREE tier: 60 API requests per hour');
      });

      it('should allow PRO tier API access with 300 req/hour', async () => {
        mockGetSession.mockResolvedValue(createMockSession('PRO', 'USER'));

        const result = await hasPermission('api_access');
        expect(result.canAccess).toBe(true);
        expect(result.reason).toContain('PRO tier: 300 API requests per hour');
      });
    });

    describe('affiliate permissions', () => {
      it('should deny affiliate_dashboard for non-affiliates', async () => {
        mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER', false));

        const result = await hasPermission('affiliate_dashboard');
        expect(result.canAccess).toBe(false);
        expect(result.reason).toContain('Affiliate status required');
      });

      it('should allow affiliate_dashboard for affiliates', async () => {
        mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER', true));

        const result = await hasPermission('affiliate_dashboard');
        expect(result.canAccess).toBe(true);
        expect(result.reason).toBeUndefined();
      });

      it('should deny affiliate_codes for non-affiliates', async () => {
        mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER', false));

        const result = await hasPermission('affiliate_codes');
        expect(result.canAccess).toBe(false);
        expect(result.reason).toContain('Affiliate status required to access codes');
      });

      it('should allow affiliate_codes for affiliates', async () => {
        mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER', true));

        const result = await hasPermission('affiliate_codes');
        expect(result.canAccess).toBe(true);
      });

      it('should deny commission_reports for non-affiliates', async () => {
        mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER', false));

        const result = await hasPermission('commission_reports');
        expect(result.canAccess).toBe(false);
        expect(result.reason).toContain('Affiliate status required to view commissions');
      });

      it('should allow commission_reports for affiliates', async () => {
        mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER', true));

        const result = await hasPermission('commission_reports');
        expect(result.canAccess).toBe(true);
      });
    });

    it('should default to allowed for unknown features', async () => {
      mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER'));

      const result = await hasPermission('unknown_feature');
      expect(result.canAccess).toBe(true);
      expect(result.reason).toBe('Unknown feature - defaulting to allowed');
    });
  });

  describe('checkPermission', () => {
    it('should not throw for allowed permissions', async () => {
      mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER'));

      await expect(checkPermission('alerts')).resolves.not.toThrow();
    });

    it('should throw AuthError for admin-only features', async () => {
      mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER'));

      await expect(checkPermission('admin_dashboard')).rejects.toThrow(AuthError);
      await expect(checkPermission('admin_dashboard')).rejects.toThrow('Administrator access required');
    });

    it('should throw TierAccessError for PRO-only features', async () => {
      mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER'));

      await expect(checkPermission('all_symbols')).rejects.toThrow(TierAccessError);
    });

    it('should throw AuthError for generic access denied', async () => {
      mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER', false));

      await expect(checkPermission('affiliate_codes')).rejects.toThrow(AuthError);
    });
  });

  describe('withPermission', () => {
    it('should return a function that checks permission', async () => {
      mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER'));

      const requirePermission = withPermission('alerts');
      expect(typeof requirePermission).toBe('function');
      await expect(requirePermission()).resolves.not.toThrow();
    });

    it('should return a function that throws on denied permission', async () => {
      mockGetSession.mockResolvedValue(createMockSession('FREE', 'USER'));

      const requirePermission = withPermission('admin_dashboard');
      await expect(requirePermission()).rejects.toThrow(AuthError);
    });
  });

  describe('canAccessSymbol', () => {
    beforeEach(() => {
      mockGetUserTier.mockResolvedValue('FREE');
    });

    describe('FREE tier', () => {
      const freeSymbols = ['BTCUSD', 'EURUSD', 'USDJPY', 'US30', 'XAUUSD'];

      it.each(freeSymbols)('should allow FREE tier to access %s', async (symbol) => {
        const result = await canAccessSymbol(symbol);
        expect(result).toBe(true);
      });

      const proOnlySymbols = ['GBPUSD', 'AUDUSD', 'NZDUSD', 'ETHUSD'];

      it.each(proOnlySymbols)('should deny FREE tier access to %s', async (symbol) => {
        const result = await canAccessSymbol(symbol);
        expect(result).toBe(false);
      });
    });

    describe('PRO tier', () => {
      beforeEach(() => {
        mockGetUserTier.mockResolvedValue('PRO');
      });

      it('should allow PRO tier to access all symbols', async () => {
        const allSymbols = ['BTCUSD', 'EURUSD', 'GBPUSD', 'AUDUSD', 'ETHUSD', 'XAUUSD'];

        for (const symbol of allSymbols) {
          const result = await canAccessSymbol(symbol);
          expect(result).toBe(true);
        }
      });
    });
  });

  describe('canAccessTimeframe', () => {
    beforeEach(() => {
      mockGetUserTier.mockResolvedValue('FREE');
    });

    describe('FREE tier', () => {
      const freeTimeframes = ['H1', 'H4', 'D1'];

      it.each(freeTimeframes)('should allow FREE tier to access %s', async (timeframe) => {
        const result = await canAccessTimeframe(timeframe);
        expect(result).toBe(true);
      });

      const proOnlyTimeframes = ['M5', 'M15', 'M30', 'H2', 'H8'];

      it.each(proOnlyTimeframes)('should deny FREE tier access to %s', async (timeframe) => {
        const result = await canAccessTimeframe(timeframe);
        expect(result).toBe(false);
      });
    });

    describe('PRO tier', () => {
      beforeEach(() => {
        mockGetUserTier.mockResolvedValue('PRO');
      });

      it('should allow PRO tier to access all timeframes', async () => {
        const allTimeframes = ['M5', 'M15', 'M30', 'H1', 'H4', 'D1'];

        for (const timeframe of allTimeframes) {
          const result = await canAccessTimeframe(timeframe);
          expect(result).toBe(true);
        }
      });
    });
  });

  describe('canAccessCombination', () => {
    it('should allow when both symbol and timeframe are accessible', async () => {
      mockGetUserTier.mockResolvedValue('FREE');

      const result = await canAccessCombination('BTCUSD', 'H1');
      expect(result).toBe(true);
    });

    it('should deny when symbol is not accessible', async () => {
      mockGetUserTier.mockResolvedValue('FREE');

      const result = await canAccessCombination('GBPUSD', 'H1');
      expect(result).toBe(false);
    });

    it('should deny when timeframe is not accessible', async () => {
      mockGetUserTier.mockResolvedValue('FREE');

      const result = await canAccessCombination('BTCUSD', 'M5');
      expect(result).toBe(false);
    });

    it('should deny when neither is accessible', async () => {
      mockGetUserTier.mockResolvedValue('FREE');

      const result = await canAccessCombination('GBPUSD', 'M5');
      expect(result).toBe(false);
    });

    it('should allow PRO tier any combination', async () => {
      mockGetUserTier.mockResolvedValue('PRO');

      const result = await canAccessCombination('GBPUSD', 'M5');
      expect(result).toBe(true);
    });
  });

  describe('getAccessibleSymbols', () => {
    it('should return 5 symbols for FREE tier', async () => {
      mockGetUserTier.mockResolvedValue('FREE');

      const result = await getAccessibleSymbols();
      expect(result).toHaveLength(5);
      expect(result).toEqual(['BTCUSD', 'EURUSD', 'USDJPY', 'US30', 'XAUUSD']);
    });

    it('should return 15 symbols for PRO tier', async () => {
      mockGetUserTier.mockResolvedValue('PRO');

      const result = await getAccessibleSymbols();
      expect(result).toHaveLength(15);
      expect(result).toContain('BTCUSD');
      expect(result).toContain('GBPUSD');
      expect(result).toContain('ETHUSD');
    });
  });

  describe('getAccessibleTimeframes', () => {
    it('should return 3 timeframes for FREE tier', async () => {
      mockGetUserTier.mockResolvedValue('FREE');

      const result = await getAccessibleTimeframes();
      expect(result).toHaveLength(3);
      expect(result).toEqual(['H1', 'H4', 'D1']);
    });

    it('should return 9 timeframes for PRO tier', async () => {
      mockGetUserTier.mockResolvedValue('PRO');

      const result = await getAccessibleTimeframes();
      expect(result).toHaveLength(9);
      expect(result).toContain('M5');
      expect(result).toContain('H1');
      expect(result).toContain('D1');
    });
  });

  describe('checkTierLimits', () => {
    describe('alerts', () => {
      it('should allow creation when under FREE tier limit', async () => {
        mockGetUserTier.mockResolvedValue('FREE');

        const result = await checkTierLimits('alerts', 3);
        expect(result.canCreate).toBe(true);
        expect(result.remaining).toBe(2);
        expect(result.limit).toBe(5);
      });

      it('should deny creation when at FREE tier limit', async () => {
        mockGetUserTier.mockResolvedValue('FREE');

        const result = await checkTierLimits('alerts', 5);
        expect(result.canCreate).toBe(false);
        expect(result.remaining).toBe(0);
        expect(result.limit).toBe(5);
      });

      it('should allow creation when under PRO tier limit', async () => {
        mockGetUserTier.mockResolvedValue('PRO');

        const result = await checkTierLimits('alerts', 15);
        expect(result.canCreate).toBe(true);
        expect(result.remaining).toBe(5);
        expect(result.limit).toBe(20);
      });
    });

    describe('watchlist', () => {
      it('should allow creation when under FREE tier limit', async () => {
        mockGetUserTier.mockResolvedValue('FREE');

        const result = await checkTierLimits('watchlist', 2);
        expect(result.canCreate).toBe(true);
        expect(result.remaining).toBe(3);
        expect(result.limit).toBe(5);
      });

      it('should deny creation when over FREE tier limit', async () => {
        mockGetUserTier.mockResolvedValue('FREE');

        const result = await checkTierLimits('watchlist', 6);
        expect(result.canCreate).toBe(false);
        expect(result.remaining).toBe(0);
        expect(result.limit).toBe(5);
      });

      it('should allow creation when under PRO tier limit', async () => {
        mockGetUserTier.mockResolvedValue('PRO');

        const result = await checkTierLimits('watchlist', 30);
        expect(result.canCreate).toBe(true);
        expect(result.remaining).toBe(20);
        expect(result.limit).toBe(50);
      });
    });
  });
});
