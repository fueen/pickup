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
  it('includes year month day and relative day for today', () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const result = formatPhotoDate(now.getTime());
    expect(result).toBe(`${y}年${m}月${d}日 · 今天`);
  });

  it('includes year month day and 昨天 for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const y = yesterday.getFullYear();
    const m = yesterday.getMonth() + 1;
    const d = yesterday.getDate();
    const result = formatPhotoDate(yesterday.getTime());
    expect(result).toBe(`${y}年${m}月${d}日 · 昨天`);
  });

  it('includes year month day and X天前 for older dates', () => {
    const ts = new Date('2024-03-15T14:30:00').getTime();
    const result = formatPhotoDate(ts);
    expect(result).toMatch(/2024年3月15日 · \d+天前/);
  });

  it('returns empty string for invalid timestamp', () => {
    expect(formatPhotoDate(NaN)).toBe('');
  });
});
