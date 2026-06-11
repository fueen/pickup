# 拾遗 PickUp v2.0 全局视觉升级与月份清理体验需求文档

> **文档类型**: 产品需求文档（PRD）  
> **版本**: v2.0  
> **日期**: 2026-06-05  
> **状态**: 待开发  
> **关联版本**: v1.3.4 / v1.3.5 已完成能力  
> **目标平台**: Android / iOS  

---

## 1. 版本目标

v2.0 是 PickUp 从“功能可用”走向“产品级质感”的一次大版本升级。本版本不改变“滑动整理照片、每 10 张一组确认删除”的核心心智，而是在此基础上补齐两个关键方向：

1. **月份维度清理闭环**：让“更多功能”页中的月份柱状图从只读统计，升级为可点击的月份清理入口。用户点击某个月份后，只整理该月份照片；该月份照片清理完成后给出明确完成反馈。
2. **全局 UI 体系升级**：参考 Dribbble 高质量移动端作品与 iOS Human Interface Guidelines 的设计原则，统一全局视觉语言、卡片层级、弹框质感、导航结构与统计模块位置，让 App 更接近原生 iOS 的精致、克制和流畅。

本版本聚焦 6 个方向：

1. 点击月份柱状图进入对应月份照片整理流，并在该月份清理完成时提示。
2. 全局 UI 视觉升级，作为 P0 需求处理。
3. 个人中心暂时隐藏“功能入口”卡片区。
4. 将个人中心统计卡片迁移到“更多功能”页，放在月份分析区域下方，并移除“更多功能”顶部大标题。
5. 重绘个人中心“使用指南”弹框，改为精致的手势引导预览式弹框。
6. 将项目版本号升级到 `2.0.0`。

---

## 2. 设计参考

### 2.1 iOS / Apple HIG 参考原则

v2.0 的 UI 升级应遵循 iOS 设计中的几个核心方向：

- **清晰层级**：重要内容靠布局、字号、留白和对比度建立优先级，而不是堆叠装饰。
- **克制的模态体验**：弹框只在用户需要决策或学习时出现，内容短、动作明确、关闭路径清晰。
- **熟悉的交互模式**：底部导航、卡片、sheet、选择器和反馈弹层应符合移动端用户直觉。
- **安全区与可触达性**：底部 Tab、按钮、弹框和手势引导必须适配安全区，并保证最小触控区域。

参考链接：

- Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/

### 2.2 Dribbble 视觉灵感参考

v2.0 参考 Dribbble 中移动端 dashboard、iOS app design、统计卡片和图表类作品的常见趋势，但不直接复制任何具体作品：

- 大面积深色背景中使用柔和高亮卡片，而不是大块纯色卡片。
- 统计数据使用清晰数字、轻量图标和低透明度容器建立节奏。
- 图表交互不只展示数据，也承担入口作用。
- 弹框和 sheet 采用更精致的圆角、浅描边、层级阴影和内容插图。
- 颜色以中性色为底，少量高饱和色用于状态和关键动作。

参考链接：

- Dribbble Mobile App Dashboard: https://dribbble.com/search/mobile-app-dashboard
- Dribbble iOS App Design: https://dribbble.com/search/ios-app-design

---

## 3. 当前项目基础

### 3.1 当前已具备能力

- `app/hub.tsx` 已经实现“更多功能”页，并通过 `MediaLibrary.getAssetsAsync()` 拉取全量照片，按年份和月份聚合生成 `chartData`。
- `src/components/hub/MonthlyChart.tsx` 已有横向月份柱状图展示能力，但当前仅展示数据，不支持点击月份。
- `PhotoContext` 封装 `usePhotoEngine`，已支持全局照片加载、当前组、排序模式、相册选择和滑动标记状态。
- `usePhotoEngine.loadPhotos(albumId)` 已支持按系统相册加载照片，但暂不支持按月份过滤。
- `app/settings.tsx` 个人中心当前包含：
  - 会员区
  - 统计区
  - 帮助区
  - 关于区
- 个人中心“使用指南”当前使用原生 `Alert.alert`，视觉不符合 v2.0 目标。
- 项目当前版本号在以下位置为 `1.3.4`：
  - `package.json`
  - `package-lock.json`
  - `app.config.js`
  - `src/constants/app-info.ts`

### 3.2 设计约束

- 继续使用项目已安装 Expo SDK 54 和现有 React Native / expo-router 代码模式。
- 不为 UI 升级引入重型 UI 框架。
- 全局 UI 升级优先通过 `src/design-tokens.ts`、现有组件和局部组件重构完成。
- 不上传照片，不引入云端分析。
- 月份清理只基于照片 `creationTime` 进行本地过滤。
- Android / iOS 均需可用，Android 真机体验优先保证。

---

## 4. 需求列表

| 编号 | 需求名称 | 优先级 | 类型 |
|---|---|---:|---|
| REQ-01 | 月份柱状图点击进入月份照片整理流 | P0 | 功能 / 数据流 |
| REQ-02 | 全局 UI 视觉体系升级 | P0 | UI / 设计系统 |
| REQ-03 | 个人中心隐藏功能入口卡片区 | P1 | 信息架构 |
| REQ-04 | 统计卡片迁移到更多功能页并移除顶部标题 | P0 | 信息架构 / UI |
| REQ-05 | 使用指南弹框重绘为手势引导预览 | P1 | UI / 教学 |
| REQ-06 | 版本号升级到 2.0.0 | P0 | 发布 / 配置 |

---

## REQ-01: 月份柱状图点击进入月份照片整理流

### 背景

当前“更多功能”页的月份柱状图只展示每个月份的照片数量，不能直接行动。用户看到某个月照片很多时，需要手动回到浏览页继续随机整理，无法针对特定月份集中清理。

v2.0 需要让柱状图成为可操作入口：点击某个月份后，进入照片整理流，当前待整理照片池只包含该年份该月份的照片。

### 目标

用户在“更多功能”页点击任意月份柱状图后，进入月份范围内的照片整理流程。整理过程中仅展示该月份照片；当该月份照片已经全部清理完成后，弹出提示：

`当前月份照片已经清理完成啦!`

### 推荐方案

推荐方案：**PhotoEngine 增加 monthScope，复用首页滑动整理体验**。

理由：

- 复用现有首页浏览页、滑动卡片、批量确认、庆祝动画和日用量限制。
- 不新增一套独立 review 页面，避免重复实现删除逻辑。
- 只需要为照片加载层增加月份过滤条件，并为页面增加“当前月份模式”的状态展示。

