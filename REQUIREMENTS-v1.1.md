# 拾遗 v1.1 产品需求文档

> 版本：v1.1 | 日期：2026-05-22 | 状态：待开发

---

## 概述

基于 v1.0 MVP 的用户反馈，本次迭代聚焦于 UI 现代化、交互体验优化和功能完善。共包含 9 项改进需求。

---

## 需求清单

### REQ-01 图标风格现代化

**现状**：底部 Tab 栏使用 Emoji 字符（📷 浏览、⚙️ 设置）作为图标，视觉风格偏复古，与暗黑主题设计语言不协调。

**目标**：替换为现代扁平化图标。

**实现要点**：

- 使用 `@expo/vector-icons`（已内置在 Expo SDK 中）的 Ionicons 或 MaterialCommunityIcons 图标集
- 参考ui-ux-pro-max和frontend-design skill来寻找灵感
- 浏览 Tab：使用 `image-outline` 或 `images-outline` 风格图标
- 设置 Tab：使用 `settings-outline` 风格图标
- 图标尺寸与当前保持一致（约 24px），颜色继承 `tabBarActiveTintColor` / `tabBarInactiveTintColor`

**涉及文件**：`app/_layout.tsx`

---

### REQ-02 日期字体放大

**现状**：PhotoCard 组件中照片日期使用 `fontSize: 17`，用户反馈偏小。

**目标**：加大两号字体，提升可读性。

**实现要点**：

- 将 `PhotoCard.tsx` 中 date 样式的 `fontSize` 从 `17` 改为 `21`
- 检查 `liveBadge` 定位是否因字号变化而需要微调（当前 `top: 60` 与 date 同行，字号增大后可能需要略微调整）

**涉及文件**：`src/components/photo-card/PhotoCard.tsx`

---

### REQ-03 上滑提示词改为"断舍"

**现状**：上滑照片时，顶部出现"删除"红色文字提示。

**目标**：改为更富有文化意蕴的"断舍"（源自"断舍离"理念），减少用户面对"删除"二字时的心理负担。

**实现要点**：

- 修改 `ActionIndicator.tsx` 中 delete 指示器的文字内容：`删除` → `断舍`
- 同步更新 `GestureGuideOverlay.tsx` 中的手势引导文字（当前错误标注为"下滑删除"，需修正为"上滑断舍"）

**涉及文件**：

- `src/components/gesture/ActionIndicator.tsx`
- `src/components/gesture/GestureGuideOverlay.tsx`

---

### REQ-04 移除左滑"跳过"提示文字

**现状**：左滑照片时，左侧出现"跳过"文字提示。

**目标**：移除左滑时的文字提示，仅保留手势功能（左滑仍可跳到下一张），让界面更加简洁。

**实现要点**：

- 在 `ActionIndicator.tsx` 中移除 `skipLeftStyle` 对应的 `<Animated.View>` 及其文字"跳过"
- 保留右滑"上一张"的提示文字
- 左滑手势逻辑在 `SwipeableCard.tsx` 中保持不变，仅移除视觉文字指示

**注意**：需确认 `skipProgress` 是否还被其他组件共享使用。当前 `skipProgress` 由 `SwipeableCard` 传递，仅 `ActionIndicator` 消费，移除左滑文字后右滑文字仍需要它。

**涉及文件**：`src/components/gesture/ActionIndicator.tsx`

---

### REQ-05 首次启动手势引导教程

**现状**：项目中存在 `GestureGuideOverlay.tsx` 组件但未被引入使用，且其引导文字与实际手势含义相反（标注"上滑保留"实为删除，"下滑删除"实为保留）。

**目标**：在用户首次打开应用时，开屏结束后自动展示手势引导教程。参考 Apple HIG 和国际大厂最佳实践（Apple Tips、Google Photos 等），采用**情境化半透明遮罩 + 手势动画 + 可跳过**模式，而非传统的静态轮播引导页。

**参考规范**（Apple HIG & 2025 行业趋势）：
- **即时可用**：不强制用户看完多页引导，单屏展示核心手势，4 秒自动消失
- **情境化教学**：直接在真实浏览界面上叠加引导，而非跳转到独立引导页
- **可跳过**：点击任意处或等待 4 秒自动关闭
- **最小文字**：每个手势标注控制在 4 字以内
- **手势反馈**：引导动画使用脉冲缩放（仿 Apple 原生 Hint 动画），颜色编码区分操作类型

**实现要点**：

