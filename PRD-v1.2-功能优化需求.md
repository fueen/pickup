# 拾遗 PickUp v1.2 功能优化需求文档

> **文档类型**: 产品需求文档 (PRD)  
> **版本**: v1.2  
> **日期**: 2026-05-25  
> **状态**: 待开发  
> **关联文档**: [Phase 1 MVP 实现计划](./2026-05-21-拾遗-pickup-phase1-mvp-implementation-plan.md)

---

## 目录

- [REQ-01: 释放空间连续累计](#req-01-释放空间连续累计)
- [REQ-02: 统计卡片改造 — "已删除" → "最近删除"](#req-02-统计卡片改造--已删除--最近删除)
- [REQ-03: 最近删除照片记录页](#req-03-最近删除照片记录页)
- [REQ-04: Review 页排序与布局调整](#req-04-review-页排序与布局调整)

---

## REQ-01: 释放空间连续累计

### 背景

当前 `delete-service.ts` 在每次删除操作时通过 `expo-file-system` 的 `File.size` 获取文件大小，但受限于 Android 媒体文件 URI 的访问方式，`File.size` 在高版本 Android 上可能抛出异常或返回 0，导致 `freedBytes` 经常为 0。同时 `stats-service.ts` 虽已做 `totalFreedBytes += freedBytes` 累加，但当 `freedBytes` 为 0 时累计无意义，用户感知为"每次只记那一组的空间，且经常显示 0"。

### 需求描述

释放空间统计数据必须在**每次删除成功后连续累计**，不因 App 重启、切换相册、退出登录等操作重置，且空间数值必须准确反映实际删除的文件大小。

### 功能规格

#### 1. 修复文件大小获取

| 项目 | 说明 |
|------|------|
| **当前实现** | `new File(photo.uri).size` — 高版本 Android 上 content:// URI 不可直接访问 |
| **目标实现** | 改用 `FileSystem.getInfoAsync(photo.uri, { size: true })` 获取文件大小 |
| **回退策略** | 若 `getInfoAsync` 也失败，使用照片像素尺寸估算（`width × height × 3 bytes`，约 JPEG 压缩后 0.4 系数） |

**改动文件**: `src/services/delete-service.ts`

```typescript
// 伪代码示意
import { FileSystem } from 'expo-file-system';  // 注意: 使用 getInfoAsync 代替 new File()

async function getPhotoFileSize(uri: string, width: number, height: number): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    if (info.exists && info.size && info.size > 0) return info.size;
  } catch { /* fall through */ }
  // 回退估算: 假设 JPEG 压缩比约 0.4 bytes per pixel
  return Math.round(width * height * 3 * 0.4);
}
```

#### 2. 累计逻辑保障

| 项目 | 说明 |
|------|------|
| **持久化** | `stats-service.ts` 已做 `totalFreedBytes += freedBytes` 持久化到 AsyncStorage，保持不变 |
| **初始化** | `StatsProvider` 挂载时从 AsyncStorage 正确恢复 `totalFreedBytes`，不可清零 |
| **防御** | 若 AsyncStorage 读取失败，`totalFreedBytes` 默认值为 0，但不覆盖已有持久化数据 |

#### 3. 显示优化

| 项目 | 说明 |
|------|------|
| **格式化** | < 1 KB 显示 "X B"，< 1 MB 显示 "X.X KB"，< 1 GB 显示 "X.X MB"，>= 1 GB 显示 "X.XX GB" |
| **位置** | 设置页 → 统计卡片 → "释放空间" 卡片 |

### 验收标准

- [ ] 删除一批照片后，设置页"释放空间"数值增加，数值与删除文件实际大小一致（误差 < 20%）
- [ ] 关闭 App 重新打开，"释放空间"数值保持上次累计值，不归零
- [ ] 多次删除操作后，数值连续累加，不跳变
- [ ] 无照片可删除时，数值保持不变

---

## REQ-02: 统计卡片改造 — "已删除" → "最近删除"

### 背景

当前设置页统计区域展示 4 个卡片："已浏览"、"已删除"、"连续天数"、"释放空间"。用户希望将"已删除"改为"最近删除"，使其语义更明确（强调最近的操作而非历史总计），同时需要让中文字符加粗以增强视觉层次。

### 需求描述

1. 统计卡片"已删除"文案改为"最近删除"
2. 卡片中的**中文字符**全部加粗展示
3. "最近删除"卡片支持点击跳转，进入查看最近删除的照片记录

### 功能规格

#### 1. StatCard 组件改造

**改动文件**: `src/components/settings/StatCard.tsx`

| 改动项 | 当前 | 目标 |
|--------|------|------|
| label 样式 | `fontSize: 12` (caption), `fontWeight: '400'` | `fontSize: 14`, `fontWeight: '700'` (加粗) |
| 新增 onPress 属性 | 无 | `onPress?: () => void` 可选回调 |
| 新增可点击态 | 无 | `TouchableOpacity` 包裹，onPress 存在时显示箭头指示器 |

#### 2. 设置页统计区域改动

**改动文件**: `app/settings.tsx`

| 改动项 | 当前 | 目标 |
|--------|------|------|
| 第二行 label | `"已删除"` | `"最近删除"` |
| "最近删除"卡片 | 纯展示 | 可点击，跳转至 `/recent-deletes` |
| 第一行 label | `"已浏览"` | 不变 |
| 第三/四行 | `"连续天数"` / `"释放空间"` | 不变（但中文字符加粗跟随 StatCard 改造） |

### 验收标准

- [ ] 统计区域四个卡片的中文 label 文字均加粗（`fontWeight: '700'`）
- [ ] "最近删除"卡片右下角显示一个向右箭头图标，表示可点击
- [ ] 点击"最近删除"卡片跳转至最近删除记录页
- [ ] 其他三张卡片（已浏览、连续天数、释放空间）无箭头，不可点击
- [ ] 深色背景下加粗文字清晰可辨

---

## REQ-03: 最近删除照片记录页

### 背景

用户完成删除操作后，需要在 App 内回溯"我刚才删了哪些照片"。目前删除操作直接调用系统 API，App 内无任何删除记录。需要建立本地删除日志，并提供浏览页面。

### 需求描述

新增一个"最近删除"页面，以网格形式展示用户**在本 App 内删除**的照片缩略图，按删除时间倒序排列，支持查看照片详情。

### 功能规格

#### 1. 删除记录持久化

**新增/改动文件**: `src/services/stats-service.ts`

| 项目 | 说明 |
|------|------|
| **存储键** | `recentDeletes` (AsyncStorage) |
| **数据结构** | `DeletedPhotoRecord[]` |
| **字段** | `id`, `uri` (缩略图), `width`, `height`, `creationTime`, `fileSize`, `deletedAt` (删除时间戳) |
| **上限** | 最近 200 条，超出时移除最旧记录 |
| **写入时机** | `delete-service.ts` 删除成功后，在 `recordDeleted` 之前写入 |

```typescript
// 新增类型: src/types/photo.ts
export interface DeletedPhotoRecord {
  id: string;
  uri: string;
  width: number;
  height: number;
  creationTime: number;
  fileSize: number;
  deletedAt: number;
  mediaType: 'photo' | 'video' | 'livePhoto';
}
```

#### 2. 最近删除页面

**新增文件**: `app/recent-deletes.tsx`

| 项目 | 说明 |
|------|------|
| **路由** | `/recent-deletes` |
| **标题** | "最近删除" |
| **导航** | 左上角返回箭头 + 页面标题居中 |
| **列表形式** | 3 列网格，每格正方形缩略图 |
| **排序** | 按 `deletedAt` 降序（最近删除的在前） |
| **空状态** | 居中显示 "暂无删除记录" + 图标 |
| **图片加载** | 使用 `Image` 组件，`resizeMode: 'cover'`，显示照片缩略图 |
| **交互** | 点击照片弹出 PhotoDetailSheet 查看详情（复用现有组件） |
| **性能** | FlatList 虚拟列表，`windowSize=5`，`getItemLayout` 固定高度 |

#### 3. 数据流

```
delete-service.ts: deletePhotos()
  → 删除成功
  → 写入 recentDeletes (AsyncStorage)
  → StatsContext.recordDeleted() 更新统计数据
  → recent-deletes.tsx 页面加载时读取 AsyncStorage
```

### 验收标准

- [ ] 删除照片后，进入"最近删除"页面，能看到刚删除的照片缩略图
- [ ] 照片按删除时间倒序排列，最新删除的排在最前
- [ ] 删除多批照片后，列表中保留所有记录（上限 200 条）
- [ ] 点击任意缩略图弹出详情浮层（PhotoDetailSheet）
- [ ] 无删除记录时显示空状态占位
- [ ] 返回按钮正常工作
- [ ] 列表滚动流畅，无卡顿

---

## REQ-04: Review 页面排序与布局调整

### 背景

当前 `app/index.tsx`（浏览主页）左上角有一个相册选择按钮，用户点击后跳转 `/albums` 选择相册。但随着功能增加，用户还需要对浏览照片进行排序控制。

### 需求描述

1. **布局调整**: 将相册选择按钮从左上角移至**左下角**（与右下角信息按钮对称）
2. **新增排序按钮**: 原左上角位置放置"排序"按钮
3. **排序功能**: 支持三种排序方式，默认随机，切换后立即按新排序重新加载照片组

### 功能规格

#### 1. 布局改动

**改动文件**: `app/index.tsx`

| 位置 | 原内容 | 新内容 |
|------|--------|--------|
| 左上角 (top: 54, left: 20) | 相册按钮 (layers 图标) | **排序按钮** (sort-variant 图标) |
| 左下角 (bottom: 100, left: 16) | 无 | **相册按钮** (layers 图标) |

布局示意：
```
┌──────────────────────────┐
│  ☰ 排序          🗑 快删  │  ← 排序(左) + 快速删除(右)
│                          │
│       照片卡片区域        │
│                          │
│  📁 相册          ℹ️ 详情 │  ← 相册(左) + 信息(右)
└──────────────────────────┘
```

#### 2. 排序模式

**新增类型**: `src/types/photo.ts`

```typescript
export type SortMode = 'random' | 'sizeDesc' | 'timeNewest' | 'timeOldest';
```

| 排序模式 | 标识 | 显示文案 | 说明 |
|----------|------|----------|------|
| 随机排序 | `random` | 随机 | Fisher-Yates 随机乱序（当前行为，默认） |
| 面积降序 | `sizeDesc` | 面积↓ | 按 `width × height` 从大到小，大图优先 |
| 时间新→旧 | `timeNewest` | 最新↑ | 按 `creationTime` 从新到旧 |
| 时间旧→新 | `timeOldest` | 最早↑ | 按 `creationTime` 从旧到新 |

#### 3. 排序交互

| 项目 | 说明 |
|------|------|
| **默认值** | `random`（随机排序） |
| **持久化** | 排序偏好保存到 AsyncStorage 键 `sortMode`，下次启动恢复 |
| **切换方式** | 点击排序按钮 → 弹出 ActionSheet/底部弹出菜单，4 个选项单选 |
| **当前选中态** | 弹出菜单中当前选中项显示 ✓ |
| **触发重载** | 切换排序后立即调用 `loadPhotos(albumId)` 重新加载并排序 |

#### 4. 排序实现逻辑

**改动文件**: `src/hooks/usePhotoEngine.ts`、`src/services/photo-service.ts`

| 排序模式 | 实现方式 |
|----------|----------|
| `random` | `generateRandomGroup()` 保持不变（Fisher-Yates 打乱后取前 N 张） |
| `sizeDesc` | 对全量照片按 `width * height` 降序排列后，取**未浏览的**前 `groupSize` 张 |
| `timeNewest` | 对全量照片按 `creationTime` 降序排列后，取**未浏览的**前 `groupSize` 张 |
| `timeOldest` | 对全量照片按 `creationTime` 升序排列后，取**未浏览的**前 `groupSize` 张 |

注意：非随机模式下，**不经过 Fisher-Yates 洗牌**，直接从排序后的未浏览池中顺序取 `groupSize` 张。当未浏览池不足时，与现有逻辑一致，从已浏览池 FIFO 回填。

#### 5. 排序按钮 UI

| 项目 | 说明 |
|------|------|
| **图标** | `MaterialCommunityIcons` 的 `sort-variant` |
| **样式** | 与现有相册按钮一致（圆形半透明背景） |
| **位置** | `position: 'absolute', top: 54, left: 20` |
| **弹出菜单** | 使用 `Alert.alert` (Android) 或 `ActionSheetIOS` (iOS) |

### 验收标准

- [ ] 相册选择按钮位于左下角，与右下角信息按钮对称
- [ ] 排序按钮位于左上角，替换原相册按钮位置
- [ ] 点击排序按钮弹出 4 个选项：随机 / 面积↓ / 最新↑ / 最早↑
- [ ] 默认选中"随机"，切换排序后当前照片组立即按新排序重新加载
- [ ] 关闭 App 重启后，排序偏好恢复上次设置
- [ ] 随机模式下照片顺序不可预测，非随机模式下照片严格按规则排序
- [ ] 排序切换后进度条和标记状态重置为新组
- [ ] 新相册按钮样式与原相册按钮一致，功能不受影响

---

## 影响范围汇总

| REQ | 文件 | 改动类型 |
|-----|------|----------|
| REQ-01 | `src/services/delete-service.ts` | 修改：文件大小获取方式 |
| REQ-02 | `src/components/settings/StatCard.tsx` | 修改：支持 onPress、加粗中文 |
| REQ-02 | `app/settings.tsx` | 修改：label 文案、跳转逻辑 |
| REQ-03 | `src/types/photo.ts` | 修改：新增 DeletedPhotoRecord 类型 |
| REQ-03 | `src/services/stats-service.ts` | 修改：新增删除记录读写 |
| REQ-03 | `app/recent-deletes.tsx` | **新增**：最近删除页面 |
| REQ-04 | `src/types/photo.ts` | 修改：新增 SortMode 类型 |
| REQ-04 | `src/services/photo-service.ts` | 修改：新增非随机排序分组函数 |
| REQ-04 | `src/hooks/usePhotoEngine.ts` | 修改：支持 sortMode 参数 |
| REQ-04 | `app/index.tsx` | 修改：布局调整、排序按钮、排序状态管理 |

---

## 非功能需求

- **性能**: 排序切换时 `loadPhotos` 重新拉取全量照片，需确保 5000 张以内加载时间 < 3 秒
- **兼容**: 所有改动兼容 Android API 24+ 和 iOS 16+
- **回退**: 排序模式不影响已浏览池，切换排序不会丢失浏览进度
- **隐私**: 删除记录仅存储缩略图 URI（系统相册已删除则不可访问），不存储照片原始数据

---

## 附录：排序按钮弹出菜单交互稿

```
┌──────────────────────────────┐
│       选择排序方式            │
│                              │
│   ✓ 随机                     │
│     面积↓ (从大到小)          │
│     最新↑ (从新到旧)          │
│     最早↑ (从旧到新)          │
│                              │
│           取消               │
└──────────────────────────────┘
```

---

# v1.7 — 浏览页按钮精简、布局对齐与最近删除修复

> 版本：v1.7 | 日期：2026-05-27 | 状态：待开发

## 概述

基于 v1.6 完成后的新一轮反馈，聚焦浏览页工具栏视觉精简、PhotoHeader 与按钮的水平对齐、最近删除页缩略图可见性修复、以及数量文字居中。共包含 4 项改进需求。

---

## 需求清单

### REQ-01 浏览页右上角删除按钮精简：去文字 + 去胶囊框

**现状**：浏览页（`index.tsx`）顶部工具栏右侧的 `QuickDeleteButton` 显示为毛玻璃胶囊样式，包含删除图标 + "删除" 中文标签 + 红色计数 badge，整体视觉偏重。

**目标**：只保留删除图标 + 红色计数 badge，去掉"删除"文字和胶囊框（毛玻璃背景 + 圆角边框），使右上角更轻量简洁。

**实现要点**：

- **移除胶囊容器样式**：删除 `pill` 样式中的 `backgroundColor`、`borderWidth`、`borderColor`、`paddingVertical`、`paddingHorizontal`、`borderRadius`
- **移除文字标签**：删除 `<Text style={styles.label}>删除</Text>`
- **保留元素**：`delete-outline` 图标（16px）+ 红色圆形计数 badge（`#FF3B30`，数字白色）
- **按钮容器改为透明**：仅保留 `flexDirection: 'row'`、`alignItems: 'center'`、`gap: 6`，去掉背景/边框
- **触控区域**：确保按钮仍有足够的可点击区域（最小 44×44px）

**涉及文件**：`src/components/gesture/QuickDeleteButton.tsx`

---

### REQ-02 浏览页 PhotoHeader 与左右按钮水平对齐

**现状**：浏览页（`index.tsx`）顶部有三个元素在同一水平线上——左侧排序按钮、居中日期文字（`PhotoHeader`）、右侧删除按钮（`QuickDeleteButton`）。但三者分属不同的定位容器（`topBar` 用 `justifyContent: 'space-between'`，`PhotoHeader` 独立 `position: absolute`），导致垂直不完全对齐，日期文字可能与按钮不在同一基线。

**目标**：将日期文字、左侧排序按钮、右侧删除按钮三者整合到同一个 flexbox 行容器中，确保严格水平居中对齐。

**实现要点**：

- **统一容器**：将 `PhotoHeader` 中的日期文字从独立绝对定位改为嵌入 `topBar` 内部，作为 flexbox 的中间元素
- **布局方案**：
  ```
  topBar: flexDirection 'row', justifyContent 'space-between', alignItems 'center'
  ┌──────────────────────────────────────────┐
  │  [排序按钮]    日期文字(居中)    [删除按钮]  │
  └──────────────────────────────────────────┘
  ```
- **技术方案**：
  - 左侧：排序 pill
  - 中间：日期文字，`flex: 1`，`textAlign: 'center'`，`numberOfLines: 1`，`ellipsizeMode: 'tail'`
  - 右侧：删除按钮（精简后，REQ-01）
- **PhotoHeader 调整**：
  - 移除 `PhotoHeader` 组件中绝对定位的 `header` 样式（原 `top: 54, position: absolute`）
  - 改为在 `index.tsx` 的 `topBar` 中直接渲染日期文字，复用 `formatPhotoDate` 工具函数
  - `PhotoHeader` 组件可保留作为独立组件（其他地方可能复用），但在浏览页中不再使用其绝对定位版本

**涉及文件**：
- `app/index.tsx` — 重构 topBar 布局，内联日期文字
- `src/components/photo-card/PhotoCard.tsx` — 保留 PhotoHeader 导出不变（其他地方仍可用）

---

### REQ-03 最近删除页缩略图可见性修复

**现状**：`app/recent-deletes.tsx` 中所有已删除照片的缩略图均显示为 `image-off-outline` 占位图标，看不见实际照片内容。根因是 `delete-service.ts` 在删除照片前，将照片的原始 `content://` URI 存入 `DeletedPhotoRecord`，但 `MediaLibrary.deleteAssetsAsync` 执行后系统文件被永久删除，URI 随即失效，`<Image source={{ uri }}>` 加载失败触发 `onError`。

**目标**：删除前将照片复制到 App 内部缓存目录，存储缓存路径而非原始 URI，使最近删除页可展示实际缩略图。

**实现要点**：

- **删除前缓存**：在 `delete-service.ts` 的 `deletePhotos()` 中，调用 `MediaLibrary.deleteAssetsAsync` 之前，先将每张照片复制到 `FileSystem.cacheDirectory`
- **缓存路径**：使用 `expo-file-system` 的 `File` 类进行复制
  - 目标路径：`FileSystem.cacheDirectory + 'deleted-thumbnails/' + photo.id + '.jpg'`
- **代码改动**：

  ```typescript
  // delete-service.ts 伪代码
  import { File, Paths } from 'expo-file-system';

  async function cachePhotoBeforeDelete(photo: PhotoAsset): Promise<string | null> {
    try {
      const cacheDir = Paths.cache + 'deleted-thumbnails/';
      const dir = new File(cacheDir);
      if (!dir.exists) dir.createDirectory();
      const destPath = cacheDir + photo.id + '.jpg';
      const srcFile = new File(photo.uri);
      srcFile.copy(destPath);
      return destPath;
    } catch {
      return null; // 缓存失败不阻塞删除流程
    }
  }
  ```

- **URI 替换**：`DeletedPhotoRecord.uri` 存储缓存路径（如果缓存成功），否则回退到原始 URI
- **清理策略**：缓存目录在 App 启动时可选择性清理（如超过 200 个文件时清理最旧的）
- **相册方案探索（备选）**：Android/iOS 系统有「最近删除」相册（`MediaLibrary.getAlbumsAsync` 可获取），如果该相册可访问且包含已删除照片的缩略图，也可从系统相册直接读取。但需验证 `deleteAssetsAsync` 后照片是否进入该相册（Android 为永久删除，不进入回收站），此方案可能不可行。

**涉及文件**：
- `src/services/delete-service.ts` — 增加缓存逻辑
- `app/recent-deletes.tsx` — 不变（已正确处理 `onError` 回退）

---

### REQ-04 最近删除页数量文字居中

**现状**：`app/recent-deletes.tsx` 页面顶部仅显示标题"最近删除"三个字，无照片数量展示。用户期望看到 "最近删除 · X 张" 的计数信息，且需要居中对齐。当前标题虽设置 `textAlign: 'center'`，但由于左上角有绝对定位的返回按钮，视觉上可能感觉标题偏右。

**目标**：在标题区域显示照片总数（如 "最近删除 · 12 张"），确保文字严格水平居中，不因左侧返回按钮而偏移。

**实现要点**：

- **计数展示**：标题文案改为 `最近删除 · {records.length} 张`
- **居中方案**：
  - 保持返回按钮 `position: absolute, left: 16`（独立于文档流，不影响 title 居中）
  - 标题使用 `textAlign: 'center'` + `width: '100%'`（或不设宽度由父容器 flex 居中）
  - 标题左右 padding 各留 56px（返回按钮宽度 + 间距），防止文字与按钮重叠
- **空状态**：无记录时（`records.length === 0`）不显示数量，保持现有空状态占位图
- **加载中**：加载时不显示数量（`loading === true` 时标题仅为"最近删除"）

**涉及文件**：`app/recent-deletes.tsx`

---

## v1.7 需求优先级

| 优先级 | 需求编号 | 说明 |
| ------ | -------- | ---- |
| P0     | REQ-03   | Bug 修复，最近删除页缩略图全部不可见，核心功能缺陷 |
| P0     | REQ-02   | 布局对齐问题，影响浏览页视觉一致性 |
| P1     | REQ-01   | 视觉精简，减少工具栏视觉噪音 |
| P1     | REQ-04   | 数量居中，UI 细节打磨 |

---

## v1.7 影响范围

| 文件 | REQ-01 | REQ-02 | REQ-03 | REQ-04 |
| ---- | ------ | ------ | ------ | ------ |
| `src/components/gesture/QuickDeleteButton.tsx` | ✓ | | | |
| `app/index.tsx` | | ✓ | | |
| `src/components/photo-card/PhotoCard.tsx` | | ✓ (PhotoHeader 导出保留) | | |
| `src/services/delete-service.ts` | | | ✓ | |
| `app/recent-deletes.tsx` | | | | ✓ |

---

## v1.7 验收标准

1. 浏览页右上角删除按钮仅显示垃圾桶图标 + 红色计数 badge，无"删除"文字，无胶囊背景框
2. 浏览页顶部日期文字与左右按钮（排序、删除）在同一水平基线上严格对齐，日期居中不偏移
3. 删除照片后进入「最近删除」页面，能显示实际照片缩略图（非占位图标），缓存路径有效
4. 最近删除页顶部居中显示 "最近删除 · X 张"，数量随记录数动态更新，不因返回按钮而偏移

---

# v1.8 — 细节打磨与空状态体验优化

> 版本：v1.8 | 日期：2026-05-28 | 状态：待开发

## 概述

基于 v1.7 完成后的用户反馈，聚焦浏览页日期居中修复、空相册界面美化、相册切换按钮可见性、Review 页捏合缩放、以及庆祝动画后闪屏优化。共包含 5 项改进需求。

---

## 需求清单

### REQ-01 浏览页日期文字严格水平居中

**现状**：浏览页（`index.tsx`）顶部 `topBar` 使用 `flexDirection: 'row'` + `justifyContent: 'space-between'` 布局，左侧排序胶囊（图标+"排序"文字）与右侧 QuickDeleteButton（仅图标+badge）宽度不对称，导致中间 `topCenter` 区域虽然设置了 `flex: 1` + `justifyContent: 'center'`，但中心点偏右，日期文字视觉上不居中。

**目标**：日期文字在屏幕水平方向严格居中，不受左右按钮宽度差异影响。

**实现要点**：

- **方案 A（推荐）**：将日期文字从 flexbox 中间元素改为 `position: 'absolute'` + `left: 0, right: 0` + `textAlign: 'center'`。左右按钮仍保持 flexbox `space-between` 布局，日期脱离文档流独立居中。

  ```
  topBar: flexDirection 'row', justifyContent 'space-between'
  ┌──────────────────────────────────────────────┐
  │  [排序]              日期(LIVE)              [🗑] │
  └──────────────────────────────────────────────┘
         ↑ 绝对定位, left:0 right:0 textAlign center ↑
  ```

- **topDate 样式调整**：
  - 从 `topCenter` flex 容器中移出，改为独立 `<Animated.View>` 或 `<View>` 绝对定位
  - 样式：`position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'`
  - `pointerEvents: 'none'` 防止阻挡左右按钮点击
- **LIVE badge**：跟随日期文字一起绝对定位，保持在日期右侧

**涉及文件**：`app/index.tsx` — 重构 topBar 中 topCenter 布局

---

### REQ-02 空相册界面美化

**现状**：切换到一个没有照片的相册后，浏览页渲染 `<EmptyGate>` 组件，显示 emoji 📷 + "相册空空如也" + "去拍几张照片再来吧"。视觉效果简陋，与 App 整体暗黑现代设计风格不协调。

**目标**：空相册界面改用与 `EmptyReviewPlaceholder` 一致的卡通风格占位图，文案改为"还没有待删除的照片"，视觉统一美观。

**实现要点**：

- **改造 EmptyGate 组件**（`src/components/photo-card/EmptyGate.tsx`）：
  - 替换 emoji 图标为 `MaterialCommunityIcons` 图标组合（复用 EmptyReviewPlaceholder 的 `image-outline` + `ghost-outline` + `star-four-points` 布局）
  - 标题改为 "还没有可整理的照片"
  - 副标题改为 "去拍几张照片，或者换个相册看看吧"
- **保持组件接口不变**：Props 无需改动（当前无 props）
- **样式**：与 `EmptyReviewPlaceholder` 视觉风格保持一致（深色背景、黄色 accent 点缀、居中布局）

**涉及文件**：`src/components/photo-card/EmptyGate.tsx`

---

### REQ-03 空相册时相册切换按钮保持可见

**现状**：浏览页（`index.tsx`）底部左下角的相册切换按钮（`albumBtnWrap`）仅在 `!isGate` 时渲染。当相册无照片时 `allPhotos.length === 0` 触发 `isGate = true`，导致相册按钮消失。用户在一个空相册里无法切回有照片的相册，只能通过 Tab 切换迂回操作，体验断裂。

**目标**：无论相册是否有照片，左下角相册切换按钮始终可见，确保用户随时可以切换相册。

**实现要点**：

- **将 albumBtnWrap 移出 `!isGate` 条件块**：从当前只渲染在 `{!isGate && (<>...</>)}` 内部的逻辑中提取出来
- **渲染条件**：`allPhotos.length === 0` 时也显示相册按钮（按钮独立于 isGate 判断）
- **位置保持一致**：`position: 'absolute', bottom: 100, left: 16, zIndex: 20`
- **需注意**：空相册页面可能被 EmptyGate 全屏覆盖，相册按钮需确保 zIndex 高于 EmptyGate

**涉及文件**：`app/index.tsx` — 调整 albumBtnWrap 的渲染位置

---

### REQ-04 Review 页照片支持两指捏合缩放

**现状**：删除确认页（`review.tsx`）的 `DeleteGrid` 组件使用 `Image` + `TouchableOpacity` 展示照片缩略图，不支持任何缩放手势。用户希望在确认删除前能放大查看照片细节，避免误删。

**目标**：支持用户在 Review 页面上通过两指捏合（pinch-to-zoom）放大查看任意照片。

**实现要点**：

- **方案 A（推荐）**：点击照片缩略图时，弹出全屏预览弹窗，支持 `react-native-gesture-handler` 的 `PinchGestureHandler` 或 `react-native-reanimated` 实现捏合缩放 + 拖拽平移
  - 点击缩略图 → 全屏覆盖层展示该照片大图
  - 支持两指捏合缩放（1x ~ 5x）
  - 缩放后可拖拽平移查看局部
  - 点击空白处或下滑关闭弹窗
- **方案 B（备选）**：直接在缩略图网格内对每张图片支持捏合缩放（实现复杂，网格布局下体验差，不推荐）
- **实现细节**：
  - 新建 `src/components/delete-review/PhotoZoomModal.tsx` 组件
  - 使用 `PinchGestureHandler` + `Animated.View` 或 `react-native-reanimated` 的 `useAnimatedGestureHandler`
  - 缩放中心点跟随手指捏合中心
  - 缩放到 1x 以下时回弹到原始尺寸
- **交互**：
  - `DeleteGrid` 中 `onTap` 回调改为长按或双击触发全屏预览（单击仍为勾选/取消）
  - 或者将 `onTap` 拆分为：单击 = 勾选/取消，双击 = 打开缩放预览

**涉及文件**：
- `src/components/delete-review/PhotoZoomModal.tsx` — **新建**，全屏缩放预览组件
- `src/components/delete-review/DeleteGrid.tsx` — 新增 onPhotoPreview 回调
- `app/review.tsx` — 集成 PhotoZoomModal，管理预览状态

---

### REQ-05 庆祝动画后空页面闪屏优化

**现状**：在 review 页面确认删除后，流程为：删除成功 → 弹出 `CelebrationOverlay`（2 秒）→ `onDone` 回调中清空 `markedForDelete` → `loadNextGroup()` → `router.replace('/')`。问题在于 `onDone` 先将 `showCelebration` 设为 `false`，此时 review 页面重新渲染 —— `photosInGroup.length === 0`（因为 `markedForDelete` 已在上一步清空），于是短暂展示 `EmptyReviewPlaceholder`（"还没有待删除的照片"），然后再执行 `router.replace('/')` 跳走。用户看到的是一个突兀的闪屏。

在浏览页（`index.tsx`）快速删除后也有类似问题：`handleQuickDelete` 成功后弹出庆祝动画，`onDone` 设为 `setShowCelebration(false)`，如果此时 `currentGroup` 已被清空（refillGroup 异步未完成），短暂闪现空状态。

**目标**：庆祝动画播放期间保持当前 UI 冻结，动画结束后直接切换到目标页面，中间不闪现空状态占位。

**实现要点**：

- **方案**：在庆祝动画播放期间，用一个纯黑不透明遮罩覆盖整个页面内容（zIndex 低于 CelebrationOverlay 但高于页面内容），动画结束时遮罩与庆祝动画同时消失，下方已渲染好的新页面直接呈现。
- **Review 页具体改动**（`app/review.tsx`）：
  - 新增 `celebrationDone` 状态标记，初始 `false`
  - 删除成功后：先设置 `celebrationDone = false`，显示庆祝动画
  - `onDone` 回调中：先执行 `loadNextGroup()` + `router.replace('/')`，再设置 `showCelebration = false`
  - 或者：`onDone` 中先导航，再关闭动画（导航后的页面自然替换掉 review 页）
- **更简单的方案**：在 `onDone` 中先执行 `router.replace('/')` 导航，再 `setShowCelebration(false)`。由于导航是异步的，新页面挂载后 review 页被卸载，不会再闪现空状态。同时在 review 页 return 时，如果 `showCelebration === true` 且 `photosInGroup.length === 0`，不渲染 `EmptyReviewPlaceholder`，而是渲染一个纯黑占位（或直接 `null`）。
- **关键改动**：
  ```tsx
  // review.tsx onDone 回调
  onDone={() => {
    // 先导航，再关动画
    incrementGroupCount();
    loadNextGroup();
    router.replace('/');
    // 延迟关闭动画，让页面切换先完成
    setTimeout(() => setShowCelebration(false), 100);
  }}
  ```
- **浏览页（index.tsx）同理**：
  ```tsx
  // index.tsx handleQuickDelete 中的 celebration onDone
  onDone={() => {
    // refillGroup 已完成，直接关动画
    setShowCelebration(false);
  }}
  ```
  浏览页的问题在于 `refillGroup` 同步减去了照片数量，如果减完变 0 组，`!currentPhoto` 为 true 触发 `isGate`，短暂闪现 LoadingGate。修复：`celebrationOverlay` 可见时，在 gates 判断中跳过空状态渲染。
- **防御性修复**：在 review.tsx 的条件渲染中，如果 `showCelebration === true`，始终渲染非空内容（可选：渲染纯黑背景而非 EmptyReviewPlaceholder）

**涉及文件**：
- `app/review.tsx` — 调整 onDone 回调顺序 + 条件渲染
- `app/index.tsx` — 调整 onDone 回调 + gates 判断

---

## v1.8 需求优先级

| 优先级 | 需求编号 | 说明 |
| ------ | -------- | ---- |
| P0     | REQ-01   | 日期居中，视觉对齐核心问题 |
| P0     | REQ-05   | 闪屏体验缺陷，用户感知强烈 |
| P1     | REQ-02   | 空相册界面美化，品牌一致性 |
| P1     | REQ-03   | 相册按钮消失，功能性缺陷 |
| P2     | REQ-04   | 捏合缩放，锦上添花体验提升 |

---

## v1.8 影响范围

| 文件 | REQ-01 | REQ-02 | REQ-03 | REQ-04 | REQ-05 |
| ---- | ------ | ------ | ------ | ------ | ------ |
| `app/index.tsx` | ✓ | | ✓ | | ✓ |
| `src/components/photo-card/EmptyGate.tsx` | | ✓ | | | |
| `app/review.tsx` | | | | ✓ | ✓ |
| `src/components/delete-review/DeleteGrid.tsx` | | | | ✓ | |
| `src/components/delete-review/PhotoZoomModal.tsx` | | | | ✓ (新建) | |

---

## v1.8 验收标准

1. 浏览页顶部日期文字在屏幕水平方向严格居中，不受左右按钮宽度差异影响；LIVE badge 跟随日期一起居中
2. 空相册界面展示卡通幽灵占位图 + "还没有可整理的照片" + 副标题引导，风格与 EmptyReviewPlaceholder 统一
3. 空相册时左下角相册切换按钮（layers 图标）保持可见，用户可随时切换相册
4. Review 页点击照片缩略图可全屏预览并两指捏合缩放（1x~5x），缩放后可拖拽平移，单击关闭
5. 一组照片删除后庆祝动画播放完毕直接进入新页面，中间不闪现空状态占位或 Loading 状态

---

# v1.9 — 浏览页日期对齐与照片地理位置

> 版本：v1.9 | 日期：2026-05-28 | 状态：待开发

## 概述

基于 v1.8 完成后的细节打磨，聚焦浏览页日期位置微调与照片地理位置信息展示。共包含 2 项改进需求。

---

## 需求清单

### REQ-01 浏览页日期位置下移对齐按钮

**现状**：浏览页顶部日期文字的 `top` 值为 54，与 `topBar` 容器顶部对齐。但 `topBar` 内的排序按钮和删除按钮有 `paddingVertical: 8` 的内边距，按钮内的图标/文字实际起始位置在 62px 处，导致日期文字视觉上比按钮内容偏高约 8px。

**目标**：将日期文字下移使其与左右按钮的文字/图标基线对齐。

**实现要点**：

- `topCenter` 的 `top` 值从 `54` → `60`
- 日期行布局从单行 `flexDirection: 'row'` 改为 `column`（日期行 → 地点行）
- 日期行包裹在 `topDateRow` 容器中，LIVE badge 同行右侧

**涉及文件**：`app/index.tsx`

---

### REQ-02 照片地理位置信息展示

**现状**：浏览照片时不显示拍摄地点，用户无法快速了解照片的拍摄位置信息。

**目标**：在日期下方居中显示照片拍摄城市名，数据来源于照片 EXIF 中的 GPS 坐标。

**实现要点**：

- **GPS 数据获取**：通过 `expo-media-library` 的 `getAssetInfoAsync(id)` 读取系统照片的 `location` 字段
  - `location: { latitude: number; longitude: number } | null`
  - 仅相机拍摄且开启定位的照片才有此数据
- **逆向地理编码**：使用 Nominatim（OpenStreetMap 免费 API）将坐标转为城市名
  - API：`https://nominatim.openstreetmap.org/reverse?lat=X&lon=Y&zoom=10&accept-language=zh`
  - 提取 `address.city || address.town || address.county || address.state`
- **降级策略**：API 不可用时显示原始坐标（如 `31.23, 121.47`）
- **无 GPS 照片**：不显示地点行（截图、下载图片、关定位拍摄的照片均无此数据）
- **性能**：仅在 `currentPhoto.id` 变化时触发，使用 `cancelled` 标记防止竞态
- **展示格式**：日期下方 `📍 城市名`，11px 半透明白色居中

**涉及文件**：`app/index.tsx` — 新增 `photoLocation` state + `useEffect` + `topLocation` 样式

---

## v1.9 需求优先级

| 优先级 | 需求编号 | 说明 |
| ------ | -------- | ---- |
| P1     | REQ-01   | 日期对齐，细节打磨 |
| P2     | REQ-02   | 地理位置，锦上添花 |

---

## v1.9 影响范围

| 文件 | REQ-01 | REQ-02 |
| ---- | ------ | ------ |
| `app/index.tsx` | ✓ | ✓ |

---

## v1.9 验收标准

1. 浏览页日期文字与左右排序/删除按钮的文字基线在同一水平线上
2. 有 GPS 数据的照片在日期下方显示 "📍 城市名"（如 📍 上海市）
3. 无 GPS 数据的照片不显示地点行，界面无异常
4. 切换到不同照片时地点信息实时更新
