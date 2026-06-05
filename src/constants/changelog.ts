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
    '月份分析现在可以直接进入指定月份清理。',
    '全局界面升级为更精致的 v2.0 视觉风格。',
    '统计概览迁移到更多功能页，个人中心更清爽。',
    '使用指南升级为手势预览弹框。',
  ],
};
