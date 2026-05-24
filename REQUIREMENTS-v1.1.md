# 拾遗 产品需求文档

---

# v1.1 — UI 现代化与交互优化

> 版本：v1.1 | 日期：2026-05-22 | 状态：待开发

## 概述

基于 v1.0 MVP 的用户反馈，本次迭代聚焦于 UI 现代化、交互体验优化和功能完善。共包含 12 项改进需求。

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
- 新建 `src/components/SplashScreen.tsx` — 开屏动画组件

---

## v1.1 需求优先级

| 优先级 | 需求编号   | 说明                     |
| --- | ------ | ------------------------ |
| P0  | REQ-07 | APK 名称，一行改动，立即生效      |
| P0  | REQ-03 | 文案替换，极简改动              |
| P0  | REQ-04 | 移除多余提示，极简改动            |
| P1  | REQ-02 | 字体调整，单行改动              |
| P1  | REQ-06 | 简化删除流程，显著提升体验          |
| P1  | REQ-01 | 图标现代化，视觉升级             |
| P1  | REQ-10 | 开发者模式，方便测试与演示          |
| P1  | REQ-11 | 免费限额 20→3，提升转化          |
| P1  | REQ-12 | 开屏启动页，品牌感提升            |
| P2  | REQ-05 | 手势引导，参考国际大厂            |
| P2  | REQ-08 | 照片比例切换，锦上添花            |
| P2  | REQ-09 | 快捷删除，涉及较多模块联动          |

---

## v1.1 影响范围

| 文件                        | REQ-01 | REQ-02 | REQ-03 | REQ-04 | REQ-05 | REQ-06 | REQ-07 | REQ-08 | REQ-09 | REQ-10 | REQ-11 | REQ-12 |
| ------------------------- | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| `app.json`                |        |        |        |        |        |        | ✓      |        |        |        |        |        |
| `app/_layout.tsx`         | ✓      |        |        |        |        |        |        |        |        |        |        | ✓      |
| `app/index.tsx`           |        |        |        |        | ✓      |        |        |        | ✓      |        |        |        |
| `app/settings.tsx`        |        |        |        |        |        |        |        |        |        | ✓      |        |        |
| `app/review.tsx`          |        |        |        |        |        | ✓      |        |        |        |        |        |        |
| `PhotoCard.tsx`           |        | ✓      |        |        |        |        |        | ✓      |        |        |        |        |
| `ActionIndicator.tsx`     |        |        | ✓      | ✓      |        |        |        |        |        |        |        |        |
| `GestureGuideOverlay.tsx` |        |        | ✓      |        | ✓      |        |        |        |        |        |        |        |
| `QuickDeleteButton.tsx`   |        |        |        |        |        |        |        |        | ✓ (新建) |        |        |        |
| `SplashScreen.tsx`        |        |        |        |        |        |        |        |        |        |        |        | ✓ (新建) |
| `usePhotoEngine.ts`       |        |        |        |        |        |        |        |        | ✓      |        |        |        |
| `PhotoContext.tsx`        |        |        |        |        |        |        |        |        | ✓      |        |        |        |
| `SubscriptionContext.tsx` |        |        |        |        |        |        |        |        |        | ✓      |        |        |
| `design-tokens.ts`         |        |        |        |        |        |        |        |        |        |        | ✓      |        |
| `LimitReachedModal.tsx`   |        |        |        |        |        |        |        |        |        |        | ✓      |        |
| `DeleteConfirmSheet.tsx`  |        |        |        |        |        | ✓      |        |        |        |        |        |        |

---

## v1.1 验收标准

1. Tab 栏图标为 MaterialCommunityIcons 现代扁平风格，不再显示 Emoji
2. 照片日期字体从 17px 增大至 21px
3. 上滑时顶部显示黄色药丸"断舍"标签
4. 左滑时不再出现"跳过"文字提示，仅靠手势触发；右滑保留"上一张"提示
5. 全新安装后首次启动展示四方向手势引导教程，再次打开不再展示
6. Review 页面点击删除按钮直接执行删除，不再弹出二次确认弹窗
7. 安装包名/桌面显示名称为"拾遗"
8. 照片左上角可手动切换 cover/contain 显示模式
9. 右上角垃圾桶按钮实时显示已标记数量（红色角标），点击直接删除并自动补齐照片
10. 设置页面底部空白区域点击 5 次进入开发者模式（自动 Pro），再点 5 次关闭（恢复普通账户）
11. 免费用户每日限额为 3 组，Pro 用户无限
12. 启动时展示黑底艺术字"PICKUP"+ "整理你的生活"开屏页，首次启动后自动衔接新手引导

---

# v1.2 — 交互打磨与流程优化

> 版本：v1.2 | 日期：2026-05-23 | 状态：待开发

## 概述

基于 v1.1 需求评审后的补充优化，聚焦于细节打磨、交互反馈完善和删除流程的进一步优化。共包含 5 项改进需求。

---

## 需求清单

### REQ-01 照片指示器圆点缩小

**现状**：浏览照片界面下方白色指示器圆点（显示当前照片在组内位置）尺寸偏大，显得粗糙。

**目标**：缩小圆点尺寸，使其更精致小巧，与整体暗黑主题设计语言协调。

**实现要点**：

- 缩小当前照片指示圆点（active dot）的直径，建议从当前的约 10-12px 缩小至 6-8px
- 缩小非活跃圆点（inactive dot）的直径，建议从约 8px 缩小至 4-5px
- 圆点之间的间距相应微调，保持视觉平衡
- 颜色保持不变：活跃圆点白色/亮色，非活跃圆点半透明灰色

**涉及文件**：`src/components/gesture/SwipeableCard.tsx`（或指示器所在组件，需确认具体位置）

---

### REQ-02 待删除照片圆点变色 + 下滑撤回

