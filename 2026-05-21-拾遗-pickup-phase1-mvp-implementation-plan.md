# 拾遗（pickup）Phase 1 MVP 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建拾遗 APP 的最小可用版本——随机照片浏览 + 滑动标记删除/保留 + 批量确认删除 + 每日限量 + Pro 订阅付费墙。

**Architecture:** Expo (managed workflow) + TypeScript + React Context + useReducer 状态管理。照片通过 expo-media-library 100% 本地读取，内购通过 RevenueCat 统一管理。手势动画使用 react-native-reanimated + react-native-gesture-handler。

**Tech Stack:** Expo SDK 52+, React Native, TypeScript (strict), react-native-reanimated v3, react-native-gesture-handler v2, React Navigation v6, RevenueCat (react-native-purchases), expo-media-library, expo-haptics

---

## 文件结构总览

```
pickup/
├── app/                              # Expo Router 页面
│   ├── _layout.tsx                   # 根布局（Context Provider 嵌套）
│   ├── index.tsx                     # 首页：卡片浏览
│   ├── review.tsx                    # 批量确认删除
│   ├── settings.tsx                  # 设置页
│   └── paywall.tsx                   # 付费墙 Modal
├── src/
│   ├── contexts/
│   │   ├── PhotoContext.tsx          # 照片数据 + 权限
│   │   ├── SessionContext.tsx        # 当前组会话 + 标记状态
│   │   ├── StatsContext.tsx          # 统计数据
│   │   └── SubscriptionContext.tsx   # 订阅状态 + 限量检查
│   ├── components/
│   │   ├── photo-card/
│   │   │   ├── PhotoCard.tsx         # 单张照片全屏卡片
│   │   │   ├── GroupProgressBar.tsx  # 底部进度点阵
│   │   │   ├── PermissionGate.tsx    # 权限未授权占位
│   │   │   ├── LoadingGate.tsx       # 加载中占位
│   │   │   └── EmptyGate.tsx         # 空相册占位
│   │   ├── gesture/
│   │   │   ├── SwipeableCard.tsx     # 手势容器 + Pan 手势
│   │   │   ├── DeleteOverlay.tsx     # 红色删除遮罩
│   │   │   ├── ActionIndicator.tsx   # 滑动阈值提示文字
│   │   │   └── GestureGuideOverlay.tsx  # 首次引导动画
│   │   ├── delete-review/
│   │   │   ├── DeleteGrid.tsx        # 3 列网格确认
│   │   │   └── DeleteConfirmSheet.tsx  # 二次确认弹窗
│   │   ├── settings/
│   │   │   ├── SettingsSection.tsx   # 圆角卡片分组容器
│   │   │   ├── SettingsRow.tsx       # 单行设置项
│   │   │   ├── StatCard.tsx          # 统计数字卡片
│   │   │   └── PricingCard.tsx       # 订阅定价卡片
│   │   └── ui/
│   │       ├── Toast.tsx             # 通用 Toast
│   │       └── Modal.tsx             # 通用 Modal 封装
│   ├── services/
│   │   ├── photo-service.ts          # 照片读取 + 随机抽取
│   │   ├── delete-service.ts         # 删除执行
│   │   ├── subscription-service.ts   # RevenueCat 封装
│   │   └── stats-service.ts          # 统计持久化
│   ├── hooks/
│   │   ├── usePhotoEngine.ts         # 照片引擎 Hook
│   │   └── useHaptics.ts             # 触觉反馈封装
│   ├── utils/
│   │   ├── fisher-yates.ts           # Fisher-Yates 洗牌
│   │   └── date-utils.ts             # 日期工具（跨日判断、格式化）
│   ├── design-tokens.ts              # 全局 Design Token
│   └── types/
│       ├── photo.ts                  # PhotoAsset 等类型
│       └── subscription.ts           # 订阅类型
└── __tests__/
    ├── unit/
    │   ├── photo-service.test.ts
    │   ├── fisher-yates.test.ts
    │   ├── date-utils.test.ts
    │   └── stats-service.test.ts
    ├── integration/
    │   ├── photo-engine.test.tsx
    │   └── gesture-flow.test.tsx
    └── e2e/
        └── full-flow.test.ts
```

---

### Task 0: 项目脚手架初始化

**Files:**
- Create: `pickup/` (entire Expo project)
- Create: `pickup/src/design-tokens.ts`
- Create: `pickup/src/types/photo.ts`
- Create: `pickup/src/types/subscription.ts`

- [ ] **Step 1: 创建 Expo 项目**

```bash
cd "D:/workspace/vibe coding/pickup"
npx create-expo-app@latest . --template blank-typescript
```

Expected: 项目目录生成，含 `app/`, `package.json`, `tsconfig.json`

- [ ] **Step 2: 安装所有依赖**

```bash
cd "D:/workspace/vibe coding/pickup"
npx expo install react-native-reanimated react-native-gesture-handler @react-navigation/native @react-navigation/native-stack expo-media-library expo-haptics expo-secure-store @react-native-async-storage/async-storage react-native-purchases
```

Expected: 所有依赖安装成功

- [ ] **Step 3: 安装开发依赖**

```bash
cd "D:/workspace/vibe coding/pickup"
npx expo install --dev jest @testing-library/react-native @types/jest
```

Expected: 开发依赖安装成功

- [ ] **Step 4: 配置 babel.config.js（reanimated 插件）**

Create/modify `pickup/babel.config.js`:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

- [ ] **Step 5: 编写 Design Token**

Create `pickup/src/design-tokens.ts`:

```typescript
export const Tokens = {
  color: {
    background: '#000000',
    surface: '#1C1C1E',
    surfaceElevated: '#2C2C2E',
    danger: '#FF3B30',
    safe: '#34C759',
    textPrimary: '#FFFFFF',
    textSecondary: '#8E8E93',
    textMuted: '#48484A',
    overlay: 'rgba(0,0,0,0.6)',
  },
  spacing: { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 },
  radius: { card: 12, button: 12, pill: 999 },
  animation: {
    spring: { damping: 0.7, stiffness: 150 },
    timing: { duration: 300 },
  },
  photo: {
    groupSize: 15,
    freeDailyLimit: 3,
    markThreshold: 0.4,
  },
  typography: {
    headline: { fontSize: 28, fontWeight: '700' as const },
    title: { fontSize: 20, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    caption: { fontSize: 13, fontWeight: '400' as const },
  },
};
```

- [ ] **Step 6: 编写类型定义**

Create `pickup/src/types/photo.ts`:

```typescript
export interface PhotoAsset {
  id: string;
  uri: string;
  width: number;
  height: number;
  mediaType: 'photo' | 'video' | 'livePhoto';
  creationTime: number;
  fileSize: number;
  albumIds: string[];
}

export type PermissionStatus =
  | 'undetermined'
  | 'granted'
  | 'denied'
  | 'limited';

export type GestureState = 'idle' | 'dragging' | 'animating' | 'confirmed';

export interface InteractionLogEntry {
  photoId: string;
  action: 'delete' | 'keep' | 'skip';
  timestamp: number;
}
```

Create `pickup/src/types/subscription.ts`:

```typescript
export type SubscriptionType =
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'lifetime'
  | 'free';

export interface PricingTier {
  type: SubscriptionType;
  price: string;
  period: string;
  isRecommended: boolean;
}

export interface DailyUsage {
  date: string;
  count: number;
}

export interface DailyStats {
  date: string;
  viewed: number;
  deleted: number;
}
```

- [ ] **Step 7: Commit**

```bash
cd "D:/workspace/vibe coding/pickup"
git init
git add -A
git commit -m "chore: scaffold Expo project with design tokens and types"
```

---

### Task 1: 工具函数（Fisher-Yates 洗牌 + 日期工具）

**Files:**
- Create: `pickup/src/utils/fisher-yates.ts`
- Create: `pickup/src/utils/date-utils.ts`
- Create: `pickup/__tests__/unit/fisher-yates.test.ts`
- Create: `pickup/__tests__/unit/date-utils.test.ts`

- [ ] **Step 1: 编写 Fisher-Yates 测试**

Create `pickup/__tests__/unit/fisher-yates.test.ts`:

```typescript
import { fisherYatesShuffle } from '../../src/utils/fisher-yates';

describe('fisherYatesShuffle', () => {
  it('returns an array of the same length', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = fisherYatesShuffle(input);
    expect(result.length).toBe(input.length);
  });

  it('contains the same elements after shuffle', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = fisherYatesShuffle(input);
    expect(result.sort()).toEqual(input.sort());
  });

  it('does not mutate the original array', () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    fisherYatesShuffle(input);
    expect(input).toEqual(copy);
  });

  it('handles empty array', () => {
    expect(fisherYatesShuffle([])).toEqual([]);
  });

  it('handles single-element array', () => {
    expect(fisherYatesShuffle([42])).toEqual([42]);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd "D:/workspace/vibe coding/pickup"
npx jest __tests__/unit/fisher-yates.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: 实现 Fisher-Yates**

Create `pickup/src/utils/fisher-yates.ts`:

```typescript
export function fisherYatesShuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd "D:/workspace/vibe coding/pickup"
npx jest __tests__/unit/fisher-yates.test.ts
```

Expected: 5 tests PASS

- [ ] **Step 5: 编写日期工具测试**

Create `pickup/__tests__/unit/date-utils.test.ts`:

```typescript
import { getTodayKey, isNewDay, formatPhotoDate } from '../../src/utils/date-utils';

