import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      tier: 'FREE' | 'PRO';
      role: 'USER' | 'ADMIN';
      isAffiliate: boolean;
      image?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    tier: 'FREE' | 'PRO';
    role: 'USER' | 'ADMIN';
    isAffiliate: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    tier: 'FREE' | 'PRO';
    role: 'USER' | 'ADMIN';
    isAffiliate: boolean;
  }
}
