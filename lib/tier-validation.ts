/**
 * Trading Alerts SaaS - Tier Validation
 * Validates user access based on subscription tier
 */

export type Tier = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface TierConfig {
  maxSymbols: number;
  allowedSymbols: string[];
  allowedTimeframes: string[];
  maxAlerts: number;
}

const TIER_CONFIGS: Record<Tier, TierConfig> = {
  FREE: {
    maxSymbols: 1,
    allowedSymbols: ['XAUUSD'],
    allowedTimeframes: ['H1', 'H4', 'D1'],
    maxAlerts: 5,
  },
  PRO: {
    maxSymbols: 10,
    allowedSymbols: ['*'], // All symbols
    allowedTimeframes: ['*'], // All timeframes
    maxAlerts: 50,
  },
  ENTERPRISE: {
    maxSymbols: -1, // Unlimited
    allowedSymbols: ['*'],
    allowedTimeframes: ['*'],
    maxAlerts: -1, // Unlimited
  },
};

export interface ValidationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Validate if a tier can access a specific symbol
 */
export function validateTierAccess(tier: Tier, symbol: string): ValidationResult {
  if (!TIER_CONFIGS[tier]) {
    throw new Error(`Invalid tier: ${tier}`);
  }

  const config = TIER_CONFIGS[tier];

  // Check if symbol is allowed
  if (config.allowedSymbols[0] === '*') {
    return { allowed: true };
  }

  if (config.allowedSymbols.includes(symbol)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Symbol ${symbol} requires ${tier === 'FREE' ? 'PRO' : 'ENTERPRISE'} tier. Please upgrade.`,
  };
}

/**
 * Check if user can access symbol
 */
export function canAccessSymbol(tier: Tier, symbol: string): boolean {
  const result = validateTierAccess(tier, symbol);
  return result.allowed;
}

/**
 * Get symbol limit for tier
 */
export function getSymbolLimit(tier: Tier): number {
  return TIER_CONFIGS[tier].maxSymbols;
}

/**
 * Get alert limit for tier
 */
export function getAlertLimit(tier: Tier): number {
  return TIER_CONFIGS[tier].maxAlerts;
}

/**
 * Check if user can create more alerts
 */
export function canCreateAlert(tier: Tier, currentAlerts: number): ValidationResult {
  const limit = getAlertLimit(tier);

  if (limit === -1) {
    return { allowed: true };
  }

  if (currentAlerts < limit) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Alert limit reached (${limit}). Upgrade to ${tier === 'FREE' ? 'PRO' : 'ENTERPRISE'} for more alerts.`,
  };
}

/**
 * Validate timeframe access
 */
export function validateTimeframeAccess(tier: Tier, timeframe: string): ValidationResult {
  const config = TIER_CONFIGS[tier];

  if (config.allowedTimeframes[0] === '*') {
    return { allowed: true };
  }

  if (config.allowedTimeframes.includes(timeframe)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Timeframe ${timeframe} requires PRO tier or higher.`,
  };
}