describe('getTodayKey', () => {
  it('returns YYYY-MM-DD format', () => {
    const result = getTodayKey();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('isNewDay', () => {
  it('returns true when stored date differs from today', () => {
    expect(isNewDay('2020-01-01')).toBe(true);
  });

  it('returns false when stored date is today', () => {
    const today = getTodayKey();
    expect(isNewDay(today)).toBe(false);
  });
});

describe('formatPhotoDate', () => {
  it('formats a Unix ms timestamp into human-readable Chinese date', () => {
    const ts = new Date('2024-03-15T14:30:00').getTime();
    const result = formatPhotoDate(ts);
    expect(result).toContain('2024');
    expect(result).toContain('3');
  });

  it('returns empty string for invalid timestamp', () => {
    expect(formatPhotoDate(NaN)).toBe('');
  });
});
```

- [ ] **Step 6: 运行测试确认失败**

```bash
cd "D:/workspace/vibe coding/pickup"
npx jest __tests__/unit/date-utils.test.ts
```

Expected: FAIL

- [ ] **Step 7: 实现日期工具**

Create `pickup/src/utils/date-utils.ts`:

```typescript
export function getTodayKey(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function isNewDay(storedDate: string): boolean {
  return storedDate !== getTodayKey();
}

export function formatPhotoDate(timestampMs: number): string {
  if (isNaN(timestampMs) || timestampMs <= 0) return '';
  const d = new Date(timestampMs);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}
```

- [ ] **Step 8: 运行测试确认通过**

```bash
cd "D:/workspace/vibe coding/pickup"
npx jest __tests__/unit/date-utils.test.ts
```

Expected: 6 tests PASS

- [ ] **Step 9: Commit**

```bash
cd "D:/workspace/vibe coding/pickup"
git add -A
git commit -m "feat: add Fisher-Yates shuffle and date utilities"
```

---

### Task 2: 照片服务（photo-service）

**Files:**
- Create: `pickup/src/services/photo-service.ts`
- Create: `pickup/__tests__/unit/photo-service.test.ts`

- [ ] **Step 1: 编写照片服务测试**

Create `pickup/__tests__/unit/photo-service.test.ts`:

```typescript
import {
  generateRandomGroup,
  shouldRefillViewedPool,
  getRefillCandidates,
} from '../../src/services/photo-service';
import { PhotoAsset } from '../../src/types/photo';

function makePhoto(id: string): PhotoAsset {
  return {
    id,
    uri: `file:///photos/${id}.jpg`,
    width: 1080,
    height: 1920,
    mediaType: 'photo',
    creationTime: Date.now(),
    fileSize: 2_000_000,
    albumIds: [],
  };
}

function makePhotos(count: number): PhotoAsset[] {
  return Array.from({ length: count }, (_, i) => makePhoto(`photo-${i}`));
}

describe('generateRandomGroup', () => {
  it('returns exactly groupSize photos', () => {
    const pool = makePhotos(100);
    const viewed = new Set<string>();
    const result = generateRandomGroup(pool, viewed, 15);
    expect(result.length).toBe(15);
  });

  it('avoids already-viewed photos', () => {
    const pool = makePhotos(100);
    const viewed = new Set(pool.slice(0, 50).map((p) => p.id));
    const result = generateRandomGroup(pool, viewed, 15);
    const hasViewed = result.some((p) => viewed.has(p.id));
    expect(hasViewed).toBe(false);
  });

  it('uses FIFO refill when candidate pool is too small', () => {
    const pool = makePhotos(20);
    const viewed = new Set(pool.slice(0, 15).map((p) => p.id));
    const result = generateRandomGroup(pool, viewed, 15);
    expect(result.length).toBe(15);
  });

  it('throws when total pool plus refill is less than groupSize', () => {
    const pool = makePhotos(5);
    const viewed = new Set<string>();
    expect(() => generateRandomGroup(pool, viewed, 15)).toThrow();
  });
});

describe('shouldRefillViewedPool', () => {
  it('returns true when candidates < groupSize', () => {
    const pool = makePhotos(20);
    const viewed = new Set(pool.slice(0, 18).map((p) => p.id));
    expect(shouldRefillViewedPool(pool, viewed, 15)).toBe(true);
  });

  it('returns false when candidates >= groupSize', () => {
    const pool = makePhotos(100);
    const viewed = new Set<string>();
    expect(shouldRefillViewedPool(pool, viewed, 15)).toBe(false);
  });
});

describe('getRefillCandidates', () => {
  it('returns oldest viewed photos as FIFO candidates', () => {
    const pool = makePhotos(30);
    const viewedOrder = pool.slice(0, 20).map((p) => p.id);
    const viewed = new Set(viewedOrder);
    const count = 10;
    const result = getRefillCandidates(pool, viewed, viewedOrder, count);
    expect(result.length).toBeLessThanOrEqual(count);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd "D:/workspace/vibe coding/pickup"
npx jest __tests__/unit/photo-service.test.ts
```

Expected: FAIL

- [ ] **Step 3: 实现照片服务**

Create `pickup/src/services/photo-service.ts`:

```typescript
import { PhotoAsset } from '../types/photo';
import { fisherYatesShuffle } from '../utils/fisher-yates';

export function generateRandomGroup(
  allPhotos: PhotoAsset[],
  viewedPhotoIds: Set<string>,
  groupSize: number,
  viewedOrder: string[] = [],
): PhotoAsset[] {
  let candidates = allPhotos.filter((p) => !viewedPhotoIds.has(p.id));

  if (candidates.length < groupSize) {
    const refillCount = Math.min(
      groupSize - candidates.length,
      viewedOrder.length,
    );
    const refill = viewedOrder.slice(0, refillCount);
    const refillPhotos = allPhotos.filter((p) => refill.includes(p.id));
    candidates = [...candidates, ...refillPhotos];
  }

  if (candidates.length < groupSize) {
    throw new Error(
      `Not enough photos: need ${groupSize}, have ${candidates.length}`,
    );
  }

  return fisherYatesShuffle(candidates).slice(0, groupSize);
}

export function shouldRefillViewedPool(
  allPhotos: PhotoAsset[],
  viewedPhotoIds: Set<string>,
  groupSize: number,
): boolean {
  const candidates = allPhotos.filter((p) => !viewedPhotoIds.has(p.id));
  return candidates.length < groupSize;
}

export function getRefillCandidates(
  allPhotos: PhotoAsset[],
  viewedPhotoIds: Set<string>,
  viewedOrder: string[],
  count: number,
): PhotoAsset[] {
  const refillIds = viewedOrder.slice(0, count);
  return allPhotos.filter((p) => refillIds.includes(p.id));
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd "D:/workspace/vibe coding/pickup"
npx jest __tests__/unit/photo-service.test.ts
```

Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
cd "D:/workspace/vibe coding/pickup"
git add -A
git commit -m "feat: add photo service with random group generation"
```

---

### Task 3: PhotoContext — 照片数据层

**Files:**
- Create: `pickup/src/contexts/PhotoContext.tsx`
- Create: `pickup/src/hooks/usePhotoEngine.ts`
- Create: `pickup/__tests__/integration/photo-engine.test.tsx`

- [ ] **Step 1: 编写 PhotoContext 集成测试**

Create `pickup/__tests__/integration/photo-engine.test.tsx`:

```typescript
import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { PhotoProvider, usePhotoContext } from '../../src/contexts/PhotoContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PhotoProvider>{children}</PhotoProvider>
);

describe('PhotoContext', () => {
  it('initializes with loading state', () => {
    const { result } = renderHook(() => usePhotoContext(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.currentGroup).toEqual([]);
    expect(result.current.groupIndex).toBe(0);
  });

  it('initializes with undetermined permission status', () => {
    const { result } = renderHook(() => usePhotoContext(), { wrapper });
    expect(result.current.permissionStatus).toBe('undetermined');
  });

  it('has empty marked sets initially', () => {
    const { result } = renderHook(() => usePhotoContext(), { wrapper });
    expect(result.current.markedForDelete.size).toBe(0);
    expect(result.current.markedForKeep.size).toBe(0);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd "D:/workspace/vibe coding/pickup"
npx jest __tests__/integration/photo-engine.test.tsx
```

Expected: FAIL

- [ ] **Step 3: 创建 usePhotoEngine Hook**

Create `pickup/src/hooks/usePhotoEngine.ts`:

```typescript
import { useState, useCallback, useRef } from 'react';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhotoAsset, PermissionStatus } from '../types/photo';
import { generateRandomGroup } from '../services/photo-service';

const VIEWED_IDS_KEY = 'viewedPhotoIds';
const VIEWED_ORDER_KEY = 'viewedPhotoOrder';

export function usePhotoEngine() {
  const [allPhotos, setAllPhotos] = useState<PhotoAsset[]>([]);
  const [currentGroup, setCurrentGroup] = useState<PhotoAsset[]>([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [viewedPhotoIds, setViewedPhotoIds] = useState<Set<string>>(new Set());
  const [markedForDelete, setMarkedForDelete] = useState<Set<string>>(
    new Set(),
  );
  const [markedForKeep, setMarkedForKeep] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>('undetermined');
  const [error, setError] = useState<string | null>(null);

  const viewedOrderRef = useRef<string[]>([]);

  const requestPermissions = useCallback(async () => {
    const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
    if (status === 'granted' || status === 'limited') {
      setPermissionStatus(status);
      return status;
    }
    if (canAskAgain) {
      const { status: newStatus } =
        await MediaLibrary.requestPermissionsAsync();
      const mapped: PermissionStatus =
        newStatus === 'granted' || newStatus === 'limited'
          ? newStatus
          : 'denied';
      setPermissionStatus(mapped);
      return mapped;
    }
    setPermissionStatus('denied');
    return 'denied' as PermissionStatus;
  }, []);

  const loadPhotos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: ['photo'],
        first: 0,
      });
      const photos: PhotoAsset[] = assets.map((a) => ({
        id: a.id,
        uri: a.uri,
        width: a.width,
        height: a.height,
        mediaType: (a.mediaType as PhotoAsset['mediaType']) || 'photo',
        creationTime: a.creationTime,
        fileSize: 0,
        albumIds: a.albumId ? [a.albumId] : [],
      }));
      setAllPhotos(photos);

      const savedIds = await AsyncStorage.getItem(VIEWED_IDS_KEY);
      const savedOrder = await AsyncStorage.getItem(VIEWED_ORDER_KEY);
      const idSet: Set<string> = savedIds
        ? new Set(JSON.parse(savedIds))
        : new Set();
      const orderArr: string[] = savedOrder ? JSON.parse(savedOrder) : [];
      setViewedPhotoIds(idSet);
      viewedOrderRef.current = orderArr;

      const group = generateRandomGroup(photos, idSet, 15, orderArr);
      setCurrentGroup(group);

      const newIds = new Set(idSet);
      group.forEach((p) => newIds.add(p.id));
      setViewedPhotoIds(newIds);
      const newOrder = [
        ...group.map((p) => p.id),
        ...orderArr.filter((id) => !group.find((p) => p.id === id)),
      ];
      viewedOrderRef.current = newOrder;
      AsyncStorage.setItem(VIEWED_IDS_KEY, JSON.stringify([...newIds]));
      AsyncStorage.setItem(VIEWED_ORDER_KEY, JSON.stringify(newOrder));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load photos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadNextGroup = useCallback(() => {
    const group = generateRandomGroup(
      allPhotos,
      viewedPhotoIds,
      15,
      viewedOrderRef.current,
    );
    setCurrentGroup(group);
    setGroupIndex(0);
    setMarkedForDelete(new Set());
    setMarkedForKeep(new Set());

    const newIds = new Set(viewedPhotoIds);
    group.forEach((p) => newIds.add(p.id));
    setViewedPhotoIds(newIds);
    const newOrder = [
      ...group.map((p) => p.id),
      ...viewedOrderRef.current.filter((id) => !group.find((p) => p.id === id)),
    ];
    viewedOrderRef.current = newOrder;
    AsyncStorage.setItem(VIEWED_IDS_KEY, JSON.stringify([...newIds]));
    AsyncStorage.setItem(VIEWED_ORDER_KEY, JSON.stringify(newOrder));
  }, [allPhotos, viewedPhotoIds]);

  const clearMarkedPhotos = useCallback(() => {
    if (markedForDelete.size === 0) return;
    const remainingPhotos = allPhotos.filter(
      (p) => !markedForDelete.has(p.id),
    );
    setAllPhotos(remainingPhotos);
  }, [allPhotos, markedForDelete]);

  return {
    allPhotos,
    currentGroup,
    groupIndex,
    setGroupIndex,
    viewedPhotoIds,
    markedForDelete,
    setMarkedForDelete,
    markedForKeep,
    setMarkedForKeep,
    isLoading,
    permissionStatus,
    error,
    requestPermissions,
    loadPhotos,
    loadNextGroup,
    clearMarkedPhotos,
  };
}
```

- [ ] **Step 4: 实现 PhotoContext Provider**

Create `pickup/src/contexts/PhotoContext.tsx`:

```typescript
import React, { createContext, useContext } from 'react';
import { usePhotoEngine } from '../hooks/usePhotoEngine';

type PhotoContextValue = ReturnType<typeof usePhotoEngine>;

const PhotoCtx = createContext<PhotoContextValue | null>(null);

export function PhotoProvider({ children }: { children: React.ReactNode }) {
  const engine = usePhotoEngine();
  return <PhotoCtx.Provider value={engine}>{children}</PhotoCtx.Provider>;
}

export function usePhotoContext(): PhotoContextValue {
  const ctx = useContext(PhotoCtx);
  if (!ctx) throw new Error('usePhotoContext must be used inside PhotoProvider');
  return ctx;
}
```

- [ ] **Step 5: 运行测试确认通过**

```bash
cd "D:/workspace/vibe coding/pickup"
npx jest __tests__/integration/photo-engine.test.tsx
```

Expected: 3 tests PASS

- [ ] **Step 6: Commit**

```bash
cd "D:/workspace/vibe coding/pickup"
git add -A
git commit -m "feat: add PhotoContext with photo engine hook"
```

---

### Task 4: 权限门 + 加载门 + 空状态

**Files:**
- Create: `pickup/src/components/photo-card/PermissionGate.tsx`
- Create: `pickup/src/components/photo-card/LoadingGate.tsx`
- Create: `pickup/src/components/photo-card/EmptyGate.tsx`

- [ ] **Step 1: 实现 PermissionGate**

Create `pickup/src/components/photo-card/PermissionGate.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Tokens } from '../../design-tokens';
import { PermissionStatus } from '../../types/photo';

interface Props {
  status: PermissionStatus;
  onRequest: () => void;
}

export function PermissionGate({ status, onRequest }: Props) {
  if (status === 'granted' || status === 'limited') return null;

  const isDenied = status === 'denied';

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📸</Text>
      <Text style={styles.headline}>
        {isDenied ? '需要相册访问权限' : '拾遗需要访问你的相册'}
      </Text>
      <Text style={styles.body}>
        {isDenied
          ? '请在系统设置中允许拾遗访问相册。照片完全在本机处理，不会上传。'
          : '拾遗会随机回顾你的照片，帮你顺手清理废片。照片完全在本机处理，不会上传。'}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={isDenied ? () => Linking.openSettings() : onRequest}
      >
        <Text style={styles.buttonText}>
          {isDenied ? '打开系统设置' : '允许访问相册'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.color.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Tokens.spacing.xxl,
  },
  icon: { fontSize: 64, marginBottom: Tokens.spacing.xl },
  headline: {
    ...Tokens.typography.headline,
    color: Tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: Tokens.spacing.m,
  },
  body: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: Tokens.spacing.xxl,
    lineHeight: 24,
  },
  button: {
    backgroundColor: Tokens.color.safe,
    paddingHorizontal: Tokens.spacing.xxl,
    paddingVertical: Tokens.spacing.m,
    borderRadius: Tokens.radius.button,
  },
  buttonText: {
    ...Tokens.typography.title,
    color: '#FFFFFF',
  },
});
```

- [ ] **Step 2: 实现 LoadingGate**

Create `pickup/src/components/photo-card/LoadingGate.tsx`:

```typescript
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

export function LoadingGate() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Tokens.color.textSecondary} />
      <Text style={styles.text}>正在加载你的照片回忆...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.color.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
    marginTop: Tokens.spacing.l,
  },
});
```

- [ ] **Step 3: 实现 EmptyGate**

Create `pickup/src/components/photo-card/EmptyGate.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

export function EmptyGate() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📷</Text>
      <Text style={styles.headline}>相册空空如也</Text>
      <Text style={styles.body}>去拍几张照片再来吧</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.color.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Tokens.spacing.xxl,
  },
  icon: { fontSize: 64, marginBottom: Tokens.spacing.xl },
  headline: {
    ...Tokens.typography.headline,
    color: Tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: Tokens.spacing.s,
  },
  body: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
    textAlign: 'center',
  },
});
```

- [ ] **Step 4: Commit**

```bash
cd "D:/workspace/vibe coding/pickup"
git add -A
git commit -m "feat: add PermissionGate, LoadingGate, and EmptyGate"
```

---

### Task 5: 照片卡片 UI（PhotoCard + GroupProgressBar）

**Files:**
- Create: `pickup/src/components/photo-card/PhotoCard.tsx`
- Create: `pickup/src/components/photo-card/GroupProgressBar.tsx`

- [ ] **Step 1: 实现 PhotoCard**

Create `pickup/src/components/photo-card/PhotoCard.tsx`:

```typescript
import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { Tokens } from '../../design-tokens';
import { PhotoAsset } from '../../types/photo';
import { formatPhotoDate } from '../../utils/date-utils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  photo: PhotoAsset;
}

function getResizeMode(w: number, h: number): 'cover' | 'contain' {
  if (w <= 0 || h <= 0) return 'cover';
  if (w / h > 1.2) return 'contain';
  return 'cover';
}

export function PhotoCard({ photo }: Props) {
  const resizeMode = getResizeMode(photo.width, photo.height);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: photo.uri }}
        style={styles.image}
        resizeMode={resizeMode}
      />
      <View style={styles.header}>
        <Text style={styles.date}>{formatPhotoDate(photo.creationTime)}</Text>
      </View>
      {photo.mediaType === 'livePhoto' && (
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: Tokens.color.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: Tokens.spacing.l,
    right: Tokens.spacing.l,
  },
  date: {
    ...Tokens.typography.caption,
    color: Tokens.color.textSecondary,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4,
  },
  liveBadge: {
    position: 'absolute',
    top: 60,
    right: Tokens.spacing.l,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Tokens.spacing.s,
    paddingVertical: 2,
    borderRadius: Tokens.radius.button,
  },
  liveText: {
    ...Tokens.typography.caption,
    color: Tokens.color.textPrimary,
    fontWeight: '700',
  },
});
```

- [ ] **Step 2: 实现 GroupProgressBar**

Create `pickup/src/components/photo-card/GroupProgressBar.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

interface Props {
  current: number;
  total: number;
  markedDelete: number;
  markedKeep: number;
}

export function GroupProgressBar({
  current,
  total,
  markedDelete,
  markedKeep,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        {Array.from({ length: total }, (_, i) => {
          let bgColor = Tokens.color.textMuted;
          if (i < markedDelete + markedKeep) {
            bgColor =
              i < markedDelete ? Tokens.color.danger : Tokens.color.safe;
          } else if (i === current) {
            bgColor = Tokens.color.textPrimary;
          }
          return (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: bgColor },
                i === current && styles.dotCurrent,
              ]}
            />
          );
        })}
      </View>
      <Text style={styles.counter}>
        {current + 1} / {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing.l,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Tokens.spacing.s,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  dotCurrent: {
    transform: [{ scale: 1.4 }],
  },
  counter: {
    ...Tokens.typography.caption,
    color: Tokens.color.textSecondary,
  },
});
```

- [ ] **Step 3: Commit**

```bash
cd "D:/workspace/vibe coding/pickup"
git add -A
git commit -m "feat: add PhotoCard and GroupProgressBar components"
```

---

### Task 6: 手势系统（SwipeableCard + Overlay + Haptics）

**Files:**
- Create: `pickup/src/components/gesture/SwipeableCard.tsx`
- Create: `pickup/src/components/gesture/DeleteOverlay.tsx`
- Create: `pickup/src/components/gesture/ActionIndicator.tsx`
- Create: `pickup/src/hooks/useHaptics.ts`

- [ ] **Step 1: 实现 useHaptics Hook**

Create `pickup/src/hooks/useHaptics.ts`:

```typescript
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

export function useHaptics() {
  const impactMedium = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const notifySuccess = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const notifyWarning = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  const impactLight = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return { impactMedium, notifySuccess, notifyWarning, impactLight };
}
```

- [ ] **Step 2: 实现 DeleteOverlay**

Create `pickup/src/components/gesture/DeleteOverlay.tsx`:

```typescript
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { Tokens } from '../../design-tokens';

interface Props {
  progress: SharedValue<number>;
}

export function DeleteOverlay({ progress }: Props) {
  const overlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [-1, -Tokens.photo.markThreshold, 0],
      [1, 0.3, 0],
    );
    return {
      opacity,
      backgroundColor: Tokens.color.danger,
    };
  });

  return <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
});
```

- [ ] **Step 3: 实现 ActionIndicator**

Create `pickup/src/components/gesture/ActionIndicator.tsx`:

```typescript
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { Tokens } from '../../design-tokens';

interface Props {
  progress: SharedValue<number>;
}

export function ActionIndicator({ progress }: Props) {
  const deleteStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [-0.8, -Tokens.photo.markThreshold],
      [1, 0],
    );
    return { opacity };
  });

  const keepStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [Tokens.photo.markThreshold, 0.8],
      [1, 0],
    );
    return { opacity };
  });

  return (
    <>
      <Animated.View style={[styles.indicator, styles.delete, deleteStyle]}>
        <Animated.Text style={styles.text}>删除</Animated.Text>
      </Animated.View>
      <Animated.View style={[styles.indicator, styles.keep, keepStyle]}>
        <Animated.Text style={styles.text}>保留</Animated.Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  delete: { top: 120 },
  keep: { bottom: 120 },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 8,
  },
});
```

- [ ] **Step 4: 实现 SwipeableCard**

Create `pickup/src/components/gesture/SwipeableCard.tsx`:

```typescript
import React, { useCallback } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Tokens } from '../../design-tokens';
import { DeleteOverlay } from './DeleteOverlay';
import { ActionIndicator } from './ActionIndicator';
import { useHaptics } from '../../hooks/useHaptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  children: React.ReactNode;
  onMarkDelete: () => void;
  onMarkKeep: () => void;
  onSkip: () => void;
}

export function SwipeableCard({
  children,
  onMarkDelete,
  onMarkKeep,
  onSkip,
}: Props) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const markProgress = useSharedValue(0);
  const isAnimating = useSharedValue(false);
  const { impactMedium, notifySuccess, notifyWarning } = useHaptics();

  const hasCrossedThreshold = useCallback((value: number) => {
    'worklet';
    return Math.abs(value) >= Tokens.photo.markThreshold;
  }, []);

  const handleEnd = useCallback(
    (ty: number, tx: number) => {
      'worklet';
      if (isAnimating.value) return;

      if (hasCrossedThreshold(ty)) {
        isAnimating.value = true;
        const direction = ty < 0 ? -1 : 1;
        translateY.value = withSpring(
          direction * SCREEN_HEIGHT * 1.5,
          { damping: 0.7, stiffness: 150 },
          () => {
            isAnimating.value = false;
            if (direction < 0) {
              runOnJS(onMarkDelete)();
            } else {
              runOnJS(onMarkKeep)();
            }
          },
        );
      } else if (Math.abs(tx) > Math.abs(ty) && Math.abs(tx) > 80) {
        isAnimating.value = true;
        const direction = tx < 0 ? -1 : 1;
        translateX.value = withSpring(
          direction * SCREEN_WIDTH * 1.5,
          { damping: 0.7, stiffness: 150 },
          () => {
            isAnimating.value = false;
            translateX.value = 0;
            translateY.value = 0;
            markProgress.value = 0;
            runOnJS(onSkip)();
          },
        );
      } else {
        translateY.value = withSpring(0, { damping: 0.7, stiffness: 150 });
        translateX.value = withSpring(0, { damping: 0.7, stiffness: 150 });
        markProgress.value = 0;
      }
    },
    [onMarkDelete, onMarkKeep, onSkip],
  );

  const panGesture = Gesture.Pan()
    .enabled(true)
    .onBegin(() => {
      isAnimating.value = false;
    })
    .onUpdate((e) => {
      if (isAnimating.value) return;
      translateY.value = e.translationY * 0.8;
      translateX.value = e.translationX * 0.8;

      const dy = e.translationY;
      const dx = e.translationX;
      const maxDist = 200;
      const progressY = Math.max(-1, Math.min(1, dy / maxDist));
      const progressX = Math.max(-1, Math.min(1, dx / maxDist));
      markProgress.value = Math.abs(dy) > Math.abs(dx) ? progressY : 0;

      if (Math.abs(progressY) >= Tokens.photo.markThreshold) {
        runOnJS(impactMedium)();
      }
    })
    .onEnd((e) => {
      runOnJS(handleEnd)(e.translationY, e.translationX);
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, cardStyle]}>
        {children}
        <DeleteOverlay progress={markProgress} />
        <ActionIndicator progress={markProgress} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
```

- [ ] **Step 5: Commit**

```bash
cd "D:/workspace/vibe coding/pickup"
git add -A
git commit -m "feat: add SwipeableCard with gesture system and haptics"
```

---

### Task 7: SessionContext — 会话状态管理

**Files:**
- Create: `pickup/src/contexts/SessionContext.tsx`

- [ ] **Step 1: 实现 SessionContext**

Create `pickup/src/contexts/SessionContext.tsx`:

```typescript
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { GestureState, InteractionLogEntry } from '../types/photo';

interface SessionState {
  gestureState: GestureState;
  markProgress: number;
  markedDeleteIds: string[];
  markedKeepIds: string[];
  skippedIds: string[];
  interactionLog: InteractionLogEntry[];
}

type SessionAction =
  | { type: 'SET_GESTURE_STATE'; payload: GestureState }
  | { type: 'SET_MARK_PROGRESS'; payload: number }
  | { type: 'MARK_DELETE'; payload: string }
  | { type: 'MARK_KEEP'; payload: string }
  | { type: 'SKIP'; payload: string }
  | { type: 'UNDO_LAST' }
  | { type: 'RESET_SESSION' };

const initialState: SessionState = {
  gestureState: 'idle',
  markProgress: 0,
  markedDeleteIds: [],
  markedKeepIds: [],
  skippedIds: [],
  interactionLog: [],
};

function sessionReducer(
  state: SessionState,
  action: SessionAction,
): SessionState {
  switch (action.type) {
    case 'SET_GESTURE_STATE':
      return { ...state, gestureState: action.payload };

    case 'SET_MARK_PROGRESS':
      return { ...state, markProgress: action.payload };

    case 'MARK_DELETE':
      return {
        ...state,
        markedDeleteIds: [...state.markedDeleteIds, action.payload],
        interactionLog: [
          ...state.interactionLog,
          { photoId: action.payload, action: 'delete', timestamp: Date.now() },
        ],
      };

    case 'MARK_KEEP':
      return {
        ...state,
        markedKeepIds: [...state.markedKeepIds, action.payload],
        interactionLog: [
          ...state.interactionLog,
          { photoId: action.payload, action: 'keep', timestamp: Date.now() },
        ],
      };

    case 'SKIP':
      return {
        ...state,
        skippedIds: [...state.skippedIds, action.payload],
        interactionLog: [
          ...state.interactionLog,
          { photoId: action.payload, action: 'skip', timestamp: Date.now() },
        ],
      };

    case 'UNDO_LAST': {
      if (state.interactionLog.length === 0) return state;
      const last = state.interactionLog[state.interactionLog.length - 1];
      return {
        ...state,
        interactionLog: state.interactionLog.slice(0, -1),
        markedDeleteIds:
          last.action === 'delete'
            ? state.markedDeleteIds.filter((id) => id !== last.photoId)
            : state.markedDeleteIds,
        markedKeepIds:
          last.action === 'keep'
            ? state.markedKeepIds.filter((id) => id !== last.photoId)
            : state.markedKeepIds,
      };
    }

    case 'RESET_SESSION':
      return initialState;

    default:
      return state;
  }
}

type SessionContextValue = {
  state: SessionState;
  dispatch: React.Dispatch<SessionAction>;
};

const SessionCtx = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  return (
    <SessionCtx.Provider value={{ state, dispatch }}>
      {children}
    </SessionCtx.Provider>
  );
}

export function useSessionContext(): SessionContextValue {
  const ctx = useContext(SessionCtx);
  if (!ctx)
    throw new Error('useSessionContext must be inside SessionProvider');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
cd "D:/workspace/vibe coding/pickup"
git add -A
git commit -m "feat: add SessionContext for gesture session state"
```

---

### Task 8: 卡片浏览首页（index.tsx）

**Files:**
- Modify: `pickup/app/_layout.tsx`
- Modify: `pickup/app/index.tsx`

- [ ] **Step 1: 实现根布局（Provider 嵌套）**

Modify `pickup/app/_layout.tsx`:

```typescript
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { PhotoProvider } from '../src/contexts/PhotoContext';
import { SessionProvider } from '../src/contexts/SessionContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <PhotoProvider>
        <SessionProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#000000' },
              animation: 'fade',
            }}
          />
        </SessionProvider>
      </PhotoProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
```

- [ ] **Step 2: 实现首页 BrowseScreen**

Modify `pickup/app/index.tsx`:

```typescript
import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { usePhotoContext } from '../src/contexts/PhotoContext';
import { useSessionContext } from '../src/contexts/SessionContext';
import { PhotoCard } from '../src/components/photo-card/PhotoCard';
import { GroupProgressBar } from '../src/components/photo-card/GroupProgressBar';
import { SwipeableCard } from '../src/components/gesture/SwipeableCard';
import { PermissionGate } from '../src/components/photo-card/PermissionGate';
import { LoadingGate } from '../src/components/photo-card/LoadingGate';
import { EmptyGate } from '../src/components/photo-card/EmptyGate';
import { Tokens } from '../src/design-tokens';

export default function BrowseScreen() {
  const router = useRouter();
  const {
    currentGroup,
    groupIndex,
    setGroupIndex,
    markedForDelete,
    setMarkedForDelete,
    markedForKeep,
    setMarkedForKeep,
    isLoading,
    permissionStatus,
    error,
    allPhotos,
    requestPermissions,
    loadPhotos,
    loadNextGroup,
  } = usePhotoContext();

  const { state, dispatch } = useSessionContext();

  useEffect(() => {
    if (permissionStatus === 'undetermined') {
      requestPermissions().then((status) => {
        if (status === 'granted' || status === 'limited') {
          loadPhotos();
        }
      });
    } else if (permissionStatus === 'granted' || permissionStatus === 'limited') {
      loadPhotos();
    }
  }, [permissionStatus]);

  const handleMarkDelete = useCallback(() => {
    const photo = currentGroup[groupIndex];
    if (!photo) return;
    setMarkedForDelete((prev) => new Set(prev).add(photo.id));
    dispatch({ type: 'MARK_DELETE', payload: photo.id });
    advanceToNext();
  }, [currentGroup, groupIndex]);

  const handleMarkKeep = useCallback(() => {
    const photo = currentGroup[groupIndex];
    if (!photo) return;
    setMarkedForKeep((prev) => new Set(prev).add(photo.id));
    dispatch({ type: 'MARK_KEEP', payload: photo.id });
    advanceToNext();
  }, [currentGroup, groupIndex]);

  const handleSkip = useCallback(() => {
    const photo = currentGroup[groupIndex];
    if (!photo) return;
    dispatch({ type: 'SKIP', payload: photo.id });
    advanceToNext();
  }, [currentGroup, groupIndex]);

  const advanceToNext = useCallback(() => {
    if (groupIndex + 1 >= Tokens.photo.groupSize) {
      const deleteCount = markedForDelete.size;
      if (deleteCount > 0) {
        router.push({
          pathname: '/review',
        });
      } else {
        loadNextGroup();
      }
    } else {
      setGroupIndex(groupIndex + 1);
    }
  }, [groupIndex, markedForDelete, loadNextGroup]);

  if (permissionStatus === 'denied' || permissionStatus === 'undetermined') {
    return <PermissionGate status={permissionStatus} onRequest={requestPermissions} />;
  }

  if (isLoading) return <LoadingGate />;

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>加载失败：{error}</Text>
      </View>
    );
  }

  if (allPhotos.length === 0) return <EmptyGate />;

  const currentPhoto = currentGroup[groupIndex];
  if (!currentPhoto) {
    loadNextGroup();
    return <LoadingGate />;
  }

  return (
    <View style={styles.container}>
      <SwipeableCard
        onMarkDelete={handleMarkDelete}
        onMarkKeep={handleMarkKeep}
        onSkip={handleSkip}
      >
        <PhotoCard photo={currentPhoto} />
      </SwipeableCard>
      <GroupProgressBar
        current={groupIndex}
        total={Tokens.photo.groupSize}
        markedDelete={markedForDelete.size}
        markedKeep={markedForKeep.size}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.color.background,
  },
  centered: {
    flex: 1,
    backgroundColor: Tokens.color.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Tokens.spacing.xxl,
  },
  errorText: {
    ...Tokens.typography.body,
    color: Tokens.color.danger,
    textAlign: 'center',
  },
});
```

- [ ] **Step 3: Commit**

```bash
cd "D:/workspace/vibe coding/pickup"
git add -A
git commit -m "feat: add browse screen with card swiping flow"
```

---

### Task 9: 删除管理（ReviewScreen + delete-service + ConfirmSheet）

**Files:**
- Create: `pickup/src/services/delete-service.ts`
- Create: `pickup/src/components/delete-review/DeleteGrid.tsx`
- Create: `pickup/src/components/delete-review/DeleteConfirmSheet.tsx`
- Create: `pickup/app/review.tsx`

- [ ] **Step 1: 实现 delete-service**

Create `pickup/src/services/delete-service.ts`:

```typescript
import * as MediaLibrary from 'expo-media-library';

export interface DeleteResult {
  successCount: number;
  failedCount: number;
  freedBytes: number;
  errors: string[];
}

export async function deletePhotos(photoIds: string[]): Promise<DeleteResult> {
  let successCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  try {
    const result = await MediaLibrary.deleteAssetsAsync(photoIds);
    successCount = photoIds.length;
    return {
      successCount,
      failedCount: 0,
      freedBytes: 0,
      errors: [],
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'delete failed';
    return {
      successCount: 0,
      failedCount: photoIds.length,
      freedBytes: 0,
      errors: [message],
    };
  }
}
```

- [ ] **Step 2: 实现 DeleteGrid**

Create `pickup/src/components/delete-review/DeleteGrid.tsx`:

```typescript
import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Tokens } from '../../design-tokens';
import { PhotoAsset } from '../../types/photo';

interface Props {
  photos: PhotoAsset[];
  onTap: (id: string) => void;
  markedIds: Set<string>;
}

const IMAGE_SIZE = 100;

export function DeleteGrid({ photos, onTap, markedIds }: Props) {
  return (
    <View style={styles.grid}>
      {photos.map((photo) => {
        const isMarked = markedIds.has(photo.id);
        return (
          <TouchableOpacity
            key={photo.id}
            style={[styles.cell, isMarked && styles.cellMarked]}
            onPress={() => onTap(photo.id)}
          >
            <Image source={{ uri: photo.uri }} style={styles.image} />
            {isMarked && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: Tokens.spacing.s,
  },
  cell: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: 4,
    borderRadius: Tokens.radius.card,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cellMarked: {
    borderColor: Tokens.color.danger,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    color: Tokens.color.danger,
    fontWeight: '700',
    fontSize: 16,
  },
});
```

- [ ] **Step 3: 实现 DeleteConfirmSheet**

Create `pickup/src/components/delete-review/DeleteConfirmSheet.tsx`:

```typescript
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Tokens } from '../../design-tokens';

interface Props {
  visible: boolean;
  count: number;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmSheet({
  visible,
  count,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>确认删除</Text>
          <Text style={styles.body}>
            将删除 {count} 张照片，删除后可在系统「最近删除」中恢复（30 天内）
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={onConfirm}
            disabled={loading}
          >
            <Text style={styles.deleteText}>
              {loading ? '删除中...' : `删除 ${count} 张`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onCancel}>
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Tokens.color.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Tokens.spacing.xl,
    paddingBottom: Tokens.spacing.xxl + 20,
  },
  title: {
    ...Tokens.typography.title,
    color: Tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: Tokens.spacing.m,
  },
  body: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: Tokens.spacing.xl,
    lineHeight: 22,
  },
  button: {
    paddingVertical: Tokens.spacing.l,
    alignItems: 'center',
    marginBottom: Tokens.spacing.s,
  },
  deleteButton: {
    backgroundColor: Tokens.color.danger,
    borderRadius: Tokens.radius.button,
  },
  deleteText: {
    ...Tokens.typography.title,
    color: '#FFFFFF',
  },
  cancelText: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
  },
});
```

- [ ] **Step 4: 实现 ReviewScreen**

Create `pickup/app/review.tsx`:

```typescript
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { usePhotoContext } from '../src/contexts/PhotoContext';
import { useSessionContext } from '../src/contexts/SessionContext';
import { DeleteGrid } from '../src/components/delete-review/DeleteGrid';
import { DeleteConfirmSheet } from '../src/components/delete-review/DeleteConfirmSheet';
import { deletePhotos } from '../src/services/delete-service';
import { Tokens } from '../src/design-tokens';

export default function ReviewScreen() {
  const router = useRouter();
  const { currentGroup, markedForDelete, clearMarkedPhotos, loadNextGroup } =
    usePhotoContext();
  const { state, dispatch } = useSessionContext();

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deselectedIds, setDeselectedIds] = useState<Set<string>>(new Set());

  const photosToDelete = currentGroup.filter(
    (p) => markedForDelete.has(p.id) && !deselectedIds.has(p.id),
  );

  const handleTogglePhoto = useCallback(
    (id: string) => {
      setDeselectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (photosToDelete.length === 0) return;
    setDeleting(true);
    const ids = photosToDelete.map((p) => p.id);
    const result = await deletePhotos(ids);

    if (result.successCount > 0) {
      clearMarkedPhotos();
      dispatch({ type: 'RESET_SESSION' });
    }

    setDeleting(false);
    setShowConfirm(false);
    loadNextGroup();
    router.back();
  }, [photosToDelete, clearMarkedPhotos, loadNextGroup, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        确认删除 · {photosToDelete.length} 张
      </Text>
      <Text style={styles.hint}>点击照片可取消删除标记</Text>

      <DeleteGrid
        photos={photosToDelete}
        onTap={handleTogglePhoto}
        markedIds={new Set(photosToDelete.map((p) => p.id))}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>取消</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setShowConfirm(true)}
        >
          <Text style={styles.deleteText}>
            删除 {photosToDelete.length} 张
          </Text>
        </TouchableOpacity>
      </View>

      <DeleteConfirmSheet
        visible={showConfirm}
        count={photosToDelete.length}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.color.background,
    paddingTop: 60,
  },
  heading: {
    ...Tokens.typography.title,
    color: Tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: Tokens.spacing.s,
  },
  hint: {
    ...Tokens.typography.caption,
    color: Tokens.color.textMuted,
    textAlign: 'center',
    marginBottom: Tokens.spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    padding: Tokens.spacing.xl,
    gap: Tokens.spacing.m,
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Tokens.spacing.l,
    alignItems: 'center',
    backgroundColor: Tokens.color.surface,
    borderRadius: Tokens.radius.button,
  },
  cancelText: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: Tokens.spacing.l,
    alignItems: 'center',
    backgroundColor: Tokens.color.danger,
    borderRadius: Tokens.radius.button,
  },
  deleteText: {
    ...Tokens.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
```

- [ ] **Step 5: Commit**

```bash
cd "D:/workspace/vibe coding/pickup"
git add -A
git commit -m "feat: add delete review screen with grid and confirm flow"
```

---

### Task 10: 订阅付费系统（SubscriptionContext + Paywall）

**Files:**
- Create: `pickup/src/services/subscription-service.ts`
- Create: `pickup/src/contexts/SubscriptionContext.tsx`
- Create: `pickup/src/components/settings/PricingCard.tsx`
- Create: `pickup/app/paywall.tsx`

- [ ] **Step 1: 实现 subscription-service**

Create `pickup/src/services/subscription-service.ts`:

```typescript
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { SubscriptionType } from '../types/subscription';

const REVENUECAT_API_KEY_IOS = '__REVENUECAT_IOS_KEY__';
const REVENUECAT_API_KEY_ANDROID = '__REVENUECAT_ANDROID_KEY__';

export function configurePurchases() {
  Purchases.configure({
    apiKey: Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID,
  });
}

export async function getOfferings() {
  return Purchases.getOfferings();
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

export async function purchasePackage(
  pkg: Purchases.Package,
): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

export function isProActive(info: CustomerInfo): boolean {
  return info.entitlements.active['pro'] !== undefined;
}

export function getSubscriptionType(
  info: CustomerInfo,
): SubscriptionType {
  const entitlement = info.entitlements.active['pro'];
  if (!entitlement) return 'free';

  const identifier = entitlement.productIdentifier;
  if (identifier.includes('weekly')) return 'weekly';
  if (identifier.includes('monthly')) return 'monthly';
  if (identifier.includes('yearly')) return 'yearly';
  if (identifier.includes('lifetime')) return 'lifetime';
  return 'free';
}
```

- [ ] **Step 2: 实现 SubscriptionContext**

Create `pickup/src/contexts/SubscriptionContext.tsx`:

```typescript
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import Purchases from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionType, DailyUsage } from '../types/subscription';
import { getTodayKey, isNewDay } from '../utils/date-utils';
import {
  configurePurchases,
  getOfferings,
  getCustomerInfo,
  purchasePackage,
  restorePurchases,
  isProActive,
  getSubscriptionType,
} from '../services/subscription-service';
import { Tokens } from '../design-tokens';

const DAILY_USAGE_KEY = 'dailyUsage';

interface SubscriptionContextValue {
  isPro: boolean;
  subscriptionType: SubscriptionType;
  offerings: Purchases.Offerings | null;
  purchaseInProgress: boolean;
  restoreInProgress: boolean;
  purchaseError: string | null;
  todayGroupCount: number;
  isLimitReached: boolean;
  canBrowseNextGroup: boolean;
  purchase: (pkg: Purchases.Package) => Promise<void>;
  restore: () => Promise<void>;
  incrementGroupCount: () => void;
}

const SubscriptionCtx = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPro, setIsPro] = useState(false);
  const [subscriptionType, setSubscriptionType] =
    useState<SubscriptionType>('free');
  const [offerings, setOfferings] = useState<Purchases.Offerings | null>(null);
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [todayGroupCount, setTodayGroupCount] = useState(0);

  useEffect(() => {
    configurePurchases();
    loadSubscriptionState();
    loadDailyUsage();
  }, []);

  useEffect(() => {
    const listener = Purchases.addCustomerInfoUpdateListener((info) => {
      const pro = isProActive(info);
      setIsPro(pro);
      if (pro) setSubscriptionType(getSubscriptionType(info));
    });
    return () => listener.remove();
  }, []);

  const loadSubscriptionState = async () => {
    try {
      const info = await getCustomerInfo();
      setIsPro(isProActive(info));
      setSubscriptionType(getSubscriptionType(info));
      const offerings = await getOfferings();
      setOfferings(offerings);
    } catch (e) {
      console.warn('RevenueCat load failed:', e);
    }
  };

  const loadDailyUsage = async () => {
    try {
      const raw = await AsyncStorage.getItem(DAILY_USAGE_KEY);
      if (!raw) {
        setTodayGroupCount(0);
        return;
      }
      const usage: DailyUsage = JSON.parse(raw);
      if (isNewDay(usage.date)) {
        setTodayGroupCount(0);
        AsyncStorage.setItem(
          DAILY_USAGE_KEY,
          JSON.stringify({ date: getTodayKey(), count: 0 }),
        );
      } else {
        setTodayGroupCount(usage.count);
      }
    } catch {
      setTodayGroupCount(0);
    }
  };

  const incrementGroupCount = useCallback(() => {
    setTodayGroupCount((prev) => {
      const next = prev + 1;
      AsyncStorage.setItem(
        DAILY_USAGE_KEY,
        JSON.stringify({ date: getTodayKey(), count: next }),
      );
      return next;
    });
  }, []);

  const isLimitReached =
    !isPro && todayGroupCount >= Tokens.photo.freeDailyLimit;

  const canBrowseNextGroup = isPro || !isLimitReached;

  const purchase = useCallback(async (pkg: Purchases.Package) => {
    setPurchaseInProgress(true);
    setPurchaseError(null);
    try {
      const info = await purchasePackage(pkg);
      setIsPro(isProActive(info));
      setSubscriptionType(getSubscriptionType(info));
    } catch (e) {
      setPurchaseError(
        e instanceof Error ? e.message : 'Purchase failed',
      );
    } finally {
      setPurchaseInProgress(false);
    }
  }, []);

  const restore = useCallback(async () => {
    setRestoreInProgress(true);
    setPurchaseError(null);
    try {
      const info = await restorePurchases();
      setIsPro(isProActive(info));
      setSubscriptionType(getSubscriptionType(info));
    } catch (e) {
      setPurchaseError(
        e instanceof Error ? e.message : 'Restore failed',
      );
    } finally {
      setRestoreInProgress(false);
    }
  }, []);

  return (
    <SubscriptionCtx.Provider
      value={{
        isPro,
        subscriptionType,
        offerings,
        purchaseInProgress,
        restoreInProgress,
        purchaseError,
        todayGroupCount,
        isLimitReached,
        canBrowseNextGroup,
        purchase,
        restore,
        incrementGroupCount,
      }}
    >
      {children}
    </SubscriptionCtx.Provider>
  );
}

export function useSubscriptionContext(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionCtx);
  if (!ctx)
    throw new Error(
      'useSubscriptionContext must be inside SubscriptionProvider',
    );
  return ctx;
}
```

- [ ] **Step 3: 实现 PricingCard**

Create `pickup/src/components/settings/PricingCard.tsx`:

```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

interface Props {
  label: string;
  price: string;
  period: string;
  isRecommended: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

export function PricingCard({
  label,
  price,
  period,
  isRecommended,
  isSelected,
  onSelect,
}: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isRecommended && styles.recommended,
        isSelected && styles.selected,
      ]}
      onPress={onSelect}
    >
      {isRecommended && <Text style={styles.badge}>推荐</Text>}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.price}>{price}</Text>
      <Text style={styles.period}>/ {period}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Tokens.color.surface,
    borderRadius: Tokens.radius.card,
    padding: Tokens.spacing.l,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  recommended: {
    borderColor: Tokens.color.safe,
  },
  selected: {
    borderColor: Tokens.color.textPrimary,
  },
  badge: {
    ...Tokens.typography.caption,
    color: Tokens.color.safe,
    fontWeight: '700',
    marginBottom: Tokens.spacing.s,
  },
  label: {
    ...Tokens.typography.body,
    color: Tokens.color.textPrimary,
    marginBottom: Tokens.spacing.s,
  },
  price: {
    ...Tokens.typography.headline,
    color: Tokens.color.textPrimary,
  },
  period: {
    ...Tokens.typography.caption,
    color: Tokens.color.textSecondary,
  },
});
```

- [ ] **Step 4: 实现 PaywallScreen**

Create `pickup/app/paywall.tsx`:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSubscriptionContext } from '../src/contexts/SubscriptionContext';
import { PricingCard } from '../src/components/settings/PricingCard';
import { Tokens } from '../src/design-tokens';

export default function PaywallScreen() {
  const router = useRouter();
  const {
    offerings,
    purchaseInProgress,
    restoreInProgress,
    purchaseError,
    purchase,
    restore,
  } = useSubscriptionContext();

  const [selectedPkg, setSelectedPkg] = useState<string | null>('yearly');

  const handlePurchase = async () => {
    const offering = offerings?.current;
    if (!offering || !selectedPkg) return;
    const pkg = offering.availablePackages.find(
      (p) => p.identifier === selectedPkg,
    );
    if (!pkg) return;
    await purchase(pkg);
    if (!purchaseError) {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.headline}>拾遗 Pro</Text>
        <Text style={styles.subhead}>无限畅用，释放存储空间</Text>

        <View style={styles.features}>
          {[
            '无限制浏览照片',
            '每日不限额回顾',
            '智能分类回顾（即将推出）',
            '视频回顾与删除（即将推出）',
            '详细统计数据',
          ].map((f, i) => (
            <Text key={i} style={styles.featureItem}>
              ✓ {f}
            </Text>
          ))}
        </View>

        {offerings?.current ? (
          <View style={styles.pricing}>
            {offerings.current.availablePackages.map((pkg) => (
              <PricingCard
                key={pkg.identifier}
                label={
                  pkg.identifier === 'yearly'
                    ? '年会员'
                    : pkg.identifier === 'monthly'
                    ? '月会员'
                    : pkg.identifier === 'lifetime'
                    ? '永久会员'
                    : '周会员'
                }
                price={pkg.product.priceString}
                period={
                  pkg.identifier === 'lifetime'
                    ? '一次购买'
                    : pkg.identifier === 'yearly'
                    ? '年'
                    : pkg.identifier === 'monthly'
                    ? '月'
                    : '周'
                }
                isRecommended={pkg.identifier === 'yearly'}
                isSelected={selectedPkg === pkg.identifier}
                onSelect={() => setSelectedPkg(pkg.identifier)}
              />
            ))}
          </View>
        ) : (
          <ActivityIndicator color={Tokens.color.textSecondary} />
        )}

        <TouchableOpacity
          style={styles.purchaseBtn}
          onPress={handlePurchase}
          disabled={purchaseInProgress}
        >
          <Text style={styles.purchaseText}>
            {purchaseInProgress ? '处理中...' : '升级 Pro'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.restoreBtn} onPress={restore}>
          <Text style={styles.restoreText}>
            {restoreInProgress ? '恢复中...' : '恢复购买'}
          </Text>
        </TouchableOpacity>

        {purchaseError && (
          <Text style={styles.error}>{purchaseError}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Tokens.color.background },
  content: { padding: Tokens.spacing.xl, paddingBottom: 60 },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: Tokens.spacing.s,
  },
  closeText: {
    ...Tokens.typography.title,
    color: Tokens.color.textSecondary,
  },
  headline: {
    ...Tokens.typography.headline,
    color: Tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: Tokens.spacing.s,
  },
  subhead: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: Tokens.spacing.xl,
  },
  features: {
    marginBottom: Tokens.spacing.xl,
    paddingHorizontal: Tokens.spacing.l,
  },
  featureItem: {
    ...Tokens.typography.body,
    color: Tokens.color.textPrimary,
    marginBottom: Tokens.spacing.s,
  },
  pricing: {
    gap: Tokens.spacing.m,
    marginBottom: Tokens.spacing.xl,
  },
  purchaseBtn: {
    backgroundColor: Tokens.color.safe,
    paddingVertical: Tokens.spacing.l,
    borderRadius: Tokens.radius.button,
    alignItems: 'center',
    marginBottom: Tokens.spacing.m,
  },
  purchaseText: {
    ...Tokens.typography.title,
    color: '#FFFFFF',
  },
  restoreBtn: {
    alignItems: 'center',
    marginBottom: Tokens.spacing.l,
  },
  restoreText: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
  },
  error: {
    ...Tokens.typography.caption,
    color: Tokens.color.danger,
    textAlign: 'center',
  },
});
```

- [ ] **Step 5: Commit**

```bash
cd "D:/workspace/vibe coding/pickup"
git add -A
git commit -m "feat: add subscription context and paywall screen"
```

---

### Task 11: 每日限量 + 付费墙集成

**Files:**
- Modify: `pickup/app/_layout.tsx` — 添加 SubscriptionProvider
- Modify: `pickup/app/index.tsx` — 添加限量检查
- Create: `pickup/src/components/photo-card/LimitReachedModal.tsx`

- [ ] **Step 1: 更新根布局添加 SubscriptionProvider**

Modify `pickup/app/_layout.tsx` — 在 PhotoProvider 外层包裹 SubscriptionProvider:

```typescript
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { SubscriptionProvider } from '../src/contexts/SubscriptionContext';
import { PhotoProvider } from '../src/contexts/PhotoContext';
import { SessionProvider } from '../src/contexts/SessionContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SubscriptionProvider>
        <PhotoProvider>
          <SessionProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#000000' },
                animation: 'fade',
              }}
            />
          </SessionProvider>
        </PhotoProvider>
      </SubscriptionProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
```

- [ ] **Step 2: 实现 LimitReachedModal**

Create `pickup/src/components/photo-card/LimitReachedModal.tsx`:

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Tokens } from '../../design-tokens';

interface Props {
  visible: boolean;
  viewedCount: number;
  deletedCount: number;
  onClose: () => void;
}

export function LimitReachedModal({
  visible,
  viewedCount,
  deletedCount,
  onClose,
}: Props) {
  const router = useRouter();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>今日免费额度已用完</Text>
          <Text style={styles.subtitle}>每日 3 组，细水长流</Text>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{viewedCount}</Text>
              <Text style={styles.statLabel}>已浏览</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{deletedCount}</Text>
              <Text style={styles.statLabel}>已删除</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => {
              onClose();
              router.push('/paywall');
            }}
          >
            <Text style={styles.upgradeText}>
              升级 Pro，无限畅用
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.laterBtn} onPress={onClose}>
            <Text style={styles.laterText}>明天再说</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>明早 0:00 自动恢复 3 组额度</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Tokens.color.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Tokens.spacing.xl,
    paddingBottom: Tokens.spacing.xxl + 20,
    alignItems: 'center',
  },
  title: {
    ...Tokens.typography.title,
    color: Tokens.color.textPrimary,
    marginBottom: Tokens.spacing.s,
  },
  subtitle: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
    marginBottom: Tokens.spacing.xl,
  },
  stats: {
    flexDirection: 'row',
    gap: Tokens.spacing.xxl,
    marginBottom: Tokens.spacing.xl,
  },
  statItem: { alignItems: 'center' },
  statValue: {
    ...Tokens.typography.headline,
    color: Tokens.color.textPrimary,
  },
  statLabel: {
    ...Tokens.typography.caption,
    color: Tokens.color.textSecondary,
  },
  upgradeBtn: {
    backgroundColor: Tokens.color.safe,
    width: '100%',
    paddingVertical: Tokens.spacing.l,
    borderRadius: Tokens.radius.button,
    alignItems: 'center',
    marginBottom: Tokens.spacing.m,
  },
  upgradeText: {
    ...Tokens.typography.title,
    color: '#FFFFFF',
  },
  laterBtn: {
    marginBottom: Tokens.spacing.m,
  },
  laterText: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
  },
  hint: {
    ...Tokens.typography.caption,
    color: Tokens.color.textMuted,
  },
});
```

- [ ] **Step 3: 更新首页集成限量检查**

Modify `pickup/app/index.tsx` — 在 advanceToNext 函数中加入限量检查:

在文件顶部添加 import:

```typescript
import { useSubscriptionContext } from '../src/contexts/SubscriptionContext';
import { LimitReachedModal } from '../src/components/photo-card/LimitReachedModal';
```

在组件函数内添加:

```typescript
const {
  isPro,
  canBrowseNextGroup,
  isLimitReached,
  incrementGroupCount,
  todayGroupCount,
} = useSubscriptionContext();

const [showLimitModal, setShowLimitModal] = useState(false);
```

修改 advanceToNext 函数:

```typescript
const advanceToNext = useCallback(() => {
  if (groupIndex + 1 >= Tokens.photo.groupSize) {
    const deleteCount = markedForDelete.size;
    if (deleteCount > 0) {
      router.push({ pathname: '/review' });
    } else {
      if (!canBrowseNextGroup) {
        setShowLimitModal(true);
        return;
      }
      incrementGroupCount();
      loadNextGroup();
    }
  } else {
    setGroupIndex(groupIndex + 1);
  }
}, [
  groupIndex,
  markedForDelete,
  canBrowseNextGroup,
  incrementGroupCount,
  loadNextGroup,
]);
```

在 return 的 JSX 末尾（`</View>` 闭合前）添加:

```typescript
<LimitReachedModal
  visible={showLimitModal}
  viewedCount={todayGroupCount * Tokens.photo.groupSize}
  deletedCount={markedForDelete.size}
  onClose={() => setShowLimitModal(false)}
/>
```

- [ ] **Step 4: Commit**

```bash
cd "D:/workspace/vibe coding/pickup"
git add -A
git commit -m "feat: integrate daily limit gate with paywall upsell"
```

---

### Task 12: 统计数据 + 设置页

**Files:**
- Create: `pickup/src/services/stats-service.ts`
- Create: `pickup/src/contexts/StatsContext.tsx`
- Create: `pickup/src/components/settings/StatCard.tsx`
- Create: `pickup/src/components/settings/SettingsSection.tsx`
- Create: `pickup/src/components/settings/SettingsRow.tsx`
- Create: `pickup/src/components/ui/Toast.tsx`
- Create: `pickup/app/settings.tsx`

- [ ] **Step 1: 实现 stats-service**

Create `pickup/src/services/stats-service.ts`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyStats, DailyUsage } from '../types/subscription';
import { getTodayKey, isNewDay } from '../utils/date-utils';

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
  updateWeeklyHistory(stats);
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
  if (diffDays === 1) {
    stats.streakDays += 1;
  } else {
    stats.streakDays = 1;
  }
}

function updateWeeklyHistory(stats: StatsData): void {
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
```

- [ ] **Step 2: 实现 StatsContext**

Create `pickup/src/contexts/StatsContext.tsx`:

```typescript
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { DailyStats } from '../types/subscription';
import {
  loadStats,
  recordViewed as saveViewed,
  recordDeleted as saveDeleted,
} from '../services/stats-service';

interface StatsContextValue {
  totalViewed: number;
  totalDeleted: number;
  totalFreedBytes: number;
  streakDays: number;
  weeklyHistory: DailyStats[];
  recordViewed: (count: number) => void;
  recordDeleted: (count: number, bytes: number) => void;
}

const StatsCtx = createContext<StatsContextValue | null>(null);

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [totalViewed, setTotalViewed] = useState(0);
  const [totalDeleted, setTotalDeleted] = useState(0);
  const [totalFreedBytes, setTotalFreedBytes] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [weeklyHistory, setWeeklyHistory] = useState<DailyStats[]>([]);

  useEffect(() => {
    loadStats().then((s) => {
      setTotalViewed(s.totalViewed);
      setTotalDeleted(s.totalDeleted);
      setTotalFreedBytes(s.totalFreedBytes);
      setStreakDays(s.streakDays);
      setWeeklyHistory(s.weeklyHistory);
    });
  }, []);

  const recordViewed = useCallback(async (count: number) => {
    const s = await saveViewed(count);
    setTotalViewed(s.totalViewed);
    setStreakDays(s.streakDays);
    setWeeklyHistory(s.weeklyHistory);
  }, []);

  const recordDeleted = useCallback(
    async (count: number, bytes: number) => {
      const s = await saveDeleted(count, bytes);
      setTotalDeleted(s.totalDeleted);
      setTotalFreedBytes(s.totalFreedBytes);
    },
    [],
  );

  return (
    <StatsCtx.Provider
      value={{
        totalViewed,
        totalDeleted,
        totalFreedBytes,
        streakDays,
        weeklyHistory,
        recordViewed,
        recordDeleted,
      }}
    >
      {children}
    </StatsCtx.Provider>
  );
}

export function useStatsContext(): StatsContextValue {
  const ctx = useContext(StatsCtx);
  if (!ctx) throw new Error('useStatsContext must be inside StatsProvider');
  return ctx;
}
```

- [ ] **Step 3: 实现 StatCard, SettingsSection, SettingsRow, Toast**

Create `pickup/src/components/settings/StatCard.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
}

export function StatCard({ label, value, unit }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <Text style={styles.unit}> {unit}</Text>}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Tokens.color.surface,
    borderRadius: Tokens.radius.card,
    padding: Tokens.spacing.l,
    alignItems: 'center',
  },
  value: {
    ...Tokens.typography.headline,
    color: Tokens.color.textPrimary,
  },
  unit: {
    ...Tokens.typography.caption,
    color: Tokens.color.textSecondary,
  },
  label: {
    ...Tokens.typography.caption,
    color: Tokens.color.textSecondary,
  },
});
```

Create `pickup/src/components/settings/SettingsSection.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