口径说明：本需求中“月份照片 review / 待选照片”指首页滑动整理流中的月份范围模式，而不是直接进入当前 `/review` 待删除确认页。`/review` 仍只在用户完成一组标记、需要确认删除时出现。

### 入口规则

| 场景 | 行为 |
|---|---|
| 点击有照片的月份柱 | 进入首页照片整理流，只展示该年该月照片 |
| 点击 `count = 0` 的月份柱 | 不跳转，展示轻提示：`这个月份还没有照片` |
| 点击当前月份柱 | 同样进入月份整理流，范围为当前年份当前月份 |
| 切换年份后点击月份柱 | 使用当前选择年份 + 点击月份作为过滤条件 |

### 月份范围定义

| 字段 | 规则 |
|---|---|
| `year` | 当前 Hub 页选中的年份 |
| `monthIndex` | `0-11`，与 JavaScript `Date.getMonth()` 保持一致 |
| 起始时间 | 该月第一天 `00:00:00.000` |
| 结束时间 | 下个月第一天 `00:00:00.000` 之前 |
| 判断字段 | `PhotoAsset.creationTime` |

### 整理流程

1. 用户在 `app/hub.tsx` 点击月份柱。
2. App 设置月份整理范围，例如 `{ year: 2026, monthIndex: 4 }`。
3. 跳转到首页整理页。
4. `usePhotoEngine` 按月份过滤照片，只生成该月份照片组。
5. 用户按现有规则滑动整理：
   - 上滑标记删除
   - 下滑保留
   - 左滑跳过
   - 右滑上一张
   - 每 10 张一组进入删除确认
6. 删除确认成功后继续加载该月份剩余照片。
7. 当该月份没有可继续清理的照片时，弹出完成提示。

### 完成提示规则

| 场景 | 是否弹出 |
|---|---|
| 该月份照片全部被成功删除后 | 弹出 `当前月份照片已经清理完成啦!` |
| 该月份本来没有照片 | 不进入整理流，Hub 页轻提示 |
| 用户只是进入月份整理流但未删除 | 不弹完成提示 |
| 用户保留或跳过了部分照片 | 不应误判为“全部删完” |
| 删除失败或系统拒绝删除授权 | 不弹完成提示 |

说明：本需求中的“清理完成”以“该月份当前可删除候选照片已全部从 App 照片池中移除”为准。系统删除失败、用户取消删除、用户保留照片，都不能触发完成提示。

### 月份模式 UI

首页进入月份整理模式后，需要给用户明确上下文：

- 顶部或照片日期区域显示轻量标签：`2026年5月`
- 可选增加返回范围入口：`返回全部照片`
- 空状态文案需要区分普通空相册和月份清理完成：
  - 普通空相册：`还没有可整理的照片`
  - 月份完成：`当前月份照片已经清理完成啦!`

### 技术范围

可能修改：

- `app/hub.tsx`
- `src/components/hub/MonthlyChart.tsx`
- `src/contexts/PhotoContext.tsx`
- `src/hooks/usePhotoEngine.ts`
- `src/services/photo-service.ts`
- `app/index.tsx`
- `src/types/photo.ts`

可能新增：

- `MonthScope` 类型，例如：

```ts
export interface MonthScope {
  year: number;
  monthIndex: number;
  label: string;
}
```

### 验收标准

- [ ] 月份柱状图中有照片的月份可点击。
- [ ] 点击月份后进入照片整理流，照片池只包含该年份该月份照片。
- [ ] 点击 `count = 0` 的月份不跳转，并给出轻提示。
- [ ] 月份整理模式下用户能清楚看到当前月份范围。
- [ ] 月份整理仍复用现有删除确认流程，不自动批量删除。
- [ ] 删除成功后继续加载该月份剩余照片。
- [ ] 该月份照片全部成功删除后弹出 `当前月份照片已经清理完成啦!`。
- [ ] 删除失败、取消删除、系统授权拒绝时不误弹完成提示。
- [ ] 月份过滤不绕过免费用户每日组数限制。
- [ ] `npx.cmd tsc --noEmit` 通过。
- [ ] `npx.cmd jest --runInBand` 通过。

---

## REQ-02: 全局 UI 视觉体系升级

### 背景

当前 PickUp 已经形成黑色背景、金色强调、卡片式布局的基础风格，但不同页面之间仍存在视觉密度、圆角、卡片层级、弹框质感、图标线重和页面标题规则不一致的问题。

用户明确要求全局 UI 参考 Dribbble 优秀作品与 iOS design 风格进行升级，并将其作为 P0 需求。

### 目标

建立更统一、更原生、更精致的 v2.0 视觉系统，使主要页面看起来像同一个产品，而不是多个功能逐步拼接起来的集合。

### 视觉方向

推荐方向：**暗色 iOS 原生质感 + 轻量玻璃层级 + 克制数据卡片**。

核心关键词：

- 深色背景
- 柔和层级
- 少量金色强调
- 圆润但不过度圆角
- 细描边
- 轻阴影
- 大数字统计
- 原生感 modal / sheet
- 图标线重统一
- 动效轻快但不夸张

### 设计系统规则

| 项目 | v2.0 规则 |
|---|---|
| 背景 | 保持深色，但避免全页面只有纯黑，可引入极轻微层级色 |
| 卡片 | 统一使用 `surface / surfaceElevated`，低透明描边，不做嵌套卡片 |
| 圆角 | 普通卡片建议 `16-22`，小控件 `12-16`，胶囊按钮使用 `pill` |
| 文字 | 标题字号克制，页面内不滥用 hero 级大字 |
| 数字 | 统计类数字可加粗、放大，但不挤压标签 |
| 图标 | 高频入口使用圆润、自绘 glyph 或统一 MaterialCommunityIcons 线重 |
| 弹框 | 不再使用原生 `Alert.alert` 展示复杂内容 |
| 动效 | 使用短时长、低幅度动效，不做重型粒子或过度弹跳 |

### 页面级升级范围

| 页面 | 目标 |
|---|---|
| 首页浏览页 | 保持照片为主，按钮更像原生浮动控件，月份模式标签清晰 |
| 更多功能页 | 去掉顶部大标题，改为数据与月份分析直接进入内容 |
| 个人中心 | 更像 iOS 设置页，减少功能卡片堆叠，保留会员、帮助、关于 |
| 删除确认页 | 保持沉浸式确认，但检查按钮、标题、照片堆叠是否符合 v2.0 层级 |
| 最近删除页 | 网格与标题区域更干净，避免工具属性过强 |
| 使用指南弹框 | 替换原生 Alert，采用自定义引导预览弹框 |

