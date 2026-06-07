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
    '修复 Live Photo 预览播放不生效的问题。',
    '时间从新到旧排序在重新打开 App 后会重新加载最新照片。',
    '相册选择页升级为拼贴式照片墙。',
    'App 图标升级为 Picked Cards 品牌图标。',
  ],
};