**现状**：上滑标记照片后，仅右上角垃圾桶计数更新，照片指示器圆点无视觉变化；用户无法在中途查看已标记的照片并撤回。

**目标**：照片被标记为待删除后，其对应的索引圆点变为黄色；用户可以点击进入该照片详情查看，再通过下滑手势从待删除列表中撤回该照片，右上角垃圾桶红点计数同步减少。

**实现要点**：

- **圆点变色**：
  - 当某张照片被上滑标记为待删除时，该照片在指示器中的对应圆点颜色从默认灰色变为黄色 `#F5C542`
  - 照片被撤回后，圆点恢复为默认灰色
  - 活跃圆点（当前查看的照片）如果被标记，优先显示黄色
- **查看已标记照片**：用户可通过滑动到该照片或点击圆点跳转到该照片
- **下滑撤回**：在已标记的照片上执行下滑手势，将其从 `markedForDelete` 集合中移除
  - 撤回时显示"已撤回"提示（绿色或白色半透明标签）
  - 右上角垃圾桶红点计数 -1
  - 该照片对应圆点恢复默认色
- **撤回动画**：照片卡片轻微缩放回弹，增强操作反馈

**涉及文件**：
- `src/components/gesture/SwipeableCard.tsx` — 圆点颜色逻辑
- `src/components/gesture/ActionIndicator.tsx` — 下滑撤回文字提示（如"已撤回"）
- `app/index.tsx` — markedForDelete 状态联动

---

### REQ-03 Tab 栏优化：纯图标无文字 + 个人中心图标

**现状**：底部 Tab 栏包含中文文字标签（"照片"、"设置"），右侧设置图标使用齿轮风格。

**目标**：

1. **移除文字标签**：Tab 栏仅显示图标，去掉"照片"和"设置"中文文字，整体更加简洁现代
2. **设置图标替换为个人中心图标**：将右侧齿轮/设置图标替换为人像/个人中心风格图标，参考阿里巴巴矢量图库（iconfont）选取合适的简约加粗线条图标

**图标选取参考**（阿里巴巴矢量图库 iconfont.cn 风格）：
- **浏览 Tab**：使用"浏览/图片"类图标，如 `image` / `images-mode` / `picture` 线框风格
- **个人中心 Tab**：使用"人像/用户"类图标，如 `user` / `profile` / `account` 简约加粗线条风格，参考 MaterialCommunityIcons 的 `account-circle-outline` 或 `account` 系列
- **线条风格**：图标线条加粗（stroke 2-3px），圆角端点，风格统一

**实现要点**：

- 在 `app/_layout.tsx` 的 `tabBarOptions` 中设置 `tabBarShowLabel: false` 移除文字
- 将设置 Tab 的 `tabBarIcon` 从齿轮图标改为个人中心图标
- 检查图标库是否支持所需图标，如不支持可考虑使用自定义 SVG 或 `@expo/vector-icons` 中搜索类似风格
- Tab 栏高度可能因移除文字而略微降低，调整 `tabBarStyle` 中的 `height` 和 `paddingBottom` 保持合适的触控区域

**涉及文件**：`app/_layout.tsx`

---

### REQ-04 删除确认页：照片勾选/取消勾选交互

**现状**：一组照片浏览完毕后进入 Review 页面，所有待删除照片直接展示在网格中，用户无法取消对某张照片的选中。只能整体确认删除或返回。

**目标**：在 Review 页面的确认删除照片列表中，每张照片右上角显示红色勾号（✓）表示已被选中待删除。用户可以点击照片取消勾选——勾号消失，该照片不再被删除。删除时仅删除仍然勾选的照片。如果用户取消了全部照片的勾选，右下角的删除按钮变为灰色禁用状态。

**实现要点**：

- **红色勾号标记**：
  - 每张照片缩略图右上角叠加一个红色圆形勾号图标（`check` / `checkbox-marked`）
  - 勾号底色为红色 `#FF3B30`，圆形直径约 24-28px，勾号为白色
  - 勾号位于缩略图右上角，略微超出边缘（`position: absolute, top: -4, right: -4` 或类似布局）
- **点击取消勾选**：
  - 用户点击某张照片 → 该照片取消勾选，红色勾号消失
  - 再次点击同一张照片 → 重新勾选，红色勾号恢复
  - 使用 `useState` 管理已勾选照片的 Set（初始值 = `markedForDelete` 集合）
- **删除按钮状态联动**：
  - 当已勾选照片数量 > 0 → 删除按钮正常显示，文案如"删除 N 张"
  - 当已勾选照片数量 = 0 → 删除按钮变为灰色 `#8E8E93`，禁用点击
  - 取消全部勾选后，左侧按钮仍可点击（REQ-05）
- **删除动作**：仅删除勾选的照片（而非原 `markedForDelete` 全集）

**涉及文件**：
- `app/review.tsx` — 核心交互逻辑改造
- `src/components/delete-review/` — 可能需要新建或修改缩略图卡片组件（如 `ReviewPhotoCard.tsx`）

---

### REQ-05 Review 页底部按钮调整

**现状**：Review 页面底部左侧按钮为"返回"（或其他文案），右侧按钮为"删除 N 张"。

**目标**：

1. **左侧按钮**：文案改为"放弃，再来一组"，点击后放弃当前组的所有待删除标记，直接切换到下一组新照片（不删除任何照片）
2. **右侧按钮**：保持不变，仍为"删除 N 张"，点击后删除已勾选的照片（见 REQ-04）

**实现要点**：

- **左侧按钮"放弃，再来一组"**：
  - 点击后清空当前 `markedForDelete` 集合
  - 生成全新的一组 10 张照片替换当前组
  - 导航回到浏览页面，index 重置为 0
  - 按钮样式可为中性色（灰色或白色边框），表示"取消/跳过"语义