### Tokens 升级建议

建议在 `src/design-tokens.ts` 中补充或统一：

| Token | 说明 |
|---|---|
| `surfaceGlass` | 半透明浮层背景 |
| `borderSubtle` | 低透明白色描边 |
| `shadowSoft` | 轻阴影参数 |
| `radius.sheet` | sheet / modal 圆角 |
| `radius.tile` | 小卡片圆角 |
| `typography.largeNumber` | 统计数字样式 |
| `typography.sectionTitle` | section 标题样式 |

### 非目标范围

- 不重做品牌 Logo。
- 不改核心导航结构。
- 不引入 shadcn、NativeWind 或大型 UI 框架。
- 不做完整设计稿导入。
- 不做浅色模式。

### 技术范围

可能修改：

- `src/design-tokens.ts`
- `app/_layout.tsx`
- `app/index.tsx`
- `app/hub.tsx`
- `app/settings.tsx`
- `app/review.tsx`
- `app/recent-deletes.tsx`
- `src/components/settings/*`
- `src/components/photo-card/*`
- `src/components/delete-review/*`
- `src/components/ui/*`

### 验收标准

- [ ] 主要页面视觉风格统一，不再出现明显割裂的卡片、标题或弹框样式。
- [ ] 全局不使用原生 `Alert.alert` 承载复杂 UI 内容。
- [ ] 统计卡片、月份图表、设置项、弹框的圆角、描边、背景层级一致。
- [ ] 所有按钮触控区域不小于 `44x44`。
- [ ] 小屏设备上文本不重叠、不溢出。
- [ ] 页面整体不被单一金色或单一灰黑色淹没，强调色有节制。
- [ ] Android dev-client 中主要页面滚动、弹框、导航无明显卡顿。
- [ ] `npx.cmd tsc --noEmit` 通过。
- [ ] `npx.cmd jest --runInBand` 通过。

---

## REQ-03: 个人中心隐藏功能入口卡片区

### 背景

当前“更多功能”页已有功能入口卡片区，个人中心也承担了一部分入口职责。v2.0 需要先精简个人中心的信息密度，让个人中心回归账户、会员、帮助和关于，不再承担功能聚合。

用户要求：个人中心把功能入口那一块的卡片代码注释掉，先不要展示。

### 目标

个人中心中与“功能入口”相关的卡片区暂时不展示，并通过代码注释保留原实现，方便后续恢复或迁移。

### UI 规则

| 区域 | 目标行为 |
|---|---|
| 个人中心功能入口卡片区 | 不展示 |
| 会员区 | 保留 |
| 帮助区 | 保留 |
| 关于区 | 保留 |
| 开发者模式热区 | 保留 |

### 代码规则

- 使用清晰注释包裹被隐藏的功能入口卡片代码。
- 注释需说明隐藏原因，例如：

```tsx
{/* v2.0: 功能入口暂时从个人中心移除，后续统一放入 Hub 或新入口页 */}
```

- 不删除相关组件文件，避免后续恢复成本过高。
- 不影响 `recentDeleteCount` 等仍被其他区域使用的数据。

### 技术范围

主要修改：

- `app/settings.tsx`

可能涉及：

- `src/components/settings/SettingsSection.tsx`
- `src/components/settings/SettingsRow.tsx`

### 验收标准

- [ ] 个人中心不再展示功能入口卡片区。
- [ ] 被隐藏代码以注释方式保留，不直接删除。
- [ ] 个人中心会员、帮助、关于、开发者模式入口仍正常。
- [ ] 页面滚动高度和底部留白自然，不出现大块空洞。

---

## REQ-04: 统计卡片迁移到更多功能页并移除顶部标题

### 背景

当前统计卡片在个人中心展示，但“更多功能”页才是统计、月份分析、每周回顾、成就系统所在的位置。用户希望将个人中心统计区域卡片移到更多功能页，放在月份分析区域下面，并去掉更多功能页最上方“更多功能”四个文字。

### 目标

重构“更多功能”页的信息架构：

1. 移除页面顶部大标题 `更多功能`。
2. 月份分析仍作为页面首个核心模块。
3. 将统计卡片迁移到月份分析区域下方。
4. 个人中心不再展示统计卡片区域。

### 推荐信息结构

v2.0 Hub 页面结构建议：

```text
顶部安全区
  年份筛选 / 总照片数轻量信息

月份分析
  月份柱状图
  点击月份进入月份清理

统计概览
  已浏览
  最近删除
  连续天数
  释放空间

每周清理回顾

成就系统

底部安全区留白
```

### UI 规则

| 模块 | 规则 |
|---|---|
| 顶部大标题 | 移除 `更多功能` 四个字 |
| 页面副标题 | 可保留为小字信息，也可整合到月份分析模块中 |
| 月份分析 | 保持在统计卡片上方 |
| 统计卡片 | 2x2 网格或横向 compact cards，放在月份分析下面 |
| 个人中心统计区 | 从个人中心移除 |

### 数据规则

统计卡片数据继续使用现有来源：

| 卡片 | 数据来源 |
|---|---|
| 已浏览 | `StatsContext.totalViewed` |
| 最近删除 | `getValidRecentDeletes()` |
| 连续天数 | `StatsContext.streakDays` |
| 释放空间 | `StatsContext.totalFreedBytes` |

### 技术范围

主要修改：

- `app/hub.tsx`
- `app/settings.tsx`
- `src/components/settings/StatCard.tsx`

可能涉及：

- `src/components/settings/SettingsSection.tsx`
- `src/design-tokens.ts`

### 验收标准

- [ ] “更多功能”页顶部不再显示 `更多功能` 四个大字。
- [ ] 月份分析模块仍位于页面前部。
- [ ] 统计卡片位于月份分析区域下方。
- [ ] 个人中心不再展示统计卡片区域。
- [ ] 统计卡片数据与迁移前一致。
- [ ] 最近删除数量进入 Hub 时会刷新。
- [ ] 小屏设备上 2x2 卡片不挤压、不溢出。

---

## REQ-05: 使用指南弹框重绘为手势引导预览

### 背景