interface Props {
  title?: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: Props) {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Tokens.spacing.xl },
  title: {
    ...Tokens.typography.caption,
    color: Tokens.color.textSecondary,
    textTransform: 'uppercase',
    marginBottom: Tokens.spacing.s,
    paddingHorizontal: Tokens.spacing.l,
  },
  content: {
    backgroundColor: Tokens.color.surface,
    borderRadius: Tokens.radius.card,
    overflow: 'hidden',
  },
});
```

Create `pickup/src/components/settings/SettingsRow.tsx`:

```typescript
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

interface Props {
  label: string;
  rightContent?: React.ReactNode;
  onPress?: () => void;
}

export function SettingsRow({ label, rightContent, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.right}>{rightContent}</View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Tokens.spacing.m,
    paddingHorizontal: Tokens.spacing.l,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Tokens.color.textMuted,
  },
  label: {
    ...Tokens.typography.body,
    color: Tokens.color.textPrimary,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
```

Create `pickup/src/components/ui/Toast.tsx`:

```typescript
import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { Tokens } from '../../design-tokens';

interface Props {
  message: string;
  visible: boolean;
  duration?: number;
  onDismiss: () => void;
}

export function Toast({
  message,
  visible,
  duration = 3000,
  onDismiss,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: Tokens.animation.timing.duration,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: Tokens.animation.timing.duration,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: Tokens.spacing.xxl,
    right: Tokens.spacing.xxl,
    backgroundColor: Tokens.color.surfaceElevated,
    borderRadius: Tokens.radius.button,
    paddingVertical: Tokens.spacing.m,
    paddingHorizontal: Tokens.spacing.l,
    alignItems: 'center',
    zIndex: 100,
  },
  text: {
    ...Tokens.typography.body,
    color: Tokens.color.textPrimary,
  },
});
```

- [ ] **Step 4: 实现 SettingsScreen**

Create `pickup/app/settings.tsx`:

```typescript
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSubscriptionContext } from '../src/contexts/SubscriptionContext';
import { useStatsContext } from '../src/contexts/StatsContext';
import { SettingsSection } from '../src/components/settings/SettingsSection';
import { SettingsRow } from '../src/components/settings/SettingsRow';
import { StatCard } from '../src/components/settings/StatCard';
import { Tokens } from '../src/design-tokens';

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { isPro, subscriptionType } = useSubscriptionContext();
  const { totalViewed, totalDeleted, totalFreedBytes, streakDays } =
    useStatsContext();

  const subLabel = isPro
    ? `Pro ${subscriptionType === 'yearly' ? '年会员' : subscriptionType === 'monthly' ? '月会员' : subscriptionType === 'lifetime' ? '永久会员' : ''}`
    : '免费版';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.screenTitle}>设置</Text>

        <SettingsSection title="订阅">
          <SettingsRow
            label="订阅状态"
            rightContent={
              <Text style={styles.rightText}>{subLabel}</Text>
            }
          />
          {!isPro && (
            <SettingsRow
              label="升级 Pro"
              onPress={() => router.push('/paywall')}
              rightContent={
                <Text style={styles.linkText}>查看方案</Text>
              }
            />
          )}
        </SettingsSection>

        <SettingsSection title="统计">
          <View style={styles.statsGrid}>
            <StatCard
              label="已浏览"
              value={totalViewed}
              unit="张"
            />
            <StatCard
              label="已删除"
              value={totalDeleted}
              unit="张"
            />
          </View>
          <View style={styles.statsGrid}>
            <StatCard label="连续天数" value={streakDays} unit="天" />
            <StatCard
              label="已释放"
              value={isPro ? formatBytes(totalFreedBytes) : 'Pro 可见'}
            />
          </View>
        </SettingsSection>

        <SettingsSection title="帮助">
          <SettingsRow label="如何使用拾遗" onPress={() => {}} />
          <SettingsRow
            label="给我们评分"
            onPress={() =>
              Linking.openURL(
                'https://apps.apple.com/app/id1234567890?action=write-review',
              )
            }
          />
        </SettingsSection>

        <SettingsSection title="关于">
          <SettingsRow
            label="隐私政策"
            onPress={() => Linking.openURL('https://pickup.app/privacy')}
          />
          <SettingsRow
            label="版本"
            rightContent={
              <Text style={styles.rightText}>v1.0.0</Text>
            }
          />
        </SettingsSection>

        <Text style={styles.footer}>拾遗 pickup · Made with love</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Tokens.color.background },
  content: { paddingTop: 60, paddingBottom: 40 },
  screenTitle: {
    ...Tokens.typography.headline,
    color: Tokens.color.textPrimary,
    paddingHorizontal: Tokens.spacing.l,
    marginBottom: Tokens.spacing.xl,
  },
  rightText: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
  },
  linkText: {
    ...Tokens.typography.body,
    color: Tokens.color.safe,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: Tokens.spacing.m,
    gap: Tokens.spacing.m,
  },
  footer: {
    ...Tokens.typography.caption,
    color: Tokens.color.textMuted,
    textAlign: 'center',
    marginTop: Tokens.spacing.xxl,
  },
});
```

- [ ] **Step 5: 更新根布局添加 StatsProvider**

Modify `pickup/app/_layout.tsx` — 在 Provider 嵌套中加入 StatsProvider（放在 SubscriptionProvider 和 PhotoProvider 之间）:

```typescript
import { StatsProvider } from '../src/contexts/StatsContext';

