import bcrypt from 'bcryptjs';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import { prisma } from '@/lib/db/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env['GOOGLE_CLIENT_ID']!,
      clientSecret: process.env['GOOGLE_CLIENT_SECRET']!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        if (!user.isActive) {
          return null;
        }

        // Return user with properly typed fields
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          tier: user.tier as 'FREE' | 'PRO',
          role: user.role as 'USER' | 'ADMIN',
          isAffiliate: user.isAffiliate,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async signIn({ user, account: _account, profile: _profile }) {
      // Handle Google OAuth sign-in
      if (_account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          // Security: Prevent account takeover via OAuth
          if (existingUser && !existingUser.emailVerified) {
            console.warn('OAuth rejected: Email not verified', {
              email: user.email,
            });
            return false;
          }

          if (existingUser) {
            // Update existing user with Google data
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                image: user.image,
                emailVerified: new Date(),
              },
            });

            // Link Google account if not already linked
            const existingAccount = await prisma.account.findUnique({
              where: {
                provider_providerAccountId: {
                  provider: 'google',
                  providerAccountId: _account.providerAccountId,
                },
              },
            });

            if (!existingAccount) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: _account.type,
                  provider: _account.provider,
                  providerAccountId: _account.providerAccountId,
                  access_token: _account.access_token,
                  refresh_token: _account.refresh_token,
                  expires_at: _account.expires_at,
                  token_type: _account.token_type,
                  scope: _account.scope,
                  id_token: _account.id_token,
                },
              });
            }
          } else {
            // Create new user from Google OAuth
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
                password: null, // OAuth-only user
                tier: 'FREE',
                role: 'USER',
                isActive: true,
                isAffiliate: false, // New users start as non-affiliates
                accounts: {
                  create: {
                    type: _account.type,
                    provider: _account.provider,
                    providerAccountId: _account.providerAccountId,
                    access_token: _account.access_token,
                    refresh_token: _account.refresh_token,
                    expires_at: _account.expires_at,
                    token_type: _account.token_type,
                    scope: _account.scope,
                    id_token: _account.id_token,
                  },
                },
              },
            });
          }

          return true;
        } catch (error) {
          console.error('OAuth sign-in error:', error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account: _account, trigger, session }) {
      // Initial sign-in
      if (user) {
        token.id = user.id;
        token.tier = user.tier as 'FREE' | 'PRO';
        token.role = user.role as 'USER' | 'ADMIN';
        token.isAffiliate = user.isAffiliate as boolean;
        token['image'] = user.image;
      }

      // Handle session update (e.g., tier change, affiliate status change)
      if (trigger === 'update' && session) {
        if (session.tier) token.tier = session.tier;
        if (session.name) token.name = session.name;
        if (session.image) token['image'] = session.image;
        if (typeof session.isAffiliate === 'boolean') {
          token.isAffiliate = session.isAffiliate;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.tier = token.tier as 'FREE' | 'PRO';
        session.user.role = token.role as 'USER' | 'ADMIN';
        session.user.isAffiliate = token.isAffiliate as boolean;
        session.user.image = token['image'] as string | undefined;
      }
      return session;
    },
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      const provider = account?.provider || 'unknown';
      console.log(`User ${user.email} signed in via ${provider}`);

      if (isNewUser && account?.provider === 'google') {
        console.log(`New user registered via Google OAuth: ${user.email}`);
      }
    },

    async signOut({ session }) {
      console.log(`User ${session?.user?.email} signed out`);
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
