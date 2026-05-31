import { buildWeeklyReview } from '../../src/utils/weekly-review-utils';
import { DailyStats } from '../../src/types/subscription';

function day(date: string, viewed: number, deleted: number): DailyStats {
  return { date, viewed, deleted };
}

describe('buildWeeklyReview', () => {
  it('summarizes recent weekly viewed and deleted counts', () => {
    const history = [
      day('2026-05-24', 5, 1),
      day('2026-05-25', 10, 2),
      day('2026-05-26', 11, 3),
      day('2026-05-27', 12, 4),
      day('2026-05-28', 13, 5),
      day('2026-05-29', 14, 6),
      day('2026-05-30', 15, 7),
      day('2026-05-31', 16, 8),
    ];

    const review = buildWeeklyReview(history, 4);

    expect(review.totalViewed).toBe(91);
    expect(review.totalDeleted).toBe(35);
    expect(review.streakDays).toBe(4);
    expect(review.days).toHaveLength(7);
    expect(review.days[0].date).toBe('2026-05-25');
    expect(review.summary).toBe('这周相册清爽了不少');
  });

  it('returns empty state copy when there are no deletes', () => {
    const review = buildWeeklyReview([day('2026-05-31', 6, 0)], 0);

    expect(review.totalViewed).toBe(6);
    expect(review.totalDeleted).toBe(0);
    expect(review.summary).toBe('本周还没有清理记录');
  });

  it('uses major cleanup copy when many photos were deleted', () => {
    const review = buildWeeklyReview([day('2026-05-31', 70, 50)], 7);

    expect(review.summary).toBe('这周你完成了一次大扫除');
  });
});