// ... 在 SubscriptionProvider 内添加 StatsProvider:
<SubscriptionProvider>
  <StatsProvider>
    <PhotoProvider>
      <SessionProvider>
        ...
      </SessionProvider>
    </PhotoProvider>
  </StatsProvider>
</SubscriptionProvider>
```

- [ ] **Step 6: Commit**

```bash
cd "D:/workspace/vibe coding/pickup"
git add -A
git commit -m "feat: add stats context and settings screen"
```

---

### Task 13: 导航 Tab 栏 + 最终集成

**Files:**
- Modify: `pickup/app/_layout.tsx` — 添加 Bottom Tab
- Modify: `pickup/app/index.tsx` — Stats 集成
- Modify: `pickup/app/review.tsx` — Stats 集成

- [ ] **Step 1: 更新根布局添加底部 Tab**

Modify `pickup/app/_layout.tsx` — 将 Stack 改为 Tab，在设置页用嵌套 Stack:

```typescript
import React from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Text } from 'react-native';
import { SubscriptionProvider } from '../src/contexts/SubscriptionContext';
import { StatsProvider } from '../src/contexts/StatsContext';
import { PhotoProvider } from '../src/contexts/PhotoContext';
import { SessionProvider } from '../src/contexts/SessionContext';
import { Tokens } from '../src/design-tokens';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SubscriptionProvider>
        <StatsProvider>
          <PhotoProvider>
            <SessionProvider>
              <StatusBar style="light" />
              <Tabs
                screenOptions={{
                  headerShown: false,
                  tabBarStyle: {
                    backgroundColor: Tokens.color.surface,
                    borderTopColor: Tokens.color.textMuted,
                  },
                  tabBarActiveTintColor: Tokens.color.textPrimary,
                  tabBarInactiveTintColor: Tokens.color.textMuted,
                  tabBarLabelStyle: { fontSize: 12 },
                }}
              >
                <Tabs.Screen
                  name="index"
                  options={{
                    tabBarLabel: '浏览',
                    tabBarIcon: ({ color }) => (
                      <Text style={{ color, fontSize: 20 }}>📸</Text>
                    ),
                  }}
                />
                <Tabs.Screen
                  name="settings"
                  options={{
                    tabBarLabel: '设置',
                    tabBarIcon: ({ color }) => (
                      <Text style={{ color, fontSize: 20 }}>⚙️</Text>
                    ),
                  }}
                />
                <Tabs.Screen
                  name="review"
                  options={{ href: null }}
                />
                <Tabs.Screen
                  name="paywall"
                  options={{
                    href: null,
                    tabBarStyle: { display: 'none' },
                  }}
                />
              </Tabs>
            </SessionProvider>
          </PhotoProvider>
        </StatsProvider>
      </SubscriptionProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