- **触发流程**：开屏动画结束 → 检查 AsyncStorage 中 `gestureGuideShown` 标记 → 不存在则展示引导
- **展示内容**（修正后的正确标注，与 REQ-03 一致）：
  - 上方：👆 上滑 → 黄色药丸"删除"
  - 下方：👇 下滑 → 白色半透药丸"保留"
  - 左侧：👈 → 无文字提示（REQ-04），仅箭头动画
  - 右侧：👉 → "上一张"
- **展示时长**：4 秒自动消失，点击任意处立即关闭
- **持久化**：关闭后写入 `gestureGuideShown: 'true'` 至 AsyncStorage
- **插入位置**：在 `app/index.tsx` 浏览界面中，于 `SwipeableCard` 上方渲染该遮罩

**涉及文件**：
- `src/components/gesture/GestureGuideOverlay.tsx`（需重写内容）
- `app/index.tsx`（引入并控制显示逻辑）

---

### REQ-12 开屏启动页

**现状**：应用启动时显示 Expo 默认白色闪屏（`splash-icon.png`），无品牌标识。

**目标**：新增黑底艺术字开屏页，居中展示"PICKUP"品牌英文 + 下方"整理你的生活"Slogan。开屏结束后自动进入主界面；若为首次启动，开屏结束后直接弹出新手引导（REQ-05）。

**实现要点**：

- **视觉设计**：
  - 纯黑背景 `#000000`
  - 居中大字"PICKUP"，使用衬线/艺术字体（如 Playfair Display, Bodoni, 或其他优雅衬线体），字重 700-900，字号约 42-48px，字母间距 6-8px
  - 下方约 24px 处，"整理你的生活" 使用中文细体/艺术字（如 Noto Serif SC 或系统衬线体），字号约 16-18px，字重 300-400，颜色 `#8E8E93` 或略微带黄
  - 整体居中，无其他装饰元素
- **动画**：
  - "PICKUP" 从透明度 0 → 1 + 轻微上浮（translateY: -8px），duration ~800ms，easing: ease-out
  - Slogan 延迟 200ms 后淡入，duration ~600ms
- **显示时长**：总展示约 2 秒（动画 1 秒 + 停留 1 秒），结束后自动过渡到主界面
- **实现方式**：使用 `expo-splash-screen` 的 `SplashScreen.preventAutoHideAsync()` 配合 Animated API 实现自定义过渡；或创建独立的 splash 路由页面
- **首次启动衔接**：开屏结束 → 检查 `gestureGuideShown` → 未展示则弹出 REQ-05 手势引导

**涉及文件**：
- `app/_layout.tsx` — 集成开屏逻辑
- 或新建 `src/components/SplashScreen.tsx` — 独立开屏组件

**涉及文件**：
- `app/_layout.tsx` — 集成开屏逻辑
- 新建 `src/components/SplashScreen.tsx` — 开屏动画组件

---

### REQ-06 删除确认流程简化

**现状**：用户在 Review 页面点击"删除 N 张"按钮后，会弹出 `DeleteConfirmSheet` 底部弹窗要求二次确认。用户认为 Review 页面本身就是确认环节，二次弹窗多余。

**目标**：移除二次确认弹窗，在 Review 页面点击删除按钮后直接执行删除操作。

**实现要点**：

- 在 `app/review.tsx` 中移除 `DeleteConfirmSheet` 组件的引用和渲染
- 将"删除 N 张"按钮的 `onPress` 从 `() => setShowConfirm(true)` 改为直接调用 `handleConfirmDelete`
- `handleConfirmDelete` 不再需要 `setShowConfirm(false)` 调用
- 删除 `showConfirm` 状态变量
- `DeleteConfirmSheet.tsx` 组件文件可保留（未来可能复用或直接删除）

**涉及文件**：

- `app/review.tsx`
- `src/components/delete-review/DeleteConfirmSheet.tsx`（可选删除）

---

### REQ-07 APK 名称改为中文"拾遗"

**现状**：`app.json` 中 `expo.name` 为 `"pickup"`，安装后桌面显示的应用名称为英文小写。

**目标**：桌面应用名称显示为中文"拾遗"。

**实现要点**：

- 修改 `app.json` 中 `expo.name` 字段：`"pickup"` → `"拾遗"`
- 可选：同步修改 `android.appName`（如未设置则默认使用 `expo.name`）
- 此修改在下次 `eas build` 后生效

**涉及文件**：`app.json`

---

### REQ-08 照片显示比例切换按钮

**现状**：PhotoCard 组件根据照片宽高比自动选择 `resizeMode`——宽高比 > 1.2 的照片使用 `contain`（原始比例），否则使用 `cover`（全屏填充）。用户无法手动切换。

