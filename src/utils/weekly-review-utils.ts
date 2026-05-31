import { DailyStats } from '../types/subscription';

export interface WeeklyReviewDay extends DailyStats {
  intensity: number;
}

export interface WeeklyReview {
  totalViewed: number;
  totalDeleted: number;
  streakDays: number;
  summary: string;
  days: WeeklyReviewDay[];
  hasActivity: boolean;
}

function summaryForDeletedCount(totalDeleted: number): string {
  if (totalDeleted === 0) return '本周还没有清理记录';
  if (totalDeleted < 10) return '这周完成了一次轻整理';
  if (totalDeleted < 50) return '这周相册清爽了不少';
  return '这周你完成了一次大扫除';
}

export function buildWeeklyReview(
  weeklyHistory: DailyStats[],
  streakDays: number,
): WeeklyReview {
  const days = weeklyHistory.slice(-7);
  const maxDeleted = Math.max(1, ...days.map((day) => day.deleted));
  const reviewDays = days.map((day) => ({
    ...day,
    intensity: day.deleted / maxDeleted,
  }));
  const totalViewed = days.reduce((sum, day) => sum + day.viewed, 0);
  const totalDeleted = days.reduce((sum, day) => sum + day.deleted, 0);

  return {
    totalViewed,
    totalDeleted,
    streakDays,
    summary: summaryForDeletedCount(totalDeleted),
    days: reviewDays,
    hasActivity: totalViewed > 0 || totalDeleted > 0,
  };
}