- **右侧按钮保持不变**：文案"删除 N 张"（N = 当前已勾选数量），红色主题按钮
- **按钮禁用逻辑**：
  - 如果 N = 0（全部取消勾选），右侧按钮变为灰色禁用
  - 左侧按钮始终可点击

**涉及文件**：`app/review.tsx`

---

## v1.2 需求优先级

| 优先级 | 需求编号  | 说明                          |
| --- | ----- | ----------------------------- |
| P0  | REQ-03 | Tab 栏纯图标 + 个人中心，品牌升级       |
| P0  | REQ-01 | 指示器圆点缩小，细节打磨               |
| P1  | REQ-02 | 待删除圆点变色 + 下滑撤回，核心交互完善     |
| P1  | REQ-04 | 删除确认页勾选/取消，核心交互完善         |
| P1  | REQ-05 | Review 底部按钮调整，流程优化         |

---

## v1.2 影响范围

| 文件                        | REQ-01 | REQ-02 | REQ-03 | REQ-04 | REQ-05 |
| ------------------------- | ------ | ------ | ------ | ------ | ------ |
| `app/_layout.tsx`         |        |        | ✓      |        |        |
| `app/index.tsx`           |        | ✓      |        |        |        |
| `app/review.tsx`          |        |        |        | ✓      | ✓      |
| `ActionIndicator.tsx`     |        | ✓      |        |        |        |
| `SwipeableCard.tsx`       | ✓      | ✓      |        |        |        |
| `QuickDeleteButton.tsx`   |        | ✓      |        |        |        |
| `ReviewPhotoCard.tsx`     |        |        |        | ✓ (新建) |        |

---

## v1.2 验收标准

1. 照片指示器圆点缩小至精致尺寸（活跃 6-8px，非活跃 4-5px）
2. 标记待删除的照片对应圆点变为黄色；下滑已标记照片可撤回，垃圾桶红点同步减少
3. Tab 栏仅显示图标无文字，右侧为个人中心图标（简约加粗线条风格）
4. Review 页面每张照片右上角显示红色勾号，点击可取消/重新勾选；全部取消后删除按钮变灰禁用
5. Review 页面左侧按钮为"放弃，再来一组"，点击直接换组；右侧"删除 N 张"仅删除已勾选照片

---

# v1.3 — 删除确认升级与 Tab 栏 Touch Bar 改造

> 版本：v1.3 | 日期：2026-05-23 | 状态：待开发

## 概述

基于 v1.2 迭代后的用户反馈，本次迭代聚焦于删除确认流程的视觉升级、稳定性修复，以及底部导航栏的现代化改造。共包含 4 项改进需求。

---

## 需求清单

### REQ-01 快捷删除确认弹框 UI 改造（毛玻璃效果）

**现状**：点击浏览页右上角垃圾桶（QuickDeleteButton）后，当前代码直接调用 `deletePhotos()` 执行删除，无二次确认环节；或旧版弹框 UI 简陋、文案含"拒绝"字样，与整体设计语言不协调。

**目标**：在点击垃圾桶后弹出确认弹框，弹框采用毛玻璃视觉效果，次按钮文案统一为"取消"，整体风格与现代暗黑主题统一。

**实现要点**：

- **弹框触发**：在 `handleQuickDelete` 执行前增加确认弹框环节，点击垃圾桶 → 弹框显示 → 用户点击"删除"才执行真实删除
- **毛玻璃背景**：
  - 弹框整体背景使用半透明黑色遮罩 `rgba(0,0,0,0.4)`
  - 弹框内容卡片使用 `expo-blur` 的 `BlurView`（或自定义等效方案）实现高斯模糊毛玻璃效果
  - 卡片背景色：`rgba(28,28,30,0.75)`，配合 blur 强度 `intensity: 40-60`
- **卡片样式**：居中显示，圆角 `borderRadius: 24`，宽度约为屏幕宽度的 75-80%，内部 padding 充足
- **文案统一**：
  - 标题：`确认删除`
  - 说明：`将删除 N 张照片，删除后可在系统「最近删除」中恢复（30 天内）`
  - 主按钮：`删除 N 张`（红色背景 `#FF3B30`，白色文字）
  - 次按钮：`取消`（无边框/透明背景，白色或灰色文字，**绝对不能出现"拒绝"字样**）
- **动画效果**：弹框显示时遮罩淡入（opacity 0→1，300ms），卡片轻微缩放（scale 0.9→1.0）+ 淡入；关闭时反向
- **状态管理**：在 `app/index.tsx` 中新增 `showDeleteConfirm` 状态控制弹框显隐，删除中状态 `quickDeleting` 仍由弹框主按钮消费

**涉及文件**：
- `app/index.tsx` — 引入弹框组件，管理显隐状态，连接删除逻辑
- `src/components/delete-review/DeleteConfirmSheet.tsx` — 重写 UI（或新建 `DeleteConfirmModal.tsx`）

---

### REQ-02 修复删除按钮不弹框 Bug

**现状**：用户在浏览完一组照片后（或浏览中途），点击右上角垃圾桶删除按钮，**有时候没有任何反应**，既不弹出确认弹框，也不执行删除，仿佛按钮失效。

**目标**：定位并修复导致删除按钮偶发失效的 Bug，确保每次点击都能稳定弹出确认弹框（REQ-01）。

**实现要点**：

- **根因排查方向 1 — 集合不同步**：
  - `handleQuickDelete` 依赖的 `markedForDelete` 和 `currentGroup` 可能在 `refillGroup` 或 `loadNextGroup` 后发生不同步（如已标记照片的 ID 不在当前组中）
  - 修复：在 `handleQuickDelete` 最开头重新计算实际可删除的照片列表（`currentGroup.filter(p => markedForDelete.has(p.id))`），若结果为空则给出 Toast 提示"暂无待删除照片"，而非直接 return
