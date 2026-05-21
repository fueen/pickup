import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadStats,
  saveStats,
  recordViewed,
  recordDeleted,
} from '../../src/services/stats-service';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetItem.mockResolvedValue(null);
  mockSetItem.mockResolvedValue(undefined);
});

describe('loadStats', () => {
  it('returns default stats when nothing stored', async () => {
    mockGetItem.mockResolvedValue(null);
    const stats = await loadStats();
    expect(stats.totalViewed).toBe(0);
    expect(stats.totalDeleted).toBe(0);
    expect(stats.totalFreedBytes).toBe(0);
    expect(stats.streakDays).toBe(0);
    expect(stats.lastActiveDate).toBeNull();
    expect(stats.weeklyHistory).toEqual([]);
  });

  it('returns parsed stats from storage', async () => {
    const stored = {
      totalViewed: 100,
      totalDeleted: 20,
      totalFreedBytes: 5000000,
      streakDays: 3,
      lastActiveDate: '2026-05-20',
      weeklyHistory: [{ date: '2026-05-20', viewed: 15, deleted: 2 }],
    };
    mockGetItem.mockResolvedValue(JSON.stringify(stored));
    const stats = await loadStats();
    expect(stats.totalViewed).toBe(100);
    expect(stats.streakDays).toBe(3);
  });

  it('returns default on parse error', async () => {
    mockGetItem.mockResolvedValue('not-json');
    const stats = await loadStats();
    expect(stats.totalViewed).toBe(0);
  });
});

describe('saveStats', () => {
  it('persists stats as JSON', async () => {
    const stats = {
      totalViewed: 30,
      totalDeleted: 5,
      totalFreedBytes: 100000,
      streakDays: 1,
      lastActiveDate: '2026-05-21',
      weeklyHistory: [{ date: '2026-05-21', viewed: 15, deleted: 0 }],
    };
    await saveStats(stats);
    expect(mockSetItem).toHaveBeenCalledWith('stats', JSON.stringify(stats));
  });
});

describe('recordViewed', () => {
  it('increments totalViewed and sets lastActiveDate', async () => {
    mockGetItem.mockResolvedValue(null);
    const stats = await recordViewed(15);
    expect(stats.totalViewed).toBe(15);
    expect(stats.lastActiveDate).not.toBeNull();
    expect(stats.streakDays).toBe(1);
    expect(mockSetItem).toHaveBeenCalledTimes(1);
  });

  it('continues streak on consecutive day', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const prevDate = yesterday.toISOString().slice(0, 10);

    const stored = {
      totalViewed: 15,
      totalDeleted: 0,
      totalFreedBytes: 0,
      streakDays: 5,
      lastActiveDate: prevDate,
      weeklyHistory: [{ date: prevDate, viewed: 15, deleted: 0 }],
    };
    mockGetItem.mockResolvedValue(JSON.stringify(stored));
    const stats = await recordViewed(15);
    expect(stats.streakDays).toBe(6);
  });

  it('resets streak when not consecutive', async () => {
    const oldDate = '2020-01-01';
    const stored = {
      totalViewed: 100,
      totalDeleted: 10,
      totalFreedBytes: 0,
      streakDays: 7,
      lastActiveDate: oldDate,
      weeklyHistory: [{ date: oldDate, viewed: 15, deleted: 0 }],
    };
    mockGetItem.mockResolvedValue(JSON.stringify(stored));
    const stats = await recordViewed(15);
    expect(stats.streakDays).toBe(1);
  });
});

describe('recordDeleted', () => {
  it('increments totalDeleted and totalFreedBytes', async () => {
    mockGetItem.mockResolvedValue(null);
    const stats = await recordDeleted(5, 2000000);
    expect(stats.totalDeleted).toBe(5);
    expect(stats.totalFreedBytes).toBe(2000000);
  });
});