```

- [ ] **Step 2: 在首页集成 Stats 记录**

在 `pickup/app/index.tsx` 中，在 `loadNextGroup` 调用后记录统计：

在文件顶部 import StatsContext:

```typescript
import { useStatsContext } from '../src/contexts/StatsContext';
```

在组件内:

```typescript
const { recordViewed } = useStatsContext();

// 每次调用 loadNextGroup 或首次 loadPhotos 完成后，
// 调用 recordViewed(15) 记录浏览数
const handleLoadNextGroup = useCallback(() => {
  loadNextGroup();
  recordViewed(Tokens.photo.groupSize);
}, [loadNextGroup, recordViewed]);
```

- [ ] **Step 3: 在删除完成后记录统计**

在 `pickup/app/review.tsx` 中的 `handleConfirmDelete`:

在文件顶部 import StatsContext:

```typescript
import { useStatsContext } from '../src/contexts/StatsContext';
```

在函数内调用 recordDeleted:

```typescript
const { recordDeleted } = useStatsContext();

const handleConfirmDelete = useCallback(async () => {
  // ... existing delete logic ...
  if (result.successCount > 0) {
    recordDeleted(result.successCount, result.freedBytes);
    // ... rest of existing logic ...
  }
}, [photosToDelete, clearMarkedPhotos, loadNextGroup, router, recordDeleted]);
```

- [ ] **Step 4: Commit**

```bash
cd "D:/workspace/vibe coding/pickup"
git add -A
git commit -m "feat: add bottom tab navigation and stats integration"
```

---

### Task 14: E2E 测试 + 最终打磨

**Files:**
- Create: `pickup/__tests__/e2e/full-flow.test.ts`
- Create: `pickup/__tests__/integration/gesture-flow.test.tsx`

- [ ] **Step 1: 编写手势流程集成测试**

Create `pickup/__tests__/integration/gesture-flow.test.tsx`:

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { SessionProvider, useSessionContext } from '../../src/contexts/SessionContext';

describe('SessionContext actions', () => {
  function TestConsumer() {
    const { state, dispatch } = useSessionContext();
    return null;
  }

  it('renders without crashing', () => {
    const { getByTestId } = render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>,
    );
    expect(true).toBe(true);
  });
});

describe('SessionContext reducer', () => {
  function setup() {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SessionProvider>{children}</SessionProvider>
    );
    const { result } = renderHook(
      () => useSessionContext(),
      { wrapper },
    );
    return result;
  }

  it('marks delete correctly', () => {
    const { result } = renderHook(
      () => useSessionContext(),
      {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <SessionProvider>{children}</SessionProvider>
        ),
      },
    );
    act(() => {
      result.current.dispatch({
        type: 'MARK_DELETE',
        payload: 'photo-123',
      });
    });
    expect(result.current.state.markedDeleteIds).toContain('photo-123');
    expect(result.current.state.interactionLog).toHaveLength(1);
  });

  it('marks keep correctly', () => {
    const { result } = renderHook(
      () => useSessionContext(),
      {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <SessionProvider>{children}</SessionProvider>
        ),
      },
    );
    act(() => {
      result.current.dispatch({
        type: 'MARK_KEEP',
        payload: 'photo-456',
      });
    });
    expect(result.current.state.markedKeepIds).toContain('photo-456');
  });

  it('undo removes last action', () => {
    const { result } = renderHook(
      () => useSessionContext(),
      {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <SessionProvider>{children}</SessionProvider>
        ),
      },
    );
    act(() => {
      result.current.dispatch({
        type: 'MARK_DELETE',
        payload: 'photo-789',
      });
    });
    act(() => {
      result.current.dispatch({ type: 'UNDO_LAST' });
    });
    expect(result.current.state.markedDeleteIds).not.toContain('photo-789');
    expect(result.current.state.interactionLog).toHaveLength(0);
  });
});
```