**目标**：在照片左上角区域增加一个半透明切换按钮，允许用户在全屏填充（cover）和原始比例（contain）之间手动切换。

**实现要点**：

- **按钮位置**：照片左上角，在日期文字下方约 40-50px 处（`top: 100` 左右），左对齐
- **按钮样式**：半透明胶囊形（`rgba(0,0,0,0.5)`），图标 + 文字，尺寸适中
- **图标参考**：使用 `@expo/vector-icons` 中的缩放/适配图标（如 Ionicons `resize` 或 `expand-outline` / `contract-outline`）
- **交互行为**：
  - 默认状态：保持现有 `getResizeMode()` 行为
  - 点击按钮：切换为另一个模式（cover ↔ contain）
  - 切换后仅影响当前照片，切换到下一张时恢复默认行为
- **状态管理**：在 `PhotoCard` 组件内部使用 `useState` 管理当前显示模式

**涉及文件**：`src/components/photo-card/PhotoCard.tsx`

---

### REQ-09 快捷删除按钮（小鲨鱼/打印机风格）

**现状**：用户上滑标记照片后，必须等到当前 10 张全部浏览完毕，进入 Review 页面才能执行删除。流程较长，用户可能在浏览中途就想清理已标记的照片。

**目标**：在浏览界面右上角增加一个趣味风格的快捷删除按钮，实时显示已标记数量，支持随时一键删除。

**实现要点**：

**外观设计**：

- **位置**：照片右上角，与日期/LIVE 标识同行或略下方
- **风格**：卡通风格——类似小鲨鱼啃咬的动作动画，或卡通打印机造型
- **实现方式**：使用 Animated API 实现轻微呼吸/摆动动画（小鲨鱼牙齿开合或打印机吐纸效果），增加趣味性
- **视觉元素**：卡通图标 + 红色圆形计数徽章（类似消息角标）

**计数逻辑**：

- 每当用户上滑标记一张照片（`markedForDelete.size` 增加），按钮上的红色计数 +1
- 计数从标记集合 `markedForDelete` 的 size 实时读取

**删除逻辑**：

- 点击按钮 → 直接调用 `deletePhotos()` 删除所有已标记照片
- 删除成功后：
  1. 记录统计数据（`recordDeleted`）
  2. 清空 `markedForDelete` 集合
  3. 从 `allPhotos` 中移除已删除的照片
  4. 根据删除数量 N，从照片池中补充 N 张新照片至当前 group，使 group 保持 10 张
  5. 保持当前浏览位置不变（或自动跳转至合理位置）
- **无需二次确认**（与 REQ-06 保持一致的设计理念）

**按钮出现条件**：

- 仅当 `markedForDelete.size > 0` 时显示
- 标记数为 0 时隐藏（带动画过渡）

**涉及文件**：

- `src/components/gesture/` — 新建 `QuickDeleteButton.tsx` 组件
- `app/index.tsx` — 引入按钮，连接删除逻辑
- `src/hooks/usePhotoEngine.ts` — 新增 `refillGroup` 方法支持补齐照片
- `src/contexts/PhotoContext.tsx` — 暴露新方法

---

### REQ-10 开发者模式与 Pro 开关

**现状**：设置页面底部有隐藏的开发者工具入口（点击 5 次版本号区域可显示），但缺乏明确的交互反馈，且功能不完整。

**目标**：改为点击设置页面最下方空白区域 5 次切换开发者模式——开启后自动升级为 Pro 账户，标识变为 Pro；再点击 5 次关闭，恢复为普通账户。

**实现要点**：

- **触发区域**：设置页面最底部空白区域（版本号/标语文字 `拾遗 · 断舍之间，皆是风景` 所在区域）
- **触发方式**：连续点击 5 次（间隔不超过 2 秒，超时重置计数）
- **开启效果**：
  - Toast 提示"已进入开发者模式"
  - 自动将账户升级为 Pro（设置 SubscriptionContext 中的 isPro 状态）
  - 设置行中"当前方案"右侧显示黄色 `Pro` 标签（替代原来的"免费版"+"升级 Pro"组合）
  - 今日剩余显示为 `∞ 无限`
- **关闭效果**：
  - Toast 提示"已退出开发者模式"
  - 恢复为普通账户
  - "当前方案"恢复显示"免费版"+"升级 Pro"
  - 今日剩余恢复为实际计数 `N / 3 组`
- **状态持久化**：开发者模式状态写入 AsyncStorage `devModeEnabled`，应用重启后保持

