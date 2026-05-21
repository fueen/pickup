import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyStats } from '../types/subscription';
import { getTodayKey } from '../utils/date-utils';

const STATS_KEY = 'stats';

interface StatsData {
  totalViewed: number;
  totalDeleted: number;
  totalFreedBytes: number;
  streakDays: number;
  lastActiveDate: string | null;
  weeklyHistory: DailyStats[];
}

const defaultStats: StatsData = {
  totalViewed: 0,
  totalDeleted: 0,
  totalFreedBytes: 0,
  streakDays: 0,
  lastActiveDate: null,
  weeklyHistory: [],
};

export async function loadStats(): Promise<StatsData> {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats;
    return JSON.parse(raw) as StatsData;
  } catch {
    return defaultStats;
  }
}

export async function saveStats(stats: StatsData): Promise<void> {
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export async function recordViewed(viewedCount: number): Promise<StatsData> {
  const stats = await loadStats();
  stats.totalViewed += viewedCount;
  stats.lastActiveDate = getTodayKey();
  updateStreak(stats);
  updateWeeklyHistory(stats, 'viewed');
  await saveStats(stats);
  return stats;
}

export async function recordDeleted(
  deletedCount: number,
  freedBytes: number,
): Promise<StatsData> {
  const stats = await loadStats();
  stats.totalDeleted += deletedCount;
  stats.totalFreedBytes += freedBytes;
  updateWeeklyHistory(stats, 'deleted');
  await saveStats(stats);
  return stats;
}

function updateStreak(stats: StatsData): void {
  const today = getTodayKey();
  if (!stats.lastActiveDate || stats.lastActiveDate === today) {
    if (stats.streakDays === 0) stats.streakDays = 1;
    return;
  }
  const last = new Date(stats.lastActiveDate);
  const todayDate = new Date(today);
  const diffDays =
    (todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
  stats.streakDays =
    diffDays === 1 ? stats.streakDays + 1 : 1;
}

function updateWeeklyHistory(
  stats: StatsData,
  _field: 'viewed' | 'deleted',
): void {
  const today = getTodayKey();
  const existing = stats.weeklyHistory.find((d) => d.date === today);
  if (existing) {
    existing.viewed = stats.totalViewed;
    existing.deleted = stats.totalDeleted;
  } else {
    stats.weeklyHistory.push({
      date: today,
      viewed: stats.totalViewed,
      deleted: stats.totalDeleted,
    });
  }
  if (stats.weeklyHistory.length > 7) {
    stats.weeklyHistory = stats.weeklyHistory.slice(-7);
  }
}