- **根因排查方向 2 — 状态锁死**：
  - `quickDeleting` 状态若在异常分支（如 `deletePhotos` 抛错）未被重置，会导致按钮永久 disabled
  - 当前代码已有 `try/finally`，需确认 `finally` 确实执行；若 `deletePhotos` 外部抛错未进入 try，则需在外层再加 guard
  - 修复：确保 `setQuickDeleting(false)` 在任何代码路径下都被执行，可使用 `try/catch/finally` 包裹全部异步逻辑
- **根因排查方向 3 — 弹框状态被意外重置**：
  - 若 `showDeleteConfirm` 状态因 `useEffect` 或父组件重渲染被意外设为 false，弹框会闪显即消失
  - 修复：弹框显隐状态使用独立 `useState`，避免与其他会频繁变化的 state 耦合
- **兜底处理**：按钮 onPress 中增加 `console.warn` 或 Toast，当 `markedForDelete.size === 0` 时提示用户，帮助定位问题

**涉及文件**：
- `app/index.tsx` — `handleQuickDelete` 逻辑修复
- `src/components/gesture/QuickDeleteButton.tsx` — 增加异常提示

---

### REQ-03 Tab 栏 Touch Bar 风格改造（毛玻璃动态效果）

**现状**：底部 Tab 栏为全宽黑色背景（`backgroundColor: '#0D0D0D'`），两个图标分散在左右两端，视觉风格普通，缺乏现代感。

**目标**：将 Tab 栏图标居中聚集在一个类似 **macOS Touch Bar** 的浮动胶囊区域中，赋予毛玻璃动态效果，提升整体品牌质感。

**实现要点**：

- **Tab 栏背景透明化**：
  - `tabBarStyle` 中 `backgroundColor` 改为 `'transparent'`
  - 去除顶部边框 `borderTopWidth: 0` 或 `borderTopColor: 'transparent'`
  - `elevation: 0`（Android 去阴影）
- **浮动胶囊容器**：
  - 在 Tab 栏底部居中放置一个浮动的圆角胶囊容器
  - 尺寸：高度约 56-64px，宽度根据图标数量自适应（内容 + 左右 padding 各约 24-32px）
  - 圆角：`borderRadius: 32`（半圆形胶囊）
  - 位置：底部居中，`bottom: 20-28px`（需适配 iPhone Home Indicator 和 Android 导航栏）
  - 阴影：`shadowColor: '#000'`, `shadowOffset: { width: 0, height: 4 }`, `shadowOpacity: 0.3`, `shadowRadius: 12`
- **毛玻璃效果**：
  - 胶囊背景使用 `BlurView`（`expo-blur`）+ 半透明深色底色 `rgba(20,20,20,0.65)`
  - Blur intensity 建议 40-60
  - 可选：胶囊外边框添加 1px 极细白色半透明边线 `rgba(255,255,255,0.08)`，增强玻璃质感
- **图标排列**：
  - 图标在胶囊内水平等距排列，flex row，`justifyContent: 'center'`, `alignItems: 'center'`
  - 图标间距约 36-48px
  - 图标尺寸保持 24-26px
- **选中动画**：
  - 选中图标：颜色 `#FFCC00` + 轻微放大动画（`scale: 1.0 → 1.15`，spring 动画，200ms）
  - 未选中图标：颜色 `#8E8E93`
  - 可选：选中图标下方增加一个极小的黄色圆点指示器（直径 4px），强化选中状态
- **安全区适配**：
  - 胶囊底部需要加上 `SafeAreaView` 的 inset bottom 或使用 `useSafeAreaInsets`

**涉及文件**：`app/_layout.tsx`

**参考视觉**：macOS Touch Bar / iOS 控制中心 / 微信浮窗风格的半透明胶囊

---

### REQ-04 新增聚合图标（趣味功能扩展入口）

**现状**：底部 Tab 栏仅有"浏览"（图片）和"个人"（账户）两个入口，功能单一，缺乏扩展空间。

**目标**：在两个图标中间新增一个**聚合/更多**图标，作为后续趣味功能（如照片故事、AI 整理、趣味回忆等）的统一入口。

**实现要点**：

**图标选取**（阿里巴巴矢量图库 iconfont.cn 方向）：
- 搜索关键词：`应用中心`、`聚合`、`魔方`、`九宫格`、`功能模块`、`更多`
- 推荐风格：简约加粗线条（stroke 2px+），圆角端点，线框风格
- 候选图标语义：
  - 四宫格 / 九宫格（apps / grid）
  - 魔方 / 骰子（趣味感）
  - 拼图 / 积木（组合感）
  - 星系 / 原子（聚合感）
- 最终选取需保证与现有 `MaterialCommunityIcons` 的 `image-multiple-outline` 和 `account-outline` 风格协调
- 若 `@expo/vector-icons` 中有足够接近的图标（如 `apps`、`grid-outline`、`dots-grid`），可优先使用；否则引入自定义 SVG

**特殊样式**：
- 中间图标尺寸可略大于两侧（26-28px vs 24px）
- 可选：中间图标外圈增加一个 40px 的圆形高亮背景（`rgba(255,204,0,0.12)`），使其在胶囊中更突出

**页面占位**：
- 新建路由文件 `app/hub.tsx`
- 页面内容暂时为占位：居中显示一个较大的聚合风格图标 + "更多功能" 标题 + "敬请期待" 副标题
- 背景色继承 `#0D0D0D`

**路由配置**：
- 在 `app/_layout.tsx` 的 `Tabs` 中新增一个 `Tabs.Screen`
- `name: 'hub'`
- `options.href: '/hub'`
- `tabBarIcon` 使用选取的聚合图标
- 三个 Tab 在 Touch Bar 胶囊中的顺序：浏览 → **聚合** → 个人