当前个人中心“使用指南”点击后使用原生 `Alert.alert` 展示三行文字：

```text
1. 浏览照片，上滑删除下滑保留
2. 每10张一组，完成一组后确认删除
3. Pro用户无限使用，免费用户每日3组
```

该弹框视觉粗糙，与 PickUp 当前手势引导、暗色视觉和 v2.0 UI 目标不一致。用户希望重绘弹框，弹出后直接展示一个类似“开始手势引导”的截图式预览。

### 目标

将“使用指南”从原生 Alert 改为自定义模态弹框。弹框中展示一张“手势引导截图式预览”，让用户一眼理解四方向手势，而不是阅读长文字说明。

### 推荐方案

推荐方案：**自定义 GuidePreviewModal + 抽象截图式手势图**。

说明：

- 不截取真实屏幕，避免依赖截图资源和设备尺寸。
- 使用 React Native View 绘制一张“照片卡片 + 四方向手势标签 + 底部进度点”的抽象预览。
- 视觉上像一张 App 截图，但内容是本地可控 UI。

### 弹框内容

| 区域 | 内容 |
|---|---|
| 顶部标题 | `快速上手` |
| 副标题 | `像刷照片一样整理相册` |
| 中央预览 | 抽象照片卡片 + 四方向手势提示 |
| 底部说明 | `上滑删除 · 下滑保留 · 左滑跳过 · 右滑上一张` |
| 主按钮 | `开始整理` |
| 次按钮 | `我知道了` 或右上角关闭 |

### 预览图规格

预览图应包含：

- 一张居中的照片卡片占位。
- 上方红色删除提示。
- 下方绿色保留提示。
- 左侧跳过提示。
- 右侧上一张提示。
- 底部 10 个小圆点，黄/绿/灰混合展示进度。
- 可使用项目现有 `Tokens.color.accent / danger / safe`。

### 交互规则

| 操作 | 行为 |
|---|---|
| 点击“使用指南” | 打开自定义弹框 |
| 点击 `开始整理` | 关闭弹框并跳转首页 `/` |
| 点击 `我知道了` | 关闭弹框，留在个人中心 |
| 点击遮罩 | 关闭弹框 |
| Android 返回键 | 关闭弹框 |

### 技术范围

可能新增：

- `src/components/ui/GuidePreviewModal.tsx`

主要修改：

- `app/settings.tsx`

可能复用：

- `src/components/gesture/GestureGuideOverlay.tsx`
- `src/design-tokens.ts`

### 验收标准

- [ ] 点击个人中心“使用指南”不再出现原生 Alert。
- [ ] 弹框视觉与 v2.0 暗色 iOS 风格一致。
- [ ] 弹框中有清晰的手势引导截图式预览。
- [ ] 用户无需阅读长段文字即可理解四方向手势。
- [ ] `开始整理` 可关闭弹框并进入首页。
- [ ] `我知道了` 或关闭按钮可关闭弹框。
- [ ] 小屏设备上弹框内容不溢出。

---

## REQ-06: 版本号升级到 2.0.0

### 背景

v2.0 是全局 UI 与信息架构升级版本，需要同步更新项目版本号，确保 App 内关于页、更新日志弹框、构建配置和 package metadata 一致。

### 目标

将项目版本号从 `1.3.4` 升级为 `2.0.0`。

### 修改范围

| 文件 | 字段 |
|---|---|
| `package.json` | `version` |
| `package-lock.json` | 根 package version |
| `app.config.js` | `expo.version` |
| `src/constants/app-info.ts` | `APP_VERSION` |
| `src/constants/changelog.ts` | 当前版本 changelog |
| `CHANGELOG.md` | 新增 `v2.0.0` 更新记录 |
| `README.md` | 当前版本和 release 包路径，如本轮同步文档 |

### 更新日志建议

App 内 changelog 可写：

- `月份分析现在可以直接进入指定月份清理`
- `全局界面升级为更精致的 v2.0 视觉风格`
- `统计概览迁移到更多功能页`
- `使用指南升级为手势预览弹框`

### 构建产物命名

如本轮生成 release APK，建议复制到：

```text
dist/pickup-v2.0.0-release.apk
```

### 验收标准

- [ ] `package.json` 版本为 `2.0.0`。
- [ ] `package-lock.json` 版本为 `2.0.0`。
- [ ] `app.config.js` 中 `expo.version` 为 `2.0.0`。
- [ ] `src/constants/app-info.ts` 中 `APP_VERSION` 为 `2.0.0`。
- [ ] App 内关于页展示 `2.0.0`。
- [ ] 更新日志弹框能按 `2.0.0` 触发。
- [ ] 如构建 release APK，输出文件名包含 `v2.0.0`。

---

## 5. v2.0 影响范围

| 文件 | REQ-01 | REQ-02 | REQ-03 | REQ-04 | REQ-05 | REQ-06 |
|---|---:|---:|---:|---:|---:|---:|
| `app/hub.tsx` | ✓ | ✓ | | ✓ | | |
| `src/components/hub/MonthlyChart.tsx` | ✓ | ✓ | | | | |
| `app/index.tsx` | ✓ | ✓ | | | | |
| `src/hooks/usePhotoEngine.ts` | ✓ | | | | | |
| `src/contexts/PhotoContext.tsx` | ✓ | | | | | |
| `src/services/photo-service.ts` | ✓ | | | | | |
| `src/types/photo.ts` | ✓ | | | | | |
| `app/settings.tsx` | | ✓ | ✓ | ✓ | ✓ | |
| `src/components/settings/StatCard.tsx` | | ✓ | | ✓ | | |
| `src/components/ui/GuidePreviewModal.tsx` | | ✓ | | | ✓ | |
| `src/design-tokens.ts` | | ✓ | | | ✓ | |
| `package.json` | | | | | | ✓ |
| `package-lock.json` | | | | | | ✓ |
| `app.config.js` | | | | | | ✓ |
| `src/constants/app-info.ts` | | | | | | ✓ |
| `src/constants/changelog.ts` | | | | | | ✓ |
| `CHANGELOG.md` | | | | | | ✓ |
| `README.md` | | | | | | ✓ |

---

## 6. v2.0 优先级建议

