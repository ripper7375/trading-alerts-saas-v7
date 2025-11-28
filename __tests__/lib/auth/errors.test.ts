import {
  AuthError,
  OAuthError,
  CredentialsError,
  AccountLinkingError,
  TierAccessError,
  getOAuthErrorMessage,
  getAuthErrorMessage,
} from '@/lib/auth/errors';

describe('Authentication Errors', () => {
  describe('AuthError', () => {
    it('should create AuthError with correct properties', () => {
      const error = new AuthError('Test message', 'TEST_CODE', 403);
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthError');
    });

    it('should default to 401 status code', () => {
      const error = new AuthError('Test message', 'TEST_CODE');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('OAuthError', () => {
    it('should create OAuthError with provider', () => {
      const error = new OAuthError('OAuth failed', 'google');
      expect(error.message).toBe('OAuth failed');
      expect(error.provider).toBe('google');
      expect(error.code).toBe('OAUTH_ERROR');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('OAuthError');
    });
  });

  describe('CredentialsError', () => {
    it('should create CredentialsError with default message', () => {
      const error = new CredentialsError();
      expect(error.message).toBe('Invalid email or password');
      expect(error.code).toBe('CREDENTIALS_ERROR');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('CredentialsError');
    });

    it('should create CredentialsError with custom message', () => {
      const error = new CredentialsError('Custom error');
      expect(error.message).toBe('Custom error');
    });
  });

  describe('AccountLinkingError', () => {
    it('should create AccountLinkingError', () => {
      const error = new AccountLinkingError('Cannot link accounts');
      expect(error.message).toBe('Cannot link accounts');
      expect(error.code).toBe('ACCOUNT_LINKING_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('AccountLinkingError');
    });
  });

  describe('TierAccessError', () => {
    it('should create TierAccessError', () => {
      const error = new TierAccessError('PRO tier required');
      expect(error.message).toBe('PRO tier required');
      expect(error.code).toBe('TIER_ACCESS_ERROR');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('TierAccessError');
    });
  });

  describe('getOAuthErrorMessage', () => {
    it('should return correct message for OAuthSignin', () => {
      const message = getOAuthErrorMessage('OAuthSignin');
      expect(message).toBe('Failed to connect to Google. Please try again.');
    });

    it('should return correct message for OAuthCallback', () => {
      const message = getOAuthErrorMessage('OAuthCallback');
      expect(message).toBe('Google authorization failed. Please try again.');
    });

    it('should return correct message for OAuthAccountNotLinked', () => {
      const message = getOAuthErrorMessage('OAuthAccountNotLinked');
      expect(message).toBe('Email already in use. Please sign in with your password first.');
    });

    it('should return correct message for EmailCreateAccount', () => {
      const message = getOAuthErrorMessage('EmailCreateAccount');
      expect(message).toBe('Email already registered. Please sign in instead.');
    });

    it('should return correct message for Callback', () => {
      const message = getOAuthErrorMessage('Callback');
      expect(message).toBe('Authentication error. Please try again.');
    });

    it('should return correct message for OAuthUnavailable', () => {
      const message = getOAuthErrorMessage('OAuthUnavailable');
      expect(message).toBe('Google sign-in is temporarily unavailable.');
    });

    it('should return default message for unknown error', () => {
      const message = getOAuthErrorMessage('UnknownError');
      expect(message).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('getAuthErrorMessage', () => {
    it('should return correct message for CREDENTIALS_ERROR', () => {
      const message = getAuthErrorMessage('CREDENTIALS_ERROR');
      expect(message).toBe('Invalid email or password. Please check your credentials.');
    });

    it('should return correct message for OAUTH_ERROR', () => {
      const message = getAuthErrorMessage('OAUTH_ERROR');
      expect(message).toBe('Google sign-in failed. Please try again.');
    });

    it('should return correct message for ACCOUNT_LINKING_ERROR', () => {
      const message = getAuthErrorMessage('ACCOUNT_LINKING_ERROR');
      expect(message).toBe('Cannot link accounts. Please contact support.');
    });

    it('should return correct message for TIER_ACCESS_ERROR', () => {
      const message = getAuthErrorMessage('TIER_ACCESS_ERROR');
      expect(message).toBe('You do not have permission to access this resource.');
    });

    it('should return correct message for SESSION_EXPIRED', () => {
      const message = getAuthErrorMessage('SESSION_EXPIRED');
      expect(message).toBe('Your session has expired. Please sign in again.');
    });

    it('should return correct message for UNAUTHORIZED', () => {
      const message = getAuthErrorMessage('UNAUTHORIZED');
      expect(message).toBe('You must be signed in to access this resource.');
    });

    it('should return correct message for FORBIDDEN', () => {
      const message = getAuthErrorMessage('FORBIDDEN');
      expect(message).toBe('You do not have permission to perform this action.');
    });

    it('should return default message for unknown error code', () => {
      const message = getAuthErrorMessage('UNKNOWN_CODE');
      expect(message).toBe('An authentication error occurred. Please try again.');
    });
  });
});