**涉及文件**：
- `app/_layout.tsx` — Tab 配置
- `app/hub.tsx` — 新建占位页面

---

## v1.3 需求优先级

| 优先级 | 需求编号 | 说明                              |
| ------ | -------- | --------------------------------- |
| P0     | REQ-02   | Bug 修复，删除按钮失效问题优先解决  |
| P0     | REQ-01   | 删除确认弹框UI改造，安全流程必需    |
| P1     | REQ-03   | Tab 栏 Touch Bar 改造，视觉升级     |
| P1     | REQ-04   | 聚合图标入口，为后续功能预留扩展位  |

---

## v1.3 影响范围

| 文件                             | REQ-01 | REQ-02 | REQ-03 | REQ-04 |
| -------------------------------- | ------ | ------ | ------ | ------ |
| `app/index.tsx`                  | ✓      | ✓      |        |        |
| `app/_layout.tsx`                |        |        | ✓      | ✓      |
| `app/hub.tsx`                    |        |        |        | ✓ (新建) |
| `DeleteConfirmSheet.tsx`         | ✓      |        |        |        |
| `QuickDeleteButton.tsx`          |        | ✓      |        |        |

---

## v1.3 验收标准

1. 点击右上角垃圾桶后弹出确认弹框，弹框具有毛玻璃视觉效果（半透明 + blur），按钮文案为"删除 N 张"和"取消"，无"拒绝"字样
2. 删除按钮在各种场景下（一组滑完、中途点击、标记后快速点击）都能稳定弹出确认弹框，不再出现点击无反应的情况
3. 底部 Tab 栏变为透明背景，图标居中聚集在一个浮动毛玻璃胶囊中，胶囊有圆角、阴影和可选发光边框，选中图标有放大动画
4. Tab 栏中间新增聚合图标，点击进入占位页面"更多功能 · 敬请期待"，图标风格与现有图标统一

---

## 附录：聚合图标 iconfont 搜索建议

在阿里巴巴矢量图库（https://www.iconfont.cn）搜索以下关键词，选取线框/简约风格：
- `apps`、`grid`、`widget`、`menu`（应用中心/网格）
- `cube`、`puzzle`、`dice`（魔方/拼图/骰子，趣味感）
- `more`、`category`、`all`（更多/分类）

筛选条件：单色、线框风格、stroke 较粗（2px 以上）、圆角端点。

---

# v1.4 — 首页重构与细节打磨

> 版本：v1.4 | 日期：2026-05-24 | 状态：待开发

## 概述

基于 v1.3 完成后的新一轮反馈，本次迭代涉及首页架构重构（照片浏览降为二级页面、新增相册选择首页）、Hub 页柱状图、多处 UI 细节修复。共包含 7 项改进需求。

---

## 需求清单

### REQ-01 首页重构：相册选择 + 照片浏览降为二级页面

**现状**：启动后直接进入照片浏览页（`index.tsx`），所有照片混在一起滑动整理。

**目标**：重构首页为相册选择页——用户进来先看到相册列表，选择某个相册后进入该相册的照片浏览/整理流程。照片浏览页降为二级页面。

**实现要点**：

- **相册选择首页**（新 `index.tsx` 或 `albums.tsx`）：
  - 一行展示 3 组相册，grid 布局（3 列）
  - 每张相册卡片包含：相册封面缩略图（取相册第一张照片）+ 相册名称 + 照片数量
  - 封面缩略图使用 `MediaLibrary.getAlbumsAsync()` 获取相册列表，配合 `getAssetsAsync({ album: albumId, first: 1 })` 取封面
  - 卡片样式：圆角（约 12-16px），封面撑满卡片，名称和数量在封面下方或叠加在底部半透明区域
  - 至少包含"所有照片"、"相机胶卷"等系统相册
- **照片浏览页**（原 `index.tsx` → 新路由如 `browse.tsx` 或 `album/[id].tsx`）：
  - 接收相册 ID 参数，仅加载该相册内的照片
  - 其他交互逻辑（滑动、标记、删除等）保持不变
- **返回按钮**：照片浏览页左上角加返回箭头，点击回到相册选择首页

**涉及文件**：
- `app/index.tsx` → 重写为相册选择首页
- `app/album/[id].tsx` 或 `app/browse.tsx` → 原照片浏览逻辑迁移
- `src/hooks/usePhotoEngine.ts` → 新增按相册加载的方法

---

### REQ-02 照片日期字体缩小 + 居中 + 防溢出

**现状**：PhotoCard 组件中日期显示在顶部，字体较大，布局可能溢出或与周边元素冲突。

**目标**：缩小日期字体，居中放置，合理布局确保不会超长溢出。

**实现要点**：

- **字体缩小**：日期字号从当前值缩小 2-4px（建议 13-14px）
- **居中对齐**：日期文字水平居中显示
- **防溢出**：添加 `numberOfLines={1}` + `ellipsizeMode="tail"` 防止超长文本溢出
- **容器约束**：日期容器设置 `maxWidth` 或 `paddingHorizontal`，确保不会撑破卡片边界

**涉及文件**：`src/components/photo-card/PhotoCard.tsx`

---

### REQ-03 Hub 页面：月度照片数量柱状图

**现状**：Hub 页（`app/hub.tsx`）为占位页面，显示"更多功能 · 敬请期待"。

**目标**：用柱状图展示各月份的照片数量分布，丰富 Hub 页功能性。

**实现要点**：

- **数据来源**：遍历 `MediaLibrary.getAssetsAsync()` 获取所有照片的 `creationTime`，按月份聚合统计
- **图表实现**：
  - 使用纯 React Native 绘制（View 组合的柱状图），不引入第三方图表库（避免增加包体积）
  - 每个柱子代表一个月份，高度按当月照片数比例缩放
  - 柱子顶部或内部显示具体数字
  - X 轴标注月份（如"1月"、"2月"...），Y 轴标注数量