| 优先级 | 需求 | 原因 |
|---|---|---|
| P0 | REQ-02 全局 UI 视觉体系升级 | 用户明确指定为 P0，且影响所有页面质感 |
| P0 | REQ-01 月份柱状图点击进入月份照片整理流 | 把统计变成行动入口，是 v2.0 核心功能闭环 |
| P0 | REQ-04 统计卡片迁移到更多功能页并移除顶部标题 | 信息架构调整，直接影响 Hub / 个人中心主界面 |
| P0 | REQ-06 版本号升级到 2.0.0 | 大版本发布必要配置 |
| P1 | REQ-05 使用指南弹框重绘为手势引导预览 | 明显改善体验，但不阻塞核心整理流 |
| P1 | REQ-03 个人中心隐藏功能入口卡片区 | 信息精简，范围较小 |

---

## 7. v2.0 验收总清单

- [ ] 月份柱状图中有照片的月份可点击进入月份整理流。
- [ ] 月份整理流只展示所选年份和月份照片。
- [ ] 该月份照片全部成功删除后，弹出 `当前月份照片已经清理完成啦!`。
- [ ] 全局 UI 完成 v2.0 风格统一升级。
- [ ] 个人中心不再展示功能入口卡片区。
- [ ] 个人中心不再展示统计卡片区域。
- [ ] 更多功能页顶部不再显示 `更多功能` 四个大字。
- [ ] 更多功能页月份分析区域下方展示统计卡片。
- [ ] 个人中心“使用指南”改为自定义手势引导预览弹框。
- [ ] 项目版本号升级到 `2.0.0`。
- [ ] 所有新增和修改文案为中文，且无乱码。
- [ ] `npx.cmd tsc --noEmit` 通过。
- [ ] `npx.cmd jest --runInBand` 通过。
- [ ] Android dev-client 或 release 包完成核心流程真机回归。

---

## 8. 推荐实施顺序

建议按以下顺序开发：

1. **REQ-06 版本号升级到 2.0.0**  
   先统一版本字段，避免 changelog、关于页和后续构建产物命名混乱。

2. **REQ-04 统计卡片迁移 + Hub 顶部标题移除**  
   先完成信息架构调整，为 UI 升级建立稳定页面结构。

3. **REQ-03 个人中心隐藏功能入口卡片区**  
   精简个人中心，减少后续 UI 升级范围。

4. **REQ-01 月份柱状图进入月份整理流**  
   实现 v2.0 核心功能闭环，需要重点测试数据过滤、删除完成判断和日用量限制。

5. **REQ-05 使用指南弹框重绘**  
   替换原生 Alert，补齐教学体验。

6. **REQ-02 全局 UI 视觉体系升级**  
   最后做全局回归和统一打磨，避免前面信息架构变化导致重复返工。

说明：虽然 REQ-02 是 P0，但建议在结构和核心数据流稳定后统一视觉打磨。

---

## 9. 风险与注意事项

- 月份整理模式不要绕过当前免费用户每日限制。
- 月份整理完成提示不能只看“已浏览完”，必须避免用户保留或跳过照片时误提示“清理完成”。
- `MediaLibrary.getAssetsAsync()` 支持相册过滤，但月份过滤需要在本地基于 `creationTime` 二次过滤。
- 如果用户删除的是系统照片，Android 仍会触发系统删除确认，不能自定义系统弹框。
- 个人中心统计卡片迁移后，仍要保证统计数据在 Hub 聚焦时刷新，尤其是最近删除数量。
- 全局 UI 升级不要引入过多 BlurView 或复杂阴影，低端 Android 可能掉帧。
- 原生 `Alert.alert` 可以保留用于简单错误提示，但不能再用于“使用指南”这种复杂内容。
- 版本升级后 App 内更新日志弹框会再次触发，需要同步 `src/constants/changelog.ts`。
- 当前工作区已有历史改动，开发和提交时应只 stage v2.0 相关文件。

---

## 10. 非目标范围

以下内容不纳入 v2.0：

- AI 自动识别照片质量。
- 云端同步、账号体系或跨设备恢复。
- 新增真实设计稿资源或远程图片资源。
- 重做 Logo、App icon 或品牌名称。
- 最近删除恢复能力重做。
- iOS / Android 商店上架材料。
- Expo SDK 升级。
---

## 2026-06-06 追加需求：品牌主色、开屏动画与删除确认页细节打磨

### 背景

基于 v2.0.0 已完成版本的真机视觉反馈，本轮继续处理三类细节：

1. 全局强调色需要从原先偏荧光黄绿统一为更稳定的主色 `#A8D46F`。
2. 开屏动画需要回退到今天修改前最初的卡片漂入版本，仅替换旧黄色。
3. 删除确认页需要更贴合当前照片内容，弱化固定装饰光斑，提升沉浸感和确认层级。

### 需求清单

| 编号 | 需求名称 | 优先级 | 类型 |
|---|---|---:|---|
| REQ-07 | 全局主色统一为 `#A8D46F` | P0 | UI / 品牌 |
| REQ-08 | 开屏动画恢复原始卡片漂入结构并替换强调色 | P0 | UI / 动效 |
| REQ-09 | 删除确认页标题与布局微调 | P0 | UI / 文案 |
| REQ-10 | 删除确认页使用首张待删照片生成模糊背景氛围 | P1 | UI / 沉浸感 |

### REQ-07：全局主色统一为 `#A8D46F`

- `src/design-tokens.ts` 中 `accent` 和 `safe` 均使用 `#A8D46F`。
- 月份分析柱状图、Hub 强调数字、底部 Hub glyph、设置页周回顾与成就相关强调色不得继续硬编码旧荧光色。
- 应用图标相关资产可同步使用该主色，但 native splash 图如需回退，应避免和 React Native 开屏动画产生割裂。

### REQ-08：开屏动画恢复原始卡片漂入结构并替换强调色

- 恢复三张深色卡片错峰漂入、`PICKUP` 字母错峰出现、底部小点脉冲的原始结构。
- 原始黄色 `#FFCC00` 不再硬编码，统一通过 `Tokens.color.accent` 输出。
- 不使用 Liquid Glass 多层半透明方案，不保留 `glassShell` / `glassDot` / 模糊叠层等实验实现。

### REQ-09：删除确认页标题与布局微调

- 标题从“准备收工了吗？”调整为“决定好去留了吗？”。
- 照片缩略图堆叠区域整体下移，避免与标题、副标题过近。
- “点击照片再次确认”提示跟随缩略图整体下移，保持与图片之间的呼吸感。

### REQ-10：删除确认页使用首张待删照片生成模糊背景氛围

