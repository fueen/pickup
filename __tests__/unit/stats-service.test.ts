import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addRecentDeletes,
  getRecentDeletes,
  getValidRecentDeletes,
  loadStats,
  removeRecentDeletes,
  saveStats,
  recordViewed,
  recordDeleted,
} from '../../src/services/stats-service';
import { DeletedPhotoRecord } from '../../src/types/photo';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockExistingUris = new Set<string>();

jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation((uri: string) => ({
    exists: mockExistingUris.has(uri),
  })),
}));

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockExistingUris.clear();
  mockGetItem.mockResolvedValue(null);
  mockSetItem.mockResolvedValue(undefined);
});

function makeDeletedRecord(id: string, uri = `file:///cache/${id}.jpg`): DeletedPhotoRecord {
  return {
    id,
    uri,
    width: 100,
    height: 100,
    creationTime: 1000,
    fileSize: 1200,
    deletedAt: 2000,
    mediaType: 'photo',
  };
}

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

describe('recent delete records', () => {
  it('adds recent delete records before older records and caps at 200', async () => {
    const existing = Array.from({ length: 199 }, (_, i) => makeDeletedRecord(`old-${i}`));
    const incoming = [makeDeletedRecord('new-1'), makeDeletedRecord('new-2')];
    mockGetItem.mockResolvedValue(JSON.stringify(existing));

    await addRecentDeletes(incoming);

    const saved = JSON.parse(mockSetItem.mock.calls[0][1]) as DeletedPhotoRecord[];
    expect(mockSetItem).toHaveBeenCalledWith('recentDeletes', expect.any(String));
    expect(saved).toHaveLength(200);
    expect(saved[0].id).toBe('new-1');
    expect(saved[1].id).toBe('new-2');
    expect(saved[199].id).toBe('old-197');
  });

  it('returns only records whose cached file still exists and persists the filtered list', async () => {
    const kept = makeDeletedRecord('kept', 'file:///cache/kept.jpg');
    const missing = makeDeletedRecord('missing', 'file:///cache/missing.jpg');
    mockExistingUris.add(kept.uri);
    mockGetItem.mockResolvedValue(JSON.stringify([kept, missing]));

    const result = await getValidRecentDeletes();

    expect(result).toEqual([kept]);
    expect(mockSetItem).toHaveBeenCalledWith('recentDeletes', JSON.stringify([kept]));
  });

  it('keeps recently deleted records when their cached file exists', async () => {
    const justDeleted = makeDeletedRecord('just-deleted', 'file:///cache/just-deleted.jpg');
    mockExistingUris.add(justDeleted.uri);
    mockGetItem.mockResolvedValue(JSON.stringify([justDeleted]));

    const result = await getValidRecentDeletes();

    expect(result).toEqual([justDeleted]);
    expect(mockSetItem).not.toHaveBeenCalledWith('recentDeletes', expect.any(String));
  });

  it('does not rewrite storage when all recent delete records are still valid', async () => {
    const kept = makeDeletedRecord('kept', 'file:///cache/kept.jpg');
    mockExistingUris.add(kept.uri);
    mockGetItem.mockResolvedValue(JSON.stringify([kept]));

    const result = await getValidRecentDeletes();

    expect(result).toEqual([kept]);
    expect(mockSetItem).not.toHaveBeenCalledWith('recentDeletes', expect.any(String));
  });

  it('removes recent delete records by id', async () => {
    const kept = makeDeletedRecord('kept');
    const removed = makeDeletedRecord('removed');
    mockGetItem.mockResolvedValue(JSON.stringify([kept, removed]));

    await removeRecentDeletes(['removed']);
    const result = await getRecentDeletes();

    const saved = JSON.parse(mockSetItem.mock.calls[0][1]) as DeletedPhotoRecord[];
    expect(saved).toEqual([kept]);
    expect(result).toEqual([kept, removed]);
  });
});