- **视觉效果**：
  - 柱子使用主题黄色 `#FFCC00` 渐变或纯色，配合深色背景
  - 圆角顶部（`borderRadius`），柱间距均匀
  - 支持横向滚动（当月份较多时）
- **当前月份高亮**：当前所在月份的柱子使用更亮的颜色或增加边框高亮

**涉及文件**：
- `app/hub.tsx` — 重写为月度柱状图页面
- 新建 `src/components/hub/MonthlyChart.tsx` — 柱状图组件

---

### REQ-04 Review 页左上角返回按钮

**现状**：Review 页（`app/review.tsx`）无返回按钮，用户只能通过底部按钮操作。

**目标**：左上角增加一个返回箭头按钮，点击后返回到相册选择首页（配合 REQ-01）。

**实现要点**：

- **位置**：页面左上角，绝对定位，避开安全区顶部
- **样式**：圆形半透明黑底 + 白色箭头图标（`MaterialCommunityIcons` 的 `arrow-left` 或 `chevron-left`）
- **行为**：`router.back()` 或 `router.replace('/')` 返回首页
- **层级**：`zIndex` 确保按钮浮在照片网格上方

**涉及文件**：`app/review.tsx`

---

### REQ-05 修复"释放空间"显示 0B Bug

**现状**：设置页（`app/settings.tsx`）中"释放空间"统计始终显示为 0B，即使已删除了照片。

**目标**：修复统计逻辑，正确显示已删除照片累计释放的空间大小。

**根因排查方向**：
- `stats-service.ts` 中 `recordDeleted` 是否正确累加文件大小？
- `MediaLibrary.getAssetInfoAsync()` 获取单张照片文件大小的方式在 SDK 54 中是否可用？（之前发现 `FileSystem.getInfoAsync` 已被弃用）
- 统计持久化是否正确（AsyncStorage 读写是否正常）？
- `StatsContext` 是否正确暴露和使用？

**修复思路**：
- 删除前用 `expo-file-system` 新版 `File` 类获取文件大小：`new File(uri).size`
- 或使用 `MediaLibrary.getAssetsAsync` 配合 `MediaLibrary.getAssetInfoAsync` 获取文件大小
- 确保累加值正确写入 AsyncStorage 并正确读取展示

**涉及文件**：
- `src/services/stats-service.ts`
- `src/services/delete-service.ts`
- `src/contexts/StatsContext.tsx`
- `app/settings.tsx`

---

### REQ-06 Review 页右下角详情按钮

**现状**：Review 页面仅展示照片网格，用户无法查看某张照片的详细信息（拍摄时间、尺寸、文件大小、位置等）。

**目标**：右下角添加一个详情按钮，点击后弹出照片详情信息面板。

**实现要点**：

- **按钮位置**：页面右下角，浮动按钮，与左上角返回按钮对称
- **按钮样式**：圆形半透明黑底 + 信息图标（`MaterialCommunityIcons` 的 `information-outline` 或 `dots-horizontal`）
- **详情面板**：
  - 从底部滑出（Bottom Sheet 风格），半屏高度
  - 显示信息：拍摄时间、照片尺寸（宽×高）、文件大小、文件路径、ISO/光圈/快门（如果 EXIF 可用）
  - 使用 `MediaLibrary.getAssetInfoAsync()` 获取详细信息
  - 面板背景使用毛玻璃或深色半透明
- **交互**：点击按钮弹出面板，下滑或点击遮罩关闭

**涉及文件**：
- `app/review.tsx` — 添加详情按钮和面板
- 新建 `src/components/delete-review/PhotoDetailSheet.tsx` — 照片详情底部面板

---

### REQ-07 Tab 图标选中变黄

**现状**：底部 Tab 栏图标在选中时已设置为金色 `#FFCC00`，但用户反馈实际运行中未正确显示（可能因 `useNavigationState` 状态追踪有延迟或偏差）。

**目标**：确保点击 Tab 图标后，被选中图标立即变为主题黄色 `#FFCC00`，未选中保持灰色 `#8E8E93`，与设计令牌 `Tokens.color.accent` 保持一致。

**实现要点**：

- **状态同步**：检查 `SimpleTabBar` 中 `currentRoute` 的 `useNavigationState` selector 是否正确响应路由变化
- **容错处理**：若 `useNavigationState` 返回 undefined 或异常值，回退到 `state.index` 判断
- **颜色引用**：硬编码颜色值改为引用 `Tokens.color.accent` / `Tokens.color.textMuted`，确保全局统一
- **验证**：切换 Tab 时确认图标颜色瞬时变化（无延迟或闪烁）

**涉及文件**：`app/_layout.tsx` — `SimpleTabBar` 组件

---

## v1.4 需求优先级

| 优先级 | 需求编号 | 说明 |
| ------ | -------- | ---- |
| P0     | REQ-05   | Bug 修复，释放空间 0B 问题影响用户信任 |
| P0     | REQ-01   | 首页重构，架构级变更，影响所有后续功能 |
| P0     | REQ-07   | Tab 图标选中色，基础交互体验 |
| P1     | REQ-02   | 日期字体缩小居中，UI 细节打磨 |
| P1     | REQ-04   | Review 返回按钮，配合新首页架构 |
| P1     | REQ-06   | 照片详情信息，增强功能完整性 |
| P2     | REQ-03   | Hub 柱状图，独立功能模块 |

---

## v1.4 影响范围

