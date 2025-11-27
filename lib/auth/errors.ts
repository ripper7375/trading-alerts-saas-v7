/**
 * Authentication error types and messages
 * Used throughout the authentication system for consistent error handling
 */

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class OAuthError extends AuthError {
  constructor(
    message: string,
    public provider: string
  ) {
    super(message, 'OAUTH_ERROR', 401);
    this.name = 'OAuthError';
  }
}

export class CredentialsError extends AuthError {
  constructor(message: string = 'Invalid email or password') {
    super(message, 'CREDENTIALS_ERROR', 401);
    this.name = 'CredentialsError';
  }
}

export class AccountLinkingError extends AuthError {
  constructor(message: string) {
    super(message, 'ACCOUNT_LINKING_ERROR', 400);
    this.name = 'AccountLinkingError';
  }
}

export class TierAccessError extends AuthError {
  constructor(message: string) {
    super(message, 'TIER_ACCESS_ERROR', 403);
    this.name = 'TierAccessError';
  }
}

/**
 * Get user-friendly error message for OAuth errors
 */
export function getOAuthErrorMessage(errorType: string): string {
  const errors: Record<string, string> = {
    OAuthSignin: 'Failed to connect to Google. Please try again.',
    OAuthCallback: 'Google authorization failed. Please try again.',
    OAuthAccountNotLinked:
      'Email already in use. Please sign in with your password first.',
    EmailCreateAccount: 'Email already registered. Please sign in instead.',
    Callback: 'Authentication error. Please try again.',
    OAuthUnavailable: 'Google sign-in is temporarily unavailable.',
  };

  return errors[errorType] || 'An unexpected error occurred. Please try again.';
}

/**
 * Get user-friendly error message for general auth errors
 */
export function getAuthErrorMessage(errorCode: string): string {
  const messages: Record<string, string> = {
    CREDENTIALS_ERROR:
      'Invalid email or password. Please check your credentials.',
    OAUTH_ERROR: 'Google sign-in failed. Please try again.',
    ACCOUNT_LINKING_ERROR: 'Cannot link accounts. Please contact support.',
    TIER_ACCESS_ERROR: 'You do not have permission to access this resource.',
    SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
    UNAUTHORIZED: 'You must be signed in to access this resource.',
    FORBIDDEN: 'You do not have permission to perform this action.',
  };

  return (
    messages[errorCode] || 'An authentication error occurred. Please try again.'
  );
}