- 删除确认页背景优先使用待删除照片列表中的第一张照片 URI。
- 背景层使用全屏图片、`blurRadius={42}`、`SafeBlurView` 和深色遮罩组合实现近似高斯模糊与照片取色氛围。
- 移除固定黄绿色装饰光斑，避免背景和照片内容冲突。
- 若没有待删除照片，则回退到深色背景和原有面板层级。

### 验收标准

- [x] `npx.cmd tsc --noEmit` 通过。
- [x] `npx.cmd jest --runInBand` 通过。
- [x] 删除确认标题显示“决定好去留了吗？”。
- [x] 删除确认页源码包含 `backdropPhoto`、`blurRadius={42}` 与 `SafeBlurView`。
- [x] 开屏动画源码不再包含旧黄色 `#FFCC00`。
- [x] 本地 dev APK 构建通过并复制到 `dist/pickup-v2.0.0-dev.apk`。
- [x] 本地 release APK 构建通过并复制到 `dist/pickup-v2.0.0-release.apk`。

---

## 2026-06-07 追加需求：Live Photo 预览、相册选择拼贴 UI 与 App 图标升级

### 背景

基于 v2.0.0 已完成版本与新一轮视觉方案评审，本轮继续补齐三个产品体验点：

1. 照片 review / 预览链路需要支持 Live Photo。用户看到 Live Photo 时，应能通过熟悉的 iOS Live 图标识别，并点击播放动态内容。
2. 相册选择页需要采用评审页 `A. Gallery Mosaic` 的照片拼贴视觉方向，但业务分组仍保持当前系统相册列表逻辑，不按月份重新分组。
3. App Logo / Icon 采用评审页 `1. Picked Cards` 方向，以照片卡片堆叠和当前主色 `#A8D46F` 强化 PickUp 的品牌记忆。

参考设计稿：

- `designs/album-logo-concepts.html`
- 相册页方向：`A. Gallery Mosaic`
- Logo 方向：`1. Picked Cards`

### 需求清单

| 编号 | 需求名称 | 优先级 | 类型 |
|---|---|---:|---|
| REQ-11 | 照片 review / 预览链路支持 Live Photo 识别与播放 | P0 | 媒体 / 交互 |
| REQ-12 | 相册选择页升级为照片拼贴式 UI，但保持现有相册分组逻辑 | P0 | UI / 信息架构 |
| REQ-13 | App Logo / Icon 升级为 Picked Cards 品牌图标 | P1 | 品牌 / 视觉资产 |

---

### REQ-11：照片 review / 预览链路支持 Live Photo 识别与播放

#### 背景

当前 `PhotoAsset.mediaType` 已包含 `livePhoto` 类型，首页照片卡片也已有基础 `LIVE` 文本徽章。但在 review / 全屏预览链路中，Live Photo 仍缺少更符合 iOS 认知的图标化提示和点击播放能力。用户无法确认该照片是否包含动态片段，也无法在删除前查看动态内容。

#### 目标

当 App 识别到照片为 Live Photo 时，在照片左上角展示 iOS 风格 Live 图标。用户点击该图标后，可以播放 Live Photo 的动态片段；播放结束后回到静态照片预览状态。

#### 适用范围

| 页面 / 组件 | 目标行为 |
|---|---|
| 首页照片浏览卡片 | 保留或升级 Live 标识，建议统一为图标 + `LIVE` |
| 删除确认页照片预览入口 | 若预览图对应 Live Photo，应展示 Live 标识 |
| 待删除列表全屏预览 `PhotoZoomModal` | 左上角展示可点击 Live 图标，并支持播放 |
| 照片详情 sheet | 可展示媒体类型为 `Live Photo` |

说明：本需求中的“照片 review 界面”优先覆盖删除确认后的全屏预览和待删除照片查看链路；首页浏览卡片同步升级为同一视觉语言，避免同一媒体类型在不同页面表现不一致。

#### Live Photo 识别规则

| 识别来源 | 规则 |
|---|---|
| `PhotoAsset.mediaType` | 值为 `livePhoto` 时判定为 Live Photo |
| Expo MediaLibrary 原始资产 | 如 SDK 返回 `mediaSubtypes` 或等价字段，应映射到 `PhotoAsset.mediaType = 'livePhoto'` |
| Android Motion Photo 文件名 | 对 `MVIMG_*.jpg/jpeg` 作为可播放动态照片候选处理，但不依赖 Android `mediaSubtypes` 过滤 |
| Android Motion Photo XMP | 若 JPEG 头部存在 `GCamera:MotionPhoto="1"` 且 `Container:Item Item:Mime="video/mp4"` 声明长度，可从文件尾部提取内嵌 MP4 到缓存后播放 |
| 无法读取动态资源 | 仍展示 Live 标识，但点击后给出轻提示，不应崩溃 |

#### Live 图标视觉规则

- 图标位置：照片内容区域左上角，距离照片边缘建议 `12-16px`。
- 图标样式：参考 iOS Photos 的 Live Photo 图标心智，使用同心圆 / 多圆环 / 放射圆点组合，旁边可附带短文本 `LIVE`。
- 容器样式：半透明深色胶囊或玻璃背景，保证在亮图、暗图上都可读。
- 最小触控区域：不小于 `44x44`。
- 播放中状态：图标可出现轻微脉冲或进度反馈，避免用户重复点击无反馈。
- 非 Live Photo：不展示该图标，不占位。

#### 播放交互规则

| 操作 | 行为 |
|---|---|
| 点击 Live 图标 | 播放 Live Photo 动态片段 |
| 播放中再次点击 | 可暂停或重新播放，具体实现以稳定性优先 |
| 播放结束 | 自动回到静态照片 |
| 动态资源加载失败 | 展示轻提示：`Live Photo 暂时无法播放` |
| 用户关闭预览 | 停止播放并释放播放资源 |
| 用户缩放/拖动照片 | 播放能力不应破坏现有缩放、拖动体验 |

#### 技术实现要求