| 文件 | REQ-01 | REQ-02 | REQ-03 | REQ-04 | REQ-05 | REQ-06 | REQ-07 |
| ---- | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| `app/index.tsx` | ✓ (重写) | | | | | | |
| `app/_layout.tsx` | ✓ (路由) | | | | | | ✓ |
| `app/browse.tsx` 或 `app/album/[id].tsx` | ✓ (新建/迁移) | | | | | | |
| `app/review.tsx` | | | | ✓ | | ✓ | |
| `app/hub.tsx` | | | ✓ (重写) | | | | |
| `app/settings.tsx` | | | | | ✓ | | |
| `MonthlyChart.tsx` | | | ✓ (新建) | | | | |
| `PhotoDetailSheet.tsx` | | | | | | ✓ (新建) | |
| `PhotoCard.tsx` | | ✓ | | | | | |
| `usePhotoEngine.ts` | ✓ | | | | | | |
| `stats-service.ts` | | | | | ✓ | | |
| `delete-service.ts` | | | | | ✓ | | |
| `StatsContext.tsx` | | | | | ✓ | | |

---

## v1.4 验收标准

1. 启动后进入相册选择首页，一行 3 列展示相册卡片（封面缩略图 + 名称 + 数量），点击进入该相册照片浏览页
2. 照片日期字体缩小至 13-14px，居中显示，超长文本截断不出界
3. Hub 页展示月度照片数量柱状图，柱高按比例，显示数字，当前月份高亮
4. Review 页左上角有返回箭头按钮，点击返回相册首页
5. 设置页"释放空间"正确显示已删除照片累计文件大小，不再固定为 0B
6. Review 页右下角有详情按钮，点击弹出照片详细信息面板（时间、尺寸、大小等）
7. 底部 Tab 图标选中时立即变为金色 `#FFCC00`，未选中为灰色，与主题一致

---

# v1.6 — 滑动体验优化与功能增强

> 版本：v1.6 | 日期：2026-05-24 | 状态：待开发

## 概述

基于 v1.4/v1.5 完成后的新一轮反馈，聚焦滑动交互体验优化（仅照片卡片滑动、去掉红色背景）、Hub 页年份筛选、Review 空状态卡通占位图、个人中心滑动特效设置、相册排序优化。共包含 5 项改进需求。

---

## 需求清单

### REQ-01 滑动效果优化：仅照片卡片滑动 + 去红背景

**现状**：上滑/下滑/左滑/右滑时整个页面跟随拖拽移动，上滑标记删除时背景出现大面积红色，视觉干扰严重。

**目标**：滑动交互仅作用于中间照片卡片本身，页面背景保持黑底不动；上滑时不再出现红色背景区域，仅通过卡片位移 + 指示器文字反馈操作意图。

**实现要点**：

- **卡片独立滑动**：`SwipeableCard` 的 PanResponder 手势仅驱动卡片自身的 translateX/translateY 动画，外层容器（页面背景、进度条、按钮等）保持静止不动
- **去除红色背景**：移除上滑时的红色蒙层/背景渲染（当前 `DeleteOverlay` 或 SwipeableCard 内的红色背景逻辑）
- **保留指示器**：上滑时仍显示"删除"文字指示器（ActionIndicator），但卡片后方背景保持纯黑 `#000000`
- **下滑/左滑/右滑**：同理仅卡片移动，背景不动
- **卡片动画参数**：
  - 平移范围：上下约 150-200px，左右约 100-120px
  - 旋转角度：轻微（±5°），跟随滑动方向
  - 透明度：滑出超过阈值后卡片渐隐（opacity→0）

**涉及文件**：
- `src/components/gesture/SwipeableCard.tsx` — 手势逻辑改造，卡片独立动画
- `src/components/gesture/DeleteOverlay.tsx` — 移除或弱化红色蒙层

---

### REQ-02 Hub 页年份筛选器

**现状**：Hub 页柱状图展示全量照片的 12 个月分布（所有年份汇总），无法按年份筛选查看。

**目标**：在柱状图下方增加年份选择按钮，点击后可切换年份，柱状图同步更新为对应年份各月照片数量。

**实现要点**：

- **年份按钮**：
  - 位置：柱状图下方约 20px 处，水平居中
  - 样式：胶囊形按钮，背景 `Tokens.color.surface`，圆角 20px，内边距 horizontal 20px / vertical 10px
  - 内容：年份数字（如"2026 年"）+ 右侧上下箭头图标（`chevron-up` / `chevron-down` 组合或 `unfold-more-horizontal`）
  - 箭头微动画：上下轻微浮动呼吸效果，暗示可展开选择
- **年份选择交互**：
  - 点击按钮弹出年份列表（Modal 或下拉菜单），展示所有有照片的年份
  - 选中某年后按钮文案更新，柱状图重新渲染
  - 默认选中当前年份
- **柱状图联动**：
  - `MonthlyChart` 接收 `data: MonthData[]`，由 hub.tsx 根据选中年份过滤
  - 过滤逻辑：遍历照片时将 `creationTime` 的年月分别提取，先按年筛选、再按月聚合
- **数据缓存**：首次加载全量数据后缓存按年+月分组的结果（`Record<number, Record<number, number>>`），切换年份时直接从缓存取，无需重新遍历照片

**涉及文件**：
- `app/hub.tsx` — 年份状态管理 + 缓存逻辑 + 选择器 UI
- `src/components/hub/MonthlyChart.tsx` — 不变（纯展示组件）

---

### REQ-03 Review 空状态卡通占位图

**现状**：Review 删除确认页如果没有待删除照片（photosInGroup.length === 0），无特殊处理，显示空白网格。

**目标**：当 Review 页无待删除照片时，展示卡通风格的插画占位图 + 友好提示文字，替代空白区域。

**实现要点**：

- **占位图风格**：卡通手绘风格，参考 Dribbble/Behance 上空状态插画趋势——简约线条 + 柔和配色 + 趣味角色/物体
  - 推荐方向：一个小幽灵举着相机👻📷、或一只猫扒在空相框上🐱、或一个空画框上飘着几片叶子🍃
  - 颜色：黄色 `#FFCC00` 为主色调点缀，灰白为辅
