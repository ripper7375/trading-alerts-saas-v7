import { Session } from 'next-auth';
import {
  getSession,
  requireAuth,
  getUserSession,
  getUserTier,
  getUserRole,
  isAdmin,
  hasTier,
  requireAdmin,
  requireTier,
  getSessionOrRedirect,
  isAffiliate,
  requireAffiliate,
  getAffiliateProfile,
} from '@/lib/auth/session';
import { AuthError } from '@/lib/auth/errors';

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/auth/auth-options', () => ({
  authOptions: {},
}));

jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    affiliateProfile: {
      findUnique: jest.fn(),
    },
  },
}));

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db/prisma';

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Session Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockSession = (overrides?: Partial<Session>): Session => ({
    user: {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      tier: 'FREE',
      role: 'USER',
      isAffiliate: false,
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
    ...overrides,
  });

  describe('getSession', () => {
    it('should return session when available', async () => {
      const mockSession = createMockSession();
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await getSession();
      expect(result).toEqual(mockSession);
    });

    it('should return null when no session', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await getSession();
      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockGetServerSession.mockRejectedValue(new Error('Session error'));

      const result = await getSession();
      expect(result).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('should return session when authenticated', async () => {
      const mockSession = createMockSession();
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await requireAuth();
      expect(result).toEqual(mockSession);
    });

    it('should throw AuthError when no session', async () => {
      mockGetServerSession.mockResolvedValue(null);

      await expect(requireAuth()).rejects.toThrow(AuthError);
      await expect(requireAuth()).rejects.toThrow('You must be signed in to access this resource');
    });

    it('should throw AuthError when session has no user', async () => {
      mockGetServerSession.mockResolvedValue({ expires: '' } as Session);

      await expect(requireAuth()).rejects.toThrow(AuthError);
    });
  });

  describe('getUserSession', () => {
    it('should return user when session exists', async () => {
      const mockSession = createMockSession();
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await getUserSession();
      expect(result).toEqual(mockSession.user);
    });

    it('should return null when no session', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await getUserSession();
      expect(result).toBeNull();
    });
  });

  describe('getUserTier', () => {
    it('should return FREE tier by default', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await getUserTier();
      expect(result).toBe('FREE');
    });

    it('should return user tier when session exists', async () => {
      const mockSession = createMockSession({
        user: {
          id: 'user123',
          email: 'test@example.com',
          tier: 'PRO',
          role: 'USER',
          isAffiliate: false,
        },
      });
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await getUserTier();
      expect(result).toBe('PRO');
    });

    it('should return FREE when tier not set', async () => {
      const mockSession = createMockSession();
      mockSession.user.tier = undefined as any;
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await getUserTier();
      expect(result).toBe('FREE');
    });
  });

  describe('getUserRole', () => {
    it('should return USER role by default', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await getUserRole();
      expect(result).toBe('USER');
    });

    it('should return user role when session exists', async () => {
      const mockSession = createMockSession({
        user: {
          id: 'admin123',
          email: 'admin@example.com',
          tier: 'PRO',
          role: 'ADMIN',
          isAffiliate: false,
        },
      });
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await getUserRole();
      expect(result).toBe('ADMIN');
    });
  });

  describe('isAdmin', () => {
    it('should return true for ADMIN role', async () => {
      const mockSession = createMockSession({
        user: {
          id: 'admin123',
          email: 'admin@example.com',
          tier: 'PRO',
          role: 'ADMIN',
          isAffiliate: false,
        },
      });
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await isAdmin();
      expect(result).toBe(true);
    });

    it('should return false for USER role', async () => {
      const mockSession = createMockSession();
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await isAdmin();
      expect(result).toBe(false);
    });

    it('should return false when no session', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await isAdmin();
      expect(result).toBe(false);
    });
  });

  describe('hasTier', () => {
    it('should return true for FREE tier users accessing FREE tier', async () => {
      const mockSession = createMockSession();
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await hasTier('FREE');
      expect(result).toBe(true);
    });

    it('should return false for FREE tier users accessing PRO tier', async () => {
      const mockSession = createMockSession();
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await hasTier('PRO');
      expect(result).toBe(false);
    });

    it('should return true for PRO tier users accessing FREE tier', async () => {
      const mockSession = createMockSession({
        user: {
          id: 'user123',
          email: 'test@example.com',
          tier: 'PRO',
          role: 'USER',
          isAffiliate: false,
        },
      });
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await hasTier('FREE');
      expect(result).toBe(true);
    });

    it('should return true for PRO tier users accessing PRO tier', async () => {
      const mockSession = createMockSession({
        user: {
          id: 'user123',
          email: 'test@example.com',
          tier: 'PRO',
          role: 'USER',
          isAffiliate: false,
        },
      });
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await hasTier('PRO');
      expect(result).toBe(true);
    });
  });

  describe('requireAdmin', () => {
    it('should return session for ADMIN role', async () => {
      const mockSession = createMockSession({
        user: {
          id: 'admin123',
          email: 'admin@example.com',
          tier: 'PRO',
          role: 'ADMIN',
          isAffiliate: false,
        },
      });
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await requireAdmin();
      expect(result).toEqual(mockSession);
    });

    it('should throw AuthError for USER role', async () => {
      const mockSession = createMockSession();
      mockGetServerSession.mockResolvedValue(mockSession);

      await expect(requireAdmin()).rejects.toThrow(AuthError);
      await expect(requireAdmin()).rejects.toThrow('Administrator access required');
    });

    it('should throw AuthError when no session', async () => {
      mockGetServerSession.mockResolvedValue(null);

      await expect(requireAdmin()).rejects.toThrow(AuthError);
    });
  });

  describe('requireTier', () => {
    it('should return session when user has required tier (FREE)', async () => {
      const mockSession = createMockSession();
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await requireTier('FREE');
      expect(result).toEqual(mockSession);
    });

    it('should return session when PRO user accesses PRO tier', async () => {
      const mockSession = createMockSession({
        user: {
          id: 'user123',
          email: 'test@example.com',
          tier: 'PRO',
          role: 'USER',
          isAffiliate: false,
        },
      });
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await requireTier('PRO');
      expect(result).toEqual(mockSession);
    });

    it('should throw AuthError when FREE user accesses PRO tier', async () => {
      const mockSession = createMockSession();
      mockGetServerSession.mockResolvedValue(mockSession);

      await expect(requireTier('PRO')).rejects.toThrow(AuthError);
      await expect(requireTier('PRO')).rejects.toThrow('PRO tier subscription required for this feature');
    });
  });

  describe('getSessionOrRedirect', () => {
    it('should return session when user is authenticated', async () => {
      const mockSession = createMockSession();
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await getSessionOrRedirect({} as Request);
      expect(result).toEqual(mockSession);
    });

    it('should return null when no session', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await getSessionOrRedirect({} as Request);
      expect(result).toBeNull();
    });

    it('should return null when session has no user', async () => {
      mockGetServerSession.mockResolvedValue({ expires: '' } as Session);

      const result = await getSessionOrRedirect({} as Request);
      expect(result).toBeNull();
    });
  });

  describe('isAffiliate', () => {
    it('should return true when user is affiliate', async () => {
      const mockSession = createMockSession({
        user: {
          id: 'user123',
          email: 'test@example.com',
          tier: 'FREE',
          role: 'USER',
          isAffiliate: true,
        },
      });
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await isAffiliate();
      expect(result).toBe(true);
    });

    it('should return false when user is not affiliate', async () => {
      const mockSession = createMockSession();
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await isAffiliate();
      expect(result).toBe(false);
    });

    it('should return false when no session', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await isAffiliate();
      expect(result).toBe(false);
    });
  });

  describe('requireAffiliate', () => {
    it('should return session when user is affiliate', async () => {
      const mockSession = createMockSession({
        user: {
          id: 'user123',
          email: 'test@example.com',
          tier: 'FREE',
          role: 'USER',
          isAffiliate: true,
        },
      });
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await requireAffiliate();
      expect(result).toEqual(mockSession);
    });

    it('should throw AuthError when user is not affiliate', async () => {
      const mockSession = createMockSession();
      mockGetServerSession.mockResolvedValue(mockSession);

      await expect(requireAffiliate()).rejects.toThrow(AuthError);
      await expect(requireAffiliate()).rejects.toThrow('Affiliate status required to access this resource');
    });

    it('should throw AuthError when no session', async () => {
      mockGetServerSession.mockResolvedValue(null);

      await expect(requireAffiliate()).rejects.toThrow(AuthError);
    });
  });

  describe('getAffiliateProfile', () => {
    it('should return affiliate profile when user is affiliate', async () => {
      const mockSession = createMockSession({
        user: {
          id: 'user123',
          email: 'test@example.com',
          tier: 'FREE',
          role: 'USER',
          isAffiliate: true,
        },
      });
      const mockProfile = {
        id: 'profile123',
        userId: 'user123',
        fullName: 'Test Affiliate',
        country: 'US',
      };

      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.affiliateProfile.findUnique.mockResolvedValue(mockProfile as any);

      const result = await getAffiliateProfile();
      expect(result).toEqual(mockProfile);
      expect(mockPrisma.affiliateProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user123' },
      });
    });

    it('should return null when user is not affiliate', async () => {
      const mockSession = createMockSession();
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await getAffiliateProfile();
      expect(result).toBeNull();
      expect(mockPrisma.affiliateProfile.findUnique).not.toHaveBeenCalled();
    });

    it('should return null when no session', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await getAffiliateProfile();
      expect(result).toBeNull();
      expect(mockPrisma.affiliateProfile.findUnique).not.toHaveBeenCalled();
    });

    it('should return null when profile does not exist', async () => {
      const mockSession = createMockSession({
        user: {
          id: 'user123',
          email: 'test@example.com',
          tier: 'FREE',
          role: 'USER',
          isAffiliate: true,
        },
      });

      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.affiliateProfile.findUnique.mockResolvedValue(null);

      const result = await getAffiliateProfile();
      expect(result).toBeNull();
    });
  });
});