**涉及文件**：
- `app/settings.tsx` — 添加点击计数逻辑和视觉反馈
- `src/contexts/SubscriptionContext.tsx` — 暴露手动设置 Pro 状态的方法

---

### REQ-11 免费用户每日限额调整

**现状**：免费用户每天可浏览 20 组照片（`design-tokens.ts` 中 `freeDailyLimit: 20`）。

**目标**：将免费用户每日限额从 20 组降低为 3 组，增强 Pro 订阅的转化动力。

**实现要点**：
- 修改 `src/design-tokens.ts` 中 `photo.freeDailyLimit` 从 `20` 改为 `3`
- 同步更新 `LimitReachedModal` 中的提示文案（如涉及具体数字）
- 确保开发者模式下不受此限制（Pro 账户无限）

**涉及文件**：
- `src/design-tokens.ts`
- `src/components/photo-card/LimitReachedModal.tsx`（如需要）

---

## 需求优先级

| 优先级 | 需求编号   | 说明               |
| --- | ------ | ---------------- |
| P0  | REQ-07 | APK 名称，一行改动，立即生效 |
| P0  | REQ-03 | 文案替换，极简改动        |
| P0  | REQ-04 | 移除多余提示，极简改动      |
| P1  | REQ-02 | 字体调整，单行改动        |
| P1  | REQ-06 | 简化删除流程，显著提升体验    |
| P1  | REQ-01 | 图标现代化，视觉升级       |
| P1  | REQ-10 | 开发者模式，方便测试与演示    |
| P1  | REQ-11 | 免费限额 20→3，提升转化    |
| P1  | REQ-12 | 开屏启动页，品牌感提升      |
| P2  | REQ-05 | 手势引导，参考国际大厂      |
| P2  | REQ-09 | 快捷删除，涉及较多模块联动    |

---

## 影响范围汇总

| 文件                        | REQ-01 | REQ-02 | REQ-03 | REQ-04 | REQ-05 | REQ-06 | REQ-07 | REQ-09 | REQ-10 | REQ-11 |
| ------------------------- | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| `app.json`                |        |        |        |        |        |        | ✓      |        |        |        |
| `app/_layout.tsx`         | ✓      |        |        |        |        |        |        |        |        |        |
| `app/index.tsx`           |        |        |        |        | ✓      |        |        | ✓      |        |        |
| `app/settings.tsx`        |        |        |        |        |        |        |        |        | ✓      |        |
| `app/review.tsx`          |        |        |        |        |        | ✓      |        |        |        |        |
| `PhotoCard.tsx`           |        | ✓      |        |        |        |        |        |        |        |        |
| `ActionIndicator.tsx`     |        |        | ✓      | ✓      |        |        |        |        |        |        |
| `GestureGuideOverlay.tsx` |        |        | ✓      |        | ✓      |        |        |        |        |        |
| `QuickDeleteButton.tsx`   |        |        |        |        |        |        |        | ✓ (新建) |        |        |
| `usePhotoEngine.ts`       |        |        |        |        |        |        |        | ✓      |        |        |
| `PhotoContext.tsx`        |        |        |        |        |        |        |        | ✓      |        |        |
| `SubscriptionContext.tsx` |        |        |        |        |        |        |        |        | ✓      |        |
| `design-tokens.ts`         |        |        |        |        |        |        |        |        |        | ✓      |
| `LimitReachedModal.tsx`   |        |        |        |        |        |        |        |        |        | ✓      |

---

## 验收标准

1. Tab 栏图标为 MaterialCommunityIcons 现代扁平风格，不再显示 Emoji
2. 照片日期字体从 17px 增大至 21px
3. 上滑时顶部显示黄色药丸"删除"标签
4. 左滑时不再出现"跳过"文字提示，仅靠手势触发；右滑保留"上一张"提示
5. 全新安装后首次启动展示四方向手势引导教程，再次打开不再展示
6. Review 页面点击删除按钮直接执行删除，不再弹出二次确认弹窗
7. 安装包名/桌面显示名称为"拾遗"
8. 照片以圆角卡片居中 contain 显示，不拉伸，不做比例切换
9. 右上角垃圾桶按钮实时显示已标记数量（红色角标），点击直接删除并自动补齐照片
10. 设置页面底部空白区域点击 5 次进入开发者模式（自动 Pro），再点 5 次关闭（恢复普通账户）
11. 免费用户每日限额为 3 组，Pro 用户无限
12. 启动时展示黑底艺术字"PICKUP"+ "整理你的生活"开屏页，首次启动后自动衔接新手引导