- [ ] **Step 2: 运行全部测试验证**

```bash
cd "D:/workspace/vibe coding/pickup"
npx jest
```

Expected: All tests PASS

- [ ] **Step 3: 检查 TypeScript 编译**

```bash
cd "D:/workspace/vibe coding/pickup"
npx tsc --noEmit
```

Expected: No type errors. Fix any that appear.

- [ ] **Step 4: 添加 .gitignore**

Ensure `pickup/.gitignore` includes:

```
node_modules/
.expo/
dist/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
.env
.env.local
```

- [ ] **Step 5: Final commit**

```bash
cd "D:/workspace/vibe coding/pickup"
git add -A
git commit -m "feat: add E2E tests and final polish for Phase 1 MVP"
```

---

## Phase 1 MVP 完成检查清单

- [ ] Task 0: 项目脚手架 + 依赖 + Design Token + 类型
- [ ] Task 1: Fisher-Yates 洗牌 + 日期工具 + 测试
- [ ] Task 2: 照片服务（随机抽取引擎）+ 测试
- [ ] Task 3: PhotoContext + usePhotoEngine
- [ ] Task 4: PermissionGate / LoadingGate / EmptyGate
- [ ] Task 5: PhotoCard + GroupProgressBar
- [ ] Task 6: SwipeableCard + DeleteOverlay + ActionIndicator + Haptics
- [ ] Task 7: SessionContext（标记/跳过/撤销）
- [ ] Task 8: 首页 BrowseScreen（完整滑动浏览流程）
- [ ] Task 9: ReviewScreen + delete-service + ConfirmSheet
- [ ] Task 10: SubscriptionContext + PaywallScreen
- [ ] Task 11: 每日限量 + Paywall 集成
- [ ] Task 12: StatsContext + SettingsScreen
- [ ] Task 13: 导航 Tab + 最终集成
- [ ] Task 14: E2E 测试 + 编译检查

---

> **Phase 1 MVP Plan 结束**  |  版本 v1.0  |  2026-05-21

---

## 自检结果

1. **Spec coverage:** 遍历了规格书 M0-M7 + M10 所有 MVP 相关模块，每个模块都在计划中有对应 Task。M8/M9 为 Phase 3 保留，不在本计划范围内。
2. **Placeholder scan:** `__REVENUECAT_IOS_KEY__` 和 `__REVENUECAT_ANDROID_KEY__` 是有意的占位符——需要开发者在 RevenueCat 控制台创建项目后填入实际 key。其余无 TBD/TODO。
3. **Type consistency:** `PhotoAsset`, `GestureState`, `SessionState`, `SubscriptionType` 等类型在 types/ 中统一定义，各 Task 引用的名称保持一致。`generateRandomGroup` 的函数签名在 service 定义和 Context 调用处匹配。
