import { Tokens } from '../design-tokens';

export interface AchievementInput {
  totalViewed: number;
  totalDeleted: number;
  totalFreedBytes: number;
  streakDays: number;
  recentDeleteCount: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  current: number;
  target: number;
  progress: number;
  progressText: string;
  unlocked: boolean;
}

interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  target: number;
  getCurrent: (input: AchievementInput) => number;
}

const MEGABYTE = 1_000_000;

const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first-cleanup',
    title: '初次整理',
    description: '浏览第一张照片',
    icon: 'sparkles',
    color: Tokens.color.accent,
    target: 1,
    getCurrent: (input) => input.totalViewed,
  },
  {
    id: 'delete-starter',
    title: '清理新手',
    description: '最近删除达到 10 张',
    icon: 'delete-sweep-outline',
    color: Tokens.color.danger,
    target: 10,
    getCurrent: (input) => input.recentDeleteCount,
  },
  {
    id: 'space-saver',
    title: '空间救星',
    description: '释放 500 MB 空间',
    icon: 'database-arrow-down-outline',
    color: Tokens.color.accent,
    target: 500 * MEGABYTE,
    getCurrent: (input) => input.totalFreedBytes,
  },
  {
    id: 'streak-3',
    title: '连续行动',
    description: '连续整理 3 天',
    icon: 'calendar-check',
    color: Tokens.color.safe,
    target: 3,
    getCurrent: (input) => input.streakDays,
  },
  {
    id: 'album-keeper',
    title: '相册管家',
    description: '累计浏览 500 张',
    icon: 'image-multiple-outline',
    color: '#64D2FF',
    target: 500,
    getCurrent: (input) => input.totalViewed,
  },
];

function capProgress(current: number, target: number): number {
  if (target <= 0) return 1;
  return Math.min(1, Math.max(0, current / target));
}

function progressText(current: number, target: number, unlocked: boolean): string {
  if (unlocked) return '已解锁';
  if (target >= MEGABYTE) {
    return `${Math.floor(current / MEGABYTE)} / ${Math.floor(target / MEGABYTE)} MB`;
  }
  return `${Math.min(current, target)} / ${target}`;
}

export function buildAchievements(input: AchievementInput): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const current = Math.max(0, Math.floor(definition.getCurrent(input)));
    const progress = capProgress(current, definition.target);
    const unlocked = progress >= 1;

    return {
      id: definition.id,
      title: definition.title,
      description: definition.description,
      icon: definition.icon,
      color: definition.color,
      current,
      target: definition.target,
      progress,
      progressText: progressText(current, definition.target, unlocked),
      unlocked,
    };
  });
}
