import { APP_VERSION } from './app-info';

export interface ChangelogEntry {
  version: string;
  title: string;
  subtitle: string;
  highlights: string[];
}

export const CURRENT_CHANGELOG: ChangelogEntry = {
  version: APP_VERSION,
  title: 'PickUp 已更新',
  subtitle: '看看这次有什么新变化',
  highlights: [
    '新增待删除照片列表，支持缩略图平铺、多选和批量还原。',
    '优化删除确认页和照片预览体验，删除前可以更安心地检查细节。',
    '更多功能集中到中间 Tab，月份分析、每周回顾和成就更容易找到。',
  ],
};