- 优先使用项目已安装 Expo SDK 54 和现有媒体能力；只有确认 Expo 当前 API 行为时才查官方文档。
- 如 Expo MediaLibrary 只能稳定返回静态图 URI，需要通过 `getAssetInfoAsync` 或平台支持字段获取 Live Photo 的 paired video / paired resource。
- 若 Android 不支持真实 Live Photo 播放，应保留静态识别和友好降级提示，不阻塞 Android 主流程。
- Android Motion Photo 不使用 `mediaSubtypes: ['livePhoto']` 做查询过滤；该参数在 Android 上可能被静默忽略并返回全部照片，容易造成额外 `getAssetInfoAsync` 扫描和卡顿。
- Android Motion Photo 播放优先使用本地文件解析：读取 JPEG/XMP 中的 Motion Photo 标记和 `video/mp4` item 长度，提取内嵌 MP4 到 `expo-file-system` cache 后交给 `expo-video` 播放。
- 若 iOS 支持 paired video 播放，可在全屏预览中临时切换为视频播放器或原生可播放视图。
- 播放逻辑应封装为独立组件，例如 `LivePhotoBadge` / `LivePhotoPlayerOverlay`，避免散落在多个页面。
- 不因播放 Live Photo 引入云端服务或上传照片。

#### 可能修改文件

| 文件 | 说明 |
|---|---|
| `src/types/photo.ts` | 补充 Live Photo 动态资源字段，如 `pairedVideoUri` / `livePhotoVideoUri` |
| `src/hooks/usePhotoEngine.ts` | 映射 Live Photo 类型与必要资源 |
| `src/services/photo-service.ts` | 分组与排序时保留 Live Photo 元数据 |
| `src/components/photo-card/PhotoCard.tsx` | 首页 Live 图标升级 |
| `src/components/delete-review/PhotoZoomModal.tsx` | 全屏预览 Live 播放入口 |
| `src/components/delete-review/PhotoDetailSheet.tsx` | 媒体类型展示 |
| `src/components/ui/*` | 可新增 Live 图标 / 播放控件组件 |

#### 验收标准

- [ ] Live Photo 能被识别为 `mediaType = 'livePhoto'`。
- [ ] Android `MVIMG_*.jpg/jpeg` 能作为 Motion Photo 候选识别为可播放动态照片。
- [ ] 包含 `GCamera:MotionPhoto="1"` 和 `video/mp4` item 长度的 Motion Photo 能提取内嵌 MP4 到缓存并播放。
- [ ] Live Photo 左上角展示 iOS 风格 Live 图标。
- [ ] 非 Live Photo 不展示 Live 图标。
- [ ] 点击 Live 图标可播放动态内容，播放结束后回到静态预览。
- [ ] 动态资源不可用时展示轻提示，不崩溃、不黑屏。
- [ ] 关闭全屏预览时停止播放并释放资源。
- [ ] Live 播放不破坏现有双击缩放和关闭交互；预览图点击区域不误触发动态照片播放。
- [ ] Android 不支持真实播放时有清晰降级，不影响删除流程。
- [ ] `npx.cmd tsc --noEmit` 通过。
- [ ] `npx.cmd jest --runInBand` 通过。
- [ ] iOS 真机或模拟器完成至少 1 张 Live Photo 播放回归。

---

### REQ-12：相册选择页升级为照片拼贴式 UI，但保持现有相册分组逻辑

#### 背景

当前相册选择页使用 2 列方形封面卡片，功能清晰但视觉普通，与 v2.0 的精致化目标和本轮评审的拼贴设计方向不一致。用户已选择效果图中的 `A. Gallery Mosaic` 方向，希望相册选择页呈现更接近 iOS gallery / Dribbble photo mosaic 的照片墙质感。

同时，用户明确要求：**只改变 UI，不改变现有相册分组逻辑**。也就是说，相册列表仍然按当前逻辑展示“所有照片 + 系统相册”，不按月份重新分组。

#### 目标

将 `app/albums.tsx` 从 2 列相册卡片升级为拼贴式相册列表。每个相册项使用多张缩略图组成 mosaic / bento 封面，并展示相册名称与照片数量；点击任一相册后，仍按当前 `setSelectedAlbum({ id, title })` 逻辑返回首页整理。

#### 信息架构规则

| 项目 | 规则 |
|---|---|
| 分组逻辑 | 保持当前 `toVisibleAlbumItems` 输出，不按月份分组 |
| 排序逻辑 | 保持当前按照片数量降序 |
| 特殊入口 | `__all__` / 所有照片仍放在列表首位 |
| 点击行为 | 保持当前选择相册并 `router.back()` |
| 数据来源 | 继续使用 `MediaLibrary.getAlbumsAsync()` 与 `MediaLibrary.getAssetsAsync()` |

#### UI 方向

采用评审页 `A. Gallery Mosaic` 的视觉语言，但将“月份标题”替换为“相册项”：

- 页面顶部：返回按钮 + 标题 `相册` 或 `选择相册` + 可选搜索 / 筛选图标。
- 每个相册：一个横向或纵向的拼贴模块。
- 拼贴模块：使用 4-8 张相册内照片缩略图，大小错落排列。
- 右下角：照片数量胶囊，例如 `+248` 或 `248 张`。
- 标题：相册名称放在拼贴上方或下方，确保可读。
- 当前主色 `#A8D46F` 用于选中、数量 badge 或关键入口，不大面积铺色。

#### 相册封面资源规则

| 场景 | 行为 |
|---|---|
| 相册照片数 >= 4 | 拉取多张缩略图组成 mosaic |
| 相册照片数 2-3 | 使用已有照片重复布局或降级为小拼贴 |
| 相册照片数 = 1 | 单图大封面 + 数量 badge |
| 无法读取缩略图 | 展示深色占位拼贴，不隐藏相册项 |
| `所有照片` | 优先使用全量照片池前若干张作为拼贴来源 |

#### 性能约束

- 不一次性为所有相册拉取大量照片。
- 每个相册建议最多拉取 `4-8` 张缩略图。
- 首屏优先加载相册基础信息，缩略图可分批或并行加载。
- `FlatList` 应保留虚拟滚动能力，避免大相册数量时卡顿。
- 图片圆角、阴影和模糊效果要控制复杂度，优先保证 Android 真机流畅。

#### 技术实现建议

建议将相册项从单封面扩展为多封面：

```ts
interface VisibleAlbumItem {
  id: string;
  title: string;
  assetCount: number;
  coverUri: string | null;
  coverUris?: string[];
}
```

可新增组件：

- `src/components/albums/AlbumMosaicCard.tsx`
- `src/components/albums/AlbumMosaicPreview.tsx`

#### 可能修改文件

| 文件 | 说明 |
|---|---|
| `app/albums.tsx` | 页面布局、数据拉取数量、渲染结构 |
| `src/utils/album-utils.ts` | `VisibleAlbumItem` 支持多张封面 |
| `src/components/albums/*` | 新增拼贴相册组件 |
| `src/design-tokens.ts` | 如需补充 tile / badge 样式 token |

