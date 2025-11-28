import { authOptions, GET, POST } from '@/lib/auth/auth-options';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    account: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('next-auth', () => {
  const actual = jest.requireActual('next-auth');
  return jest.fn(() => ({
    ...actual,
    GET: jest.fn(),
    POST: jest.fn(),
  }));
});

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('AuthOptions Configuration', () => {
  describe('authOptions', () => {
    it('should have correct session strategy', () => {
      expect(authOptions.session).toBeDefined();
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should have correct session maxAge (30 days)', () => {
      expect(authOptions.session?.maxAge).toBe(30 * 24 * 60 * 60);
    });

    it('should have correct pages configuration', () => {
      expect(authOptions.pages).toBeDefined();
      expect(authOptions.pages?.signIn).toBe('/login');
      expect(authOptions.pages?.error).toBe('/login');
    });

    it('should have Google provider configured', () => {
      expect(authOptions.providers).toBeDefined();
      expect(authOptions.providers.length).toBeGreaterThan(0);
    });

    it('should have callbacks defined', () => {
      expect(authOptions.callbacks).toBeDefined();
      expect(authOptions.callbacks?.signIn).toBeDefined();
      expect(authOptions.callbacks?.jwt).toBeDefined();
      expect(authOptions.callbacks?.session).toBeDefined();
    });

    it('should have events defined', () => {
      expect(authOptions.events).toBeDefined();
      expect(authOptions.events?.signIn).toBeDefined();
      expect(authOptions.events?.signOut).toBeDefined();
    });
  });

  describe('Credentials Provider', () => {
    let credentialsProvider: any;

    beforeEach(() => {
      jest.clearAllMocks();
      // Find credentials provider
      credentialsProvider = authOptions.providers.find(
        (p: any) => p.id === 'credentials'
      );
    });

    it('should have credentials provider configured', () => {
      expect(credentialsProvider).toBeDefined();
      expect(credentialsProvider.name).toBe('credentials');
    });

    it('should have email and password credentials', () => {
      expect(credentialsProvider.credentials).toBeDefined();
      expect(credentialsProvider.credentials.email).toBeDefined();
      expect(credentialsProvider.credentials.password).toBeDefined();
    });

    describe('authorize function', () => {
      it('should return null when credentials are missing', async () => {
        const result = await credentialsProvider.authorize({});
        expect(result).toBeNull();
      });

      it('should return null when email is missing', async () => {
        const result = await credentialsProvider.authorize({ password: 'test123' });
        expect(result).toBeNull();
      });

      it('should return null when password is missing', async () => {
        const result = await credentialsProvider.authorize({ email: 'test@example.com' });
        expect(result).toBeNull();
      });

      it('should return null when user not found', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);

        const result = await credentialsProvider.authorize({
          email: 'nonexistent@example.com',
          password: 'test123',
        });

        expect(result).toBeNull();
        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: 'nonexistent@example.com' },
        });
      });

      it('should return null when user has no password (OAuth only)', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
          id: 'user123',
          email: 'oauth@example.com',
          password: null,
          isActive: true,
          tier: 'FREE',
          role: 'USER',
          isAffiliate: false,
        } as any);

        const result = await credentialsProvider.authorize({
          email: 'oauth@example.com',
          password: 'test123',
        });

        expect(result).toBeNull();
      });

      it('should return null when password is invalid', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
          id: 'user123',
          email: 'test@example.com',
          password: 'hashed_password',
          name: 'Test User',
          image: null,
          isActive: true,
          tier: 'FREE',
          role: 'USER',
          isAffiliate: false,
        } as any);

        mockBcrypt.compare.mockResolvedValue(false as never);

        const result = await credentialsProvider.authorize({
          email: 'test@example.com',
          password: 'wrong_password',
        });

        expect(result).toBeNull();
        expect(mockBcrypt.compare).toHaveBeenCalledWith('wrong_password', 'hashed_password');
      });

      it('should return null when user is inactive', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
          id: 'user123',
          email: 'test@example.com',
          password: 'hashed_password',
          name: 'Test User',
          image: null,
          isActive: false,
          tier: 'FREE',
          role: 'USER',
          isAffiliate: false,
        } as any);

        mockBcrypt.compare.mockResolvedValue(true as never);

        const result = await credentialsProvider.authorize({
          email: 'test@example.com',
          password: 'correct_password',
        });

        expect(result).toBeNull();
      });

      it('should return user object on successful authentication', async () => {
        const mockUser = {
          id: 'user123',
          email: 'test@example.com',
          password: 'hashed_password',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg',
          isActive: true,
          tier: 'FREE',
          role: 'USER',
          isAffiliate: false,
        };

        mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
        mockBcrypt.compare.mockResolvedValue(true as never);

        const result = await credentialsProvider.authorize({
          email: 'test@example.com',
          password: 'correct_password',
        });

        expect(result).toEqual({
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg',
          tier: 'FREE',
          role: 'USER',
          isAffiliate: false,
        });
      });

      it('should return user with PRO tier and ADMIN role', async () => {
        const mockUser = {
          id: 'admin123',
          email: 'admin@example.com',
          password: 'hashed_password',
          name: 'Admin User',
          image: null,
          isActive: true,
          tier: 'PRO',
          role: 'ADMIN',
          isAffiliate: true,
        };

        mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
        mockBcrypt.compare.mockResolvedValue(true as never);

        const result = await credentialsProvider.authorize({
          email: 'admin@example.com',
          password: 'admin_password',
        });

        expect(result).toEqual({
          id: 'admin123',
          email: 'admin@example.com',
          name: 'Admin User',
          image: null,
          tier: 'PRO',
          role: 'ADMIN',
          isAffiliate: true,
        });
      });
    });
  });

  describe('JWT Callback', () => {
    it('should be defined', () => {
      expect(authOptions.callbacks?.jwt).toBeDefined();
    });

    it('should handle initial sign-in', async () => {
      const token = { sub: 'user123' };
      const user = {
        id: 'user123',
        email: 'test@example.com',
        tier: 'FREE' as const,
        role: 'USER' as const,
        isAffiliate: false,
        image: 'avatar.jpg',
      };

      const result = await authOptions.callbacks?.jwt?.({
        token,
        user,
        account: null,
        trigger: 'signIn',
        session: null,
      } as any);

      expect(result).toHaveProperty('id', 'user123');
      expect(result).toHaveProperty('tier', 'FREE');
      expect(result).toHaveProperty('role', 'USER');
      expect(result).toHaveProperty('isAffiliate', false);
    });

    it('should handle session update', async () => {
      const token = {
        sub: 'user123',
        tier: 'FREE',
        role: 'USER',
        isAffiliate: false,
      };

      const result = await authOptions.callbacks?.jwt?.({
        token,
        user: null,
        account: null,
        trigger: 'update',
        session: {
          tier: 'PRO',
          isAffiliate: true,
        },
      } as any);

      expect(result).toHaveProperty('tier', 'PRO');
      expect(result).toHaveProperty('isAffiliate', true);
    });
  });

  describe('Session Callback', () => {
    it('should be defined', () => {
      expect(authOptions.callbacks?.session).toBeDefined();
    });

    it('should populate session user from token', async () => {
      const session = {
        user: {},
        expires: new Date().toISOString(),
      };

      const token = {
        id: 'user123',
        tier: 'PRO',
        role: 'ADMIN',
        isAffiliate: true,
        image: 'avatar.jpg',
      };

      const result = await authOptions.callbacks?.session?.({
        session,
        token,
      } as any);

      expect(result.user).toHaveProperty('id', 'user123');
      expect(result.user).toHaveProperty('tier', 'PRO');
      expect(result.user).toHaveProperty('role', 'ADMIN');
      expect(result.user).toHaveProperty('isAffiliate', true);
      expect(result.user).toHaveProperty('image', 'avatar.jpg');
    });
  });

  describe('SignIn Callback', () => {
    it('should be defined', () => {
      expect(authOptions.callbacks?.signIn).toBeDefined();
    });

    it('should allow non-OAuth sign-in', async () => {
      const result = await authOptions.callbacks?.signIn?.({
        user: { email: 'test@example.com' },
        account: null,
        profile: null,
      } as any);

      expect(result).toBe(true);
    });
  });

  describe('Exports', () => {
    it('should export GET handler', () => {
      expect(GET).toBeDefined();
    });

    it('should export POST handler', () => {
      expect(POST).toBeDefined();
    });
  });
});
