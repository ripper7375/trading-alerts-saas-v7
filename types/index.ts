/**
 * Central type definitions for Trading Alerts SaaS V7
 *
 * This file exports all types used across the application.
 * Import from this file rather than individual type files.
 *
 * @example
 * import { User, Alert, Tier } from '@/types';
 */

// Re-export all types
export * from './user';
export * from './tier';
export * from './alert';
export * from './indicator';
export * from './api';

// Re-export Prisma types
export type { User, Alert, Subscription, Watchlist, WatchlistItem } from '@prisma/client';
