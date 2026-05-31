import { buildAchievements } from '../../src/utils/achievement-utils';

describe('buildAchievements', () => {
  it('builds unlocked and locked achievements from stats', () => {
    const achievements = buildAchievements({
      totalViewed: 25,
      totalDeleted: 8,
      totalFreedBytes: 200_000_000,
      streakDays: 2,
      recentDeleteCount: 8,
    });

    const first = achievements.find((item) => item.id === 'first-cleanup');
    const deleteStarter = achievements.find((item) => item.id === 'delete-starter');
    const streak = achievements.find((item) => item.id === 'streak-3');

    expect(first?.unlocked).toBe(true);
    expect(first?.progress).toBe(1);
    expect(deleteStarter?.unlocked).toBe(false);
    expect(deleteStarter?.progressText).toBe('8 / 10');
    expect(streak?.progressText).toBe('2 / 3');
  });

  it('caps progress at 1 when values exceed targets', () => {
    const achievements = buildAchievements({
      totalViewed: 900,
      totalDeleted: 120,
      totalFreedBytes: 1_000_000_000,
      streakDays: 12,
      recentDeleteCount: 120,
    });

    expect(achievements.every((item) => item.unlocked)).toBe(true);
    expect(achievements.every((item) => item.progress === 1)).toBe(true);
    expect(achievements.every((item) => item.progressText === '已解锁')).toBe(true);
  });
});
