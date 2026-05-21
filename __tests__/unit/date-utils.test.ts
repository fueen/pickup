import { getTodayKey, isNewDay, formatPhotoDate } from '../../src/utils/date-utils';

describe('getTodayKey', () => {
  it('returns YYYY-MM-DD format', () => {
    const result = getTodayKey();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('isNewDay', () => {
  it('returns true when stored date differs from today', () => {
    expect(isNewDay('2020-01-01')).toBe(true);
  });

  it('returns false when stored date is today', () => {
    const today = getTodayKey();
    expect(isNewDay(today)).toBe(false);
  });
});

describe('formatPhotoDate', () => {
  it('formats a Unix ms timestamp into human-readable Chinese date', () => {
    const ts = new Date('2024-03-15T14:30:00').getTime();
    const result = formatPhotoDate(ts);
    expect(result).toContain('2024');
    expect(result).toContain('3');
  });

  it('returns empty string for invalid timestamp', () => {
    expect(formatPhotoDate(NaN)).toBe('');
  });
});