#### 非目标范围

- 不把相册页改成月份页。
- 不新增真实搜索功能，除非后续单独立项。
- 不改变相册选择后的照片池逻辑。
- 不改变免费用户每日限制。
- 不引入远程图片或上传照片。

#### 验收标准

- [ ] 相册选择页视觉升级为拼贴式 mosaic / bento 布局。
- [ ] 每个相册仍代表一个系统相册或 `所有照片`，不按月份分组。
- [ ] 相册顺序与当前逻辑一致：`所有照片` 优先，其余按照片数量降序。
- [ ] 点击相册后仍能正确设置 `selectedAlbum` 并返回首页。
- [ ] 相册照片数量显示清晰。
- [ ] 单图、少图、缩略图读取失败场景均有稳定降级 UI。
- [ ] 大量相册时页面滚动流畅，无明显卡顿。
- [ ] 小屏设备上拼贴、标题和数量 badge 不重叠。
- [ ] `npx.cmd tsc --noEmit` 通过。
- [ ] `npx.cmd jest --runInBand` 通过。

---

### REQ-13：App Logo / Icon 升级为 Picked Cards 品牌图标

#### 背景

当前 App 已完成 v2.0 主色统一，但 Logo / Icon 仍需要进一步贴合产品核心交互与新视觉语言。用户已选择评审页 `1. Picked Cards` 方向：用多张照片卡片堆叠表现“滑动整理照片”，用主色卡片和完成圆点表达“清理完成”。

#### 目标

将 App Logo / Icon 升级为 Picked Cards 方向，并同步到应用图标相关资源，使启动器图标、应用内品牌露出和构建配置保持一致。

#### 视觉方向

Logo 应包含以下核心元素：

- 深色圆角背景，贴合当前 App 暗色体系。
- 3 张错落堆叠的圆角照片卡片，呼应首页滑动整理。
- 中间或主卡片使用主色 `#A8D46F`。
- 右下角或视觉焦点处使用小圆点 / 完成标记，暗示整理完成。
- 可少量使用粉紫 `#F0A6FF` 作为高光，但不能抢过主色。
- 图标在小尺寸下仍能识别为“卡片堆叠”，不要依赖细小文字。

#### 资产范围

| 资源 | 要求 |
|---|---|
| `assets/icon.png` | 1024x1024 主图标 |
| `assets/adaptive-icon.png` | Android adaptive icon 前景资源 |
| `assets/favicon.png` | Web / fallback 图标，可由主图标降采样 |
| `assets/splash-icon.png` | 若当前 native splash 仍使用图标，应同步或确认是否保持旧图 |
| App 内品牌图形 | 如关于页或开屏动画使用静态 logo，应保持视觉一致 |

#### Android / iOS 适配规则

- Android adaptive icon 需要考虑安全区，关键卡片不要贴边。
- iOS 图标不要内置过大圆角遮罩，系统会自动裁切。
- 图标背景不能透明。
- 小尺寸预览下，主卡片和完成圆点仍可辨认。
- 不在图标中放置 `PickUp` 或其他文字。

#### 技术实现要求

- 可先使用 HTML / SVG / Canvas 生成高分辨率 PNG，再落到 `assets/`。
- 输出资源需避免压缩导致边缘锯齿。
- `app.config.js` 中图标路径应继续指向正确资源。
- 如替换 native 资源，需要重新构建 Android 包验证启动器图标。

#### 可能修改文件

| 文件 | 说明 |
|---|---|
| `assets/icon.png` | 主图标 |
| `assets/adaptive-icon.png` | Android adaptive icon |
| `assets/favicon.png` | Web / fallback 图标 |
| `assets/splash-icon.png` | 视最终策略决定是否同步 |
| `app.config.js` | 确认图标路径配置 |
| `README.md` | 如文档展示当前 logo，可同步更新 |

#### 验收标准

- [ ] App 图标采用 Picked Cards 方向。
- [ ] 主色使用 `#A8D46F`，并与当前 v2.0 视觉体系一致。
- [ ] 图标在 1024px、180px、48px 尺寸下均清晰可辨。
- [ ] Android adaptive icon 关键图形未被系统裁切。
- [ ] App 启动器图标、构建配置和资源文件一致。
- [ ] 不出现旧 Logo 资源误用。
- [ ] 本地 Android dev 或 release 构建后能看到新图标。

---

### 本轮追加需求影响范围

| 文件 | REQ-11 | REQ-12 | REQ-13 |
|---|---:|---:|---:|
| `app/albums.tsx` | | ✓ | |
| `src/utils/album-utils.ts` | | ✓ | |
| `src/components/albums/*` | | ✓ | |
| `src/types/photo.ts` | ✓ | | |
| `src/hooks/usePhotoEngine.ts` | ✓ | | |
| `src/services/photo-service.ts` | ✓ | | |
| `src/components/photo-card/PhotoCard.tsx` | ✓ | | |
| `src/components/delete-review/PhotoZoomModal.tsx` | ✓ | | |
| `src/components/delete-review/PhotoDetailSheet.tsx` | ✓ | | |
| `src/components/ui/*` | ✓ | | |
| `assets/icon.png` | | | ✓ |
| `assets/adaptive-icon.png` | | | ✓ |
| `assets/favicon.png` | | | ✓ |
| `assets/splash-icon.png` | | | ✓ |
| `app.config.js` | | | ✓ |

### 本轮追加需求验收总清单

- [ ] Live Photo 可识别、展示 iOS 风格 Live 图标并点击播放。
- [ ] Android Motion Photo 候选识别、内嵌 MP4 提取和播放降级都有测试覆盖。
- [ ] Live Photo 动态资源不可用时有稳定降级提示。
- [ ] 相册选择页采用拼贴式 UI。
- [ ] 相册选择页仍按当前系统相册逻辑展示，不按月份分组。
- [ ] 选择相册后的整理流程与当前版本一致。
- [ ] App Logo / Icon 采用 Picked Cards 方向并同步到图标资源。
- [ ] Android 真机完成相册选择、Live Photo 降级/播放、启动器图标回归。
- [ ] iOS 环境完成 Live Photo 播放回归。
- [ ] `npx.cmd tsc --noEmit` 通过。
- [ ] `npx.cmd jest --runInBand` 通过。
