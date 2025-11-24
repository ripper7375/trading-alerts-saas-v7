import {
  validateTierAccess,
  canAccessSymbol,
  getSymbolLimit,
  getAlertLimit,
  canCreateAlert,
  validateTimeframeAccess,
  type Tier,
} from '@/lib/tier-validation';

describe('Tier Validation - validateTierAccess', () => {
  describe('FREE tier', () => {
    it('should allow FREE tier to access XAUUSD', () => {
      const result = validateTierAccess('FREE', 'XAUUSD');
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should block FREE tier from accessing EURUSD', () => {
      const result = validateTierAccess('FREE', 'EURUSD');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('upgrade');
      expect(result.reason).toContain('PRO');
    });

    it('should block FREE tier from accessing BTCUSD', () => {
      const result = validateTierAccess('FREE', 'BTCUSD');
      expect(result.allowed).toBe(false);
    });

    it('should block FREE tier from accessing GBPUSD', () => {
      const result = validateTierAccess('FREE', 'GBPUSD');
      expect(result.allowed).toBe(false);
    });
  });

  describe('PRO tier', () => {
    it('should allow PRO tier to access any symbol', () => {
      expect(validateTierAccess('PRO', 'EURUSD').allowed).toBe(true);
      expect(validateTierAccess('PRO', 'BTCUSD').allowed).toBe(true);
      expect(validateTierAccess('PRO', 'XAUUSD').allowed).toBe(true);
      expect(validateTierAccess('PRO', 'GBPUSD').allowed).toBe(true);
    });

    it('should not have reason when allowed', () => {
      const result = validateTierAccess('PRO', 'EURUSD');
      expect(result.reason).toBeUndefined();
    });
  });

  describe('ENTERPRISE tier', () => {
    it('should allow ENTERPRISE tier to access any symbol', () => {
      expect(validateTierAccess('ENTERPRISE', 'EURUSD').allowed).toBe(true);
      expect(validateTierAccess('ENTERPRISE', 'BTCUSD').allowed).toBe(true);
      expect(validateTierAccess('ENTERPRISE', 'ANYSYMBOL').allowed).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should throw error for invalid tier', () => {
      expect(() => validateTierAccess('INVALID' as Tier, 'XAUUSD')).toThrow('Invalid tier');
    });
  });
});

describe('Tier Validation - canAccessSymbol', () => {
  it('should return true for FREE tier with XAUUSD', () => {
    expect(canAccessSymbol('FREE', 'XAUUSD')).toBe(true);
  });

  it('should return false for FREE tier with EURUSD', () => {
    expect(canAccessSymbol('FREE', 'EURUSD')).toBe(false);
  });

  it('should return true for PRO tier with any symbol', () => {
    expect(canAccessSymbol('PRO', 'EURUSD')).toBe(true);
    expect(canAccessSymbol('PRO', 'BTCUSD')).toBe(true);
  });

  it('should return true for ENTERPRISE tier with any symbol', () => {
    expect(canAccessSymbol('ENTERPRISE', 'ANYSYMBOL')).toBe(true);
  });
});

describe('Tier Validation - getSymbolLimit', () => {
  it('should return 1 for FREE tier', () => {
    expect(getSymbolLimit('FREE')).toBe(1);
  });

  it('should return 10 for PRO tier', () => {
    expect(getSymbolLimit('PRO')).toBe(10);
  });

  it('should return -1 (unlimited) for ENTERPRISE tier', () => {
    expect(getSymbolLimit('ENTERPRISE')).toBe(-1);
  });
});

describe('Tier Validation - getAlertLimit', () => {
  it('should return 5 for FREE tier', () => {
    expect(getAlertLimit('FREE')).toBe(5);
  });

  it('should return 50 for PRO tier', () => {
    expect(getAlertLimit('PRO')).toBe(50);
  });

  it('should return -1 (unlimited) for ENTERPRISE tier', () => {
    expect(getAlertLimit('ENTERPRISE')).toBe(-1);
  });
});

describe('Tier Validation - canCreateAlert', () => {
  describe('FREE tier', () => {
    it('should allow creating alerts under limit', () => {
      const result = canCreateAlert('FREE', 3);
      expect(result.allowed).toBe(true);
    });

    it('should block creating alerts at limit', () => {
      const result = canCreateAlert('FREE', 5);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Alert limit reached');
      expect(result.reason).toContain('5');
    });

    it('should block creating alerts over limit', () => {
      const result = canCreateAlert('FREE', 6);
      expect(result.allowed).toBe(false);
    });

    it('should allow first alert', () => {
      const result = canCreateAlert('FREE', 0);
      expect(result.allowed).toBe(true);
    });
  });

  describe('PRO tier', () => {
    it('should allow creating alerts under limit', () => {
      const result = canCreateAlert('PRO', 30);
      expect(result.allowed).toBe(true);
    });

    it('should block creating alerts at limit', () => {
      const result = canCreateAlert('PRO', 50);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('50');
    });
  });

  describe('ENTERPRISE tier', () => {
    it('should allow unlimited alerts', () => {
      expect(canCreateAlert('ENTERPRISE', 100).allowed).toBe(true);
      expect(canCreateAlert('ENTERPRISE', 1000).allowed).toBe(true);
      expect(canCreateAlert('ENTERPRISE', 10000).allowed).toBe(true);
    });
  });
});

describe('Tier Validation - validateTimeframeAccess', () => {
  describe('FREE tier', () => {
    it('should allow H1 timeframe', () => {
      const result = validateTimeframeAccess('FREE', 'H1');
      expect(result.allowed).toBe(true);
    });

    it('should allow H4 timeframe', () => {
      const result = validateTimeframeAccess('FREE', 'H4');
      expect(result.allowed).toBe(true);
    });

    it('should allow D1 timeframe', () => {
      const result = validateTimeframeAccess('FREE', 'D1');
      expect(result.allowed).toBe(true);
    });

    it('should block M1 timeframe', () => {
      const result = validateTimeframeAccess('FREE', 'M1');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Timeframe M1 requires PRO tier');
    });

    it('should block M5 timeframe', () => {
      const result = validateTimeframeAccess('FREE', 'M5');
      expect(result.allowed).toBe(false);
    });
  });

  describe('PRO tier', () => {
    it('should allow all timeframes', () => {
      expect(validateTimeframeAccess('PRO', 'M1').allowed).toBe(true);
      expect(validateTimeframeAccess('PRO', 'M5').allowed).toBe(true);
      expect(validateTimeframeAccess('PRO', 'H1').allowed).toBe(true);
      expect(validateTimeframeAccess('PRO', 'D1').allowed).toBe(true);
    });
  });

  describe('ENTERPRISE tier', () => {
    it('should allow all timeframes', () => {
      expect(validateTimeframeAccess('ENTERPRISE', 'M1').allowed).toBe(true);
      expect(validateTimeframeAccess('ENTERPRISE', 'CUSTOM').allowed).toBe(true);
    });
  });
});
