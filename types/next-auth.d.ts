import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      tier: string;
      role: string;
      image?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    tier: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    tier: string;
    role: string;
  }
}