- **实现方式**：
  - 使用纯 SVG/React Native View 组合绘制（不依赖外部图片资源，避免加载失败）
  - 或使用 `MaterialCommunityIcons` 组合大图标 + 装饰元素
- **提示文字**：
  - 主标题："还没有待删除的照片"
  - 副标题："浏览照片时上滑标记，这里就会出现啦"
  - 字号：主标题 18px/600，副标题 13px/400
  - 颜色：主标题 `textPrimary`，副标题 `textMuted`
- **出现条件**：`photosInGroup.length === 0`（在 DeleteGrid 上方渲染）

**涉及文件**：
- `app/review.tsx` — 条件渲染空状态组件
- 新建 `src/components/delete-review/EmptyReviewPlaceholder.tsx` — 卡通占位图组件

---

### REQ-04 个人中心新增"滑动效果"设置

**现状**：设置页（`app/settings.tsx`）无滑动效果相关设置，用户只能使用默认的线性平移滑动体验。

**目标**：在设置页"帮助"区块上方新增"滑动效果"设置项，用户可以从中选择不同风格的照片滑动特效，选择后实时生效于浏览页的 SwipeableCard。

**实现要点**：

- **设置项位置**：设置页"统计"和"帮助"区块之间，作为新的 `SettingsSection("滑动效果")`
- **设置项样式**：
  - 点击进入一个子页面（`router.push('/swipe-settings')`）或展开内联选项列表
  - 推荐使用 `ActionSheet` 或底部弹出选择器（Bottom Sheet 风格），避免新建路由
- **滑动特效选项**：
  - **默认**：当前线性平移，跟随手指，松手回弹
  - **仿真**（推荐默认）：带物理惯性，手指离开后卡片继续滑动一段距离再回弹/飞出（使用 `withDecay` 动画）
  - **翻页**：上下滑动时卡片绕 X 轴 3D 翻转（`perspective` + `rotateX`），模拟翻书效果
  - **弹性**：卡片跟随手指但带有橡皮筋拉伸效果，拉得越远阻力越大
  - **平滑**：卡片跟随手指但动画帧率更高（useSharedValue + useAnimatedReanimated），滑动更顺滑
- **存储**：选择后写入 AsyncStorage `swipeEffect` 键，应用重启后保持
- **生效**：SwipeableCard 读取 AsyncStorage 中的设置，动态切换动画策略
- **实现架构**：
  - `src/services/preferences-service.ts`（新建）或直接在 SwipeableCard 中读取
  - 使用 Reanimated 4 的不同动画函数实现各特效

**涉及文件**：
- `app/settings.tsx` — 新增设置项入口
- 新建 `app/swipe-settings.tsx` — 滑动效果选择子页面（或内联 BottomSheet）
- `src/components/gesture/SwipeableCard.tsx` — 支持多种动画模式
- `src/services/preferences-service.ts` — 偏好设置持久化（如不存在则新建）

---

### REQ-05 相册选择页按照片数量排序

**现状**：相册选择页（`app/albums.tsx`）展示的相册列表无特定排序，按 `MediaLibrary.getAlbumsAsync()` 返回的默认顺序排列。

**目标**：将相册按包含的照片数量从多到少降序排列（"所有照片"始终置顶）。

**实现要点**：

- **排序逻辑**：
  - "所有照片"（`id === '__all__'`）始终排在第一位，不参与排序
  - 其余相册按 `assetCount` 降序排列：`albums.sort((a, b) => b.assetCount - a.assetCount)`
- **插入位置**：在 `setAlbums(items)` 之前排序
- **保持响应性**：排序在 `useEffect` 内完成，不引入额外状态

**涉及文件**：
- `app/albums.tsx` — 添加 sort 逻辑

---

## v1.6 需求优先级

| 优先级 | 需求编号 | 说明 |
| ------ | -------- | ---- |
| P0     | REQ-01   | 滑动体验核心优化，用户强烈反馈 |
| P0     | REQ-05   | 相册排序，一行改动，影响大 |
| P1     | REQ-02   | Hub 年份筛选，增强数据分析能力 |
| P1     | REQ-03   | Review 空状态占位，视觉体验优化 |
| P2     | REQ-04   | 滑动特效设置，锦上添花功能 |

---

## v1.6 影响范围

| 文件 | REQ-01 | REQ-02 | REQ-03 | REQ-04 | REQ-05 |
| ---- | ------ | ------ | ------ | ------ | ------ |
| `SwipeableCard.tsx` | ✓ (重写手势) | | | ✓ | |
| `DeleteOverlay.tsx` | ✓ | | | | |
| `app/hub.tsx` | | ✓ | | | |
| `app/review.tsx` | | | ✓ | | |
| `app/settings.tsx` | | | | ✓ | |
| `app/albums.tsx` | | | | | ✓ |
| `EmptyReviewPlaceholder.tsx` | | | ✓ (新建) | | |
| `swipe-settings.tsx` | | | | ✓ (新建) | |
| `preferences-service.ts` | | | | ✓ (新建) | |

---

## v1.6 验收标准

1. 浏览照片时上下左右滑动仅照片卡片移动，背景保持纯黑不动；上滑时无红色背景区域
2. Hub 柱状图下方有年份选择按钮，切换年份后柱状图展示对应年各月照片数；默认选中当前年份
3. Review 页无待删除照片时展示卡通风格插画 + "还没有待删除的照片" + 副标题，不再显示空白网格
4. 设置页新增"滑动效果"入口，可选默认/仿真/翻页/弹性/平滑等特效，选择后实时生效并持久化
5. 相册选择页按照片数量从多到少排序，"所有照片"始终置顶
