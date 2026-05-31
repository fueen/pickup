# Memory Log

---

## 2026-05-31 22:xx | 项目进展-pickup

### 一句话概述

v1.3 趣味化功能与删除确认体验已完成：新增每周清理回顾、清理成就、自定义全屏删除确认页，并将回顾/成就移入个人中心“更多功能”区域。

### 当前进度 / 关键结论

- **删除确认体验**：`DeleteConfirmSheet` 已从普通弹窗改为全屏沉浸式确认页，右上角删除按钮和一组照片看完后的 review 页面都会先展示自定义确认页；点击 Delete 后才调用系统删除授权框。
- **系统删除弹框边界**：Android/iOS 删除系统相册原图时仍会触发系统授权弹框，样式不能自定义；当前方案是先用 App 自定义页建立预期，再进入系统授权。
- **待删除 review 页面**：旧的网格确认页已移除，进入 `/review` 后直接展示全屏确认页；“稍后删除”走放弃当前组/下一组逻辑，系统授权拒绝时保留页面可重试。
- **删除确认 UI 迭代**：根据反馈去掉顶部“拾忆”胶囊，修复副标题与堆叠照片重叠，缩小 Delete 与“稍后删除”按钮，让界面更精致。
- **每周清理回顾**：新增 `weekly-review-utils.ts` 与 `WeeklyReviewCard`，展示本周浏览、本周删除、连续天数和 7 日清理柱状概览。
- **清理成就**：新增 `achievement-utils.ts` 与 `AchievementStrip`，包含首次清理、删除入门、空间管理师、连续 3 天、相册守护者等徽章。
- **个人中心布局**：每周清理回顾和清理成就已从独立统计区移动到“更多功能”区域，位于“月份分析”入口卡片下方，形成“月份分析 -> 每周清理回顾 -> 清理成就”的信息层级。
- **统计卡颜色**：个人中心统计卡支持 `valueColor` / `tintColor`，最近删除、连续天数、释放空间分别使用醒目的红/绿/黄。
- **需求文档**：新增 `PRD-v1.3-趣味化与确认删除体验需求.md` 和 superpower 执行计划 `docs/superpowers/plans/2026-05-31-v1.3-fun-and-delete-confirm-plan.md`。

### 验证

- `npx.cmd tsc --noEmit` 通过。
- `npx.cmd jest --runInBand` 通过，当前 11 个 test suites / 55 个 tests 全部通过。
- 测试中仍有项目既有的 `react-test-renderer is deprecated` warning，不是本次改动引入。

### 关键文件

| 新增 | 修改 |
|------|------|
| `src/utils/weekly-review-utils.ts` | `app/settings.tsx` |
| `src/utils/achievement-utils.ts` | `app/index.tsx` |
| `src/utils/delete-confirm-utils.ts` | `app/review.tsx` |
| `src/components/settings/WeeklyReviewCard.tsx` | `src/components/delete-review/DeleteConfirmSheet.tsx` |
| `src/components/settings/AchievementStrip.tsx` | `src/components/settings/StatCard.tsx` |
| `__tests__/unit/weekly-review-utils.test.ts` | |
| `__tests__/unit/achievement-utils.test.ts` | |
| `__tests__/unit/delete-confirm-utils.test.ts` | |

### 下一步

- 本地 release APK 打包后安装到真机，重点检查：删除确认页在不同屏幕高度下是否不重叠、系统删除授权拒绝/允许后的状态、更多功能区横向成就列表滚动体验。
- 如后续准备上架 iOS，需要在真机确认 PhotoKit 删除授权弹框的实际链路文案。

---

## 2026-05-31 15:36 | v1.10 交互与最近删除状态记录

### 当前关键结论

- Codex Desktop / Windows App 当前检查结果：`26.519.11010.0`，Microsoft Store / winget 未发现可用更新；Codex CLI 稳定版为 `@openai/codex@0.135.0`，仅有 `0.136.0-alpha.1` 预发布版更高。
- `AGENTS.md` 已调整为：使用项目已安装 Expo 版本和既有代码模式；只有任务依赖当前 Expo 行为/API 时才查 Expo 文档。
- 已读取 `README.md` 和 `memory.md` 熟悉项目：Expo SDK 54、React Native 0.81.5、expo-router 6，PickUp 是照片清理 app。

### v1.10 已落地功能

- 需求文档：
  - 已追加 v1.10 到 `PRD-v1.2-功能优化需求.md`。
  - 已同步更新 `docs/PRD-v1.2.html`，覆盖 v1.2 到 v1.10。
  - 计划文件：`docs/superpowers/plans/2026-05-31-v1.10-review-tab-restore-plan.md`。
- Review 照片页：
  - `PhotoZoomModal.tsx` 支持进入时重置缩放状态，并更新提示为查看细节。
  - `ActionIndicator.tsx` / `SwipeableCard.tsx` 已去掉左滑时的“上一张”文字提示。
- 最近删除服务：
  - `delete-service.ts` 删除前会缓存缩略图到 `Paths.cache/deleted-thumbnails/`。
  - `stats-service.ts` 维护 `recentDeletes` 记录，`getValidRecentDeletes()` 当前只校验缓存缩略图文件是否存在。
  - 注意：不要用 `MediaLibrary.getAssetInfoAsync(originalAssetId)` 判断最近删除是否有效。刚删除后原 asset 会从普通媒体库移走，这会把刚删除的照片误判为无效，导致个人中心最近删除数量变 0。
- 最近删除页面：
  - `app/recent-deletes.tsx` 当前只展示缩略图列表和数量，不再支持点击选中、长按详情、还原操作栏。
  - 用户后续又明确：个人中心里的“最近删除”卡片只展示数量，不应该跳转。当前 `app/settings.tsx` 已移除该卡片的 `onPress`。
- 个人中心最近删除数量：
  - `app/settings.tsx` 使用 `useFocusEffect` 调用 `getValidRecentDeletes()`，进入个人中心时刷新有效最近删除数量。
  - 该数字不是累计删除总数 `totalDeleted`，而是当前 app 最近删除记录的有效数量。
- 底部 tab 胶囊：
  - `app/_layout.tsx` 当前隐藏 recent-deletes 页的 tab 胶囊。
  - 胶囊背景改为纯 RN 半透明层，移除 `BlurView`。
  - 图标逻辑按用户要求处理：底层图标始终 `#FFFFFF`，选中态额外叠加一枚金色 `Tokens.color.accent` 图标；无选中圆圈、无按压透明。

### 测试状态

- 最近一次验证：
  - `npx.cmd tsc --noEmit` 通过。
  - `npx.cmd jest --runInBand` 通过，8 个 suites / 47 个 tests。
  - 测试仍有既有 `react-test-renderer is deprecated` warning，不影响通过。

### 当前需注意

- 如果用户再次要求“系统相册彻底删除后不要展示”，Expo MediaLibrary 当前没有可靠直接查询系统“最近删除”相册的接口；仅用原始 asset id 查询会误伤刚删除记录。
- 当前实现的可靠边界是：app 删除时保存记录和缓存缩略图；缓存还在则计入最近删除，缓存没了则过滤。
- 当前工作区有多处历史/本轮改动，未做 git commit。不要随意 revert 用户或历史生成的变更。

## 2026-05-21 20:10 | 项目进展-pickup

### 一句话概述

拾遗 App Android 开发构建成功，save-memory 技能创建完成。

### 当前进度 / 关键结论

- Plan 审计完成：原 15 个 task 中 4 项缺失（E2E test, stats-service test, Modal, GestureGuideOverlay），已全部补齐
- 权限崩溃修复：expo-media-library 在 Expo Go 中不可用，必须用 development build
- EAS 构建配置：eas.json 配好 development/preview/production 三个 profile
- 构建 #1-#3 均失败，根因是 react-native-reanimated v4 强制要求 newArchEnabled: true
- 构建 #4 成功，APK 已生成 (192MB，开发包正常体积)
- save-memory 用户技能已创建，用于记录会话上下文到 memory.md

### 下一步

- 在 Android 手机上安装 APK 并测试基本功能
- 验证媒体库权限、照片浏览、标记删除/保留、撤销等核心流程
- 后续如需分发：Android 免费 APK 分发，iOS 需 $99/年 Apple Developer

---

## 2026-05-21 22:45 | 项目进展-pickup

### 一句话概述

修复了滑动抽搐、黑屏、无限循环等关键 Bug，优化手势交互体验，推送代码到 GitHub。

### 当前进度 / 关键结论

- **滑动抽搐修复**：withSpring → withTiming，消除欠阻尼振荡
- **黑屏根因**：advanceToNext 闭包过期，currentGroup.length 不在依赖数组，导致 groupIndex 越界后 handleMarkDelete 提前 return，卡片停留在屏幕外
- **无限循环修复**：review.tsx useEffect 因 loadNextWithLimit 依赖变化反复触发，加 autoNavRef 守卫
- **导航错误修复**：router.back() 在 Expo Tabs 中不可靠，全部改为 router.replace('/')
- **水平滑动优化**：用比率判断 (absTX > absTY * 1.2) 替代严格 isVertical 判断，斜向滑动不再误触发
- **删除文字不显示**：ActionIndicator 插值范围从 [-0.8,-0.4] 改为 [-0.5,0]，触发阈值处可见度从 0% 提升到 ~80%
- **新功能**：底部进度条圆点可点击跳转、左滑跳过/右滑上一张、零删除直接跳下一组不弹确认页
- **其他调整**：每组 15→10 张、隐藏开发者模式提示文字、README 已写、代码已推送到 github.com/fueen/pickup

### 下一步

- 预览构建 c4ca434e 完成后下载 APK 安装测试
- 后续可考虑：照片元数据显示、相册分类、iCloud 照片支持

---

## 2026-05-23 00:53 | 项目进展-pickup

### 一句话概述

完成多项 UI/UX 需求改动，修复多个 JS 层 Bug，并定位修复了困扰已久的 Android 原生崩溃 `getDirectConverter`。

### 需求改动

- **动态包名配置**：`app.config.js` 替代 `app.json`，通过 `EAS_BUILD_PROFILE` 区分三套包名/应用名（dev/preview/prod），实现同一设备并存安装不覆盖
- **首次启动手势引导**：新增 `GestureGuideOverlay` 组件，首次进入时展示上下左右滑动操作说明（上删除/下保留/左跳过/右上一张），4 秒自动消失或点击关闭
- **批量删除按钮**：新增 `QuickDeleteButton` 组件，浮动在浏览页右下角，显示已标记删除数量，一键批量删除
- **SplashScreen 启动页**：新增带动画的启动页，标题+标语渐入效果，替代默认白屏
- **PhotoCard 卡片重设计**：圆角卡片布局（borderRadius: 24），日期头部、LIVE 标识，整体视觉升级
- **ActionIndicator 重设计**：胶囊样式指示器，"删除"/"保留"/"跳过" 文字标签，清晰的颜色区分
- **水平滑动优化**：左滑跳过、右滑上一张，用比率判断（absTX > absTY * 1.2）替代严格 isVertical 判断，斜向滑动不误触发
- **底部进度条增强**：圆点可点击跳转到对应位置
- **review 页优化**：零删除时直接跳过确认页进入下一组

### Bug 修复

- **`getDirectConverter` 原生崩溃**：`expo-font@56.0.5`（SDK 56+ 版本）不兼容 SDK 54，其原生代码调用 `ReturnTypeKt.getDirectConverter()` 方法在 `expo-modules-core@3.0.30` 中不存在。修复：`npx expo install expo-font` → 正确版本 `14.0.11`，消除重复依赖
- **`@expo/vector-icons` 异常**：旧 APK 未包含该原生模块，因 package.json 在构建后修改。替换为 emoji 临时方案，重建后恢复矢量图标（MaterialCommunityIcons）
- **`refillGroup` 崩溃风险**：`generateRandomGroup()` 无候选照片时抛异常，外层未捕获。修复：包裹 try/catch 静默跳过
- **`handleQuickDelete` UI 锁定**：异步操作失败时 `setQuickDeleting(false)` 不执行。修复：try/finally 确保状态重置
- **`advanceToNext` 闭包过期**：使用旧 `currentGroup.length` 导致 groupIndex 越界、卡片黑屏。修复：接受 `justMarkedDelete` 参数刷新引用
- **无限重渲染循环**：review.tsx `useEffect` 依赖 `loadNextWithLimit` 变化反复触发。修复：加 `autoNavRef` 守卫
- **`GestureGuideOverlay` useEffect 缺依赖**：修复：补全 `onDismiss, overlayOpacity` 依赖数组

### 设计/配置调整

- `freeDailyLimit` 20 → 3，降低免费用户每日使用上限
- `accent` 颜色 `#FFCC00`（黑+黄设计系统）
- 每组照片 15 → 10 张
- `newArchEnabled: true`（reanimated v4 强制要求）
- Android `edgeToEdgeEnabled: false`，`predictiveBackGestureEnabled: false`

### 重要教训

- 添加 Expo 包务必用 `npx expo install <pkg>`，不能用 `npm install`，否则版本不匹配引发难以调试的原生崩溃
- EAS 构建日志里的 duplicate/missing peer dependency 警告是崩溃的直接线索，不能忽略

### 下一步

- Dev build `b0849955` 和 Preview build `af36e61f` 完成后下载测试，验证 getDirectConverter 崩溃是否已修复
- Dev build 成功后，用 `npx expo start --dev-client` + Metro 热加载实现快速迭代

---

## 2026-05-23 15:10 | 项目进展-pickup

### 一句话概述

v1.0.1 Bug 修复 + UI 打磨完成，README 架构文档更新，Android preview 构建提交中。

### Bug 修复

- **日限制重启失效**：`dailyUsageLoaded` 只在 SubscriptionContext 内部使用未导出 → `loadPhotos()` 在日用量加载前就执行。修复：导出 `dailyUsageLoaded`，在 `index.tsx` 中 gate `loadPhotos()` 等待日用量加载完成。
- **权限弹窗闪屏**：每次重启都短暂弹出权限页。根因：`permissionStatus` 初始化为 `'undetermined'`，挂载时未查询真实权限。修复：`usePhotoEngine` 挂载时调用 `getPermissionsAsync()`（不弹系统对话框）同步真实权限状态。
- **日限制时 Loading 死循环**：`isLoading` 初始为 `true`，日限制到达后 `loadPhotos()` 不执行 → `isLoading` 永不变成 `false`。修复：调整渲染顺序，先检查 `canBrowseNextGroup`，再检查 `isLoading`。
- **进度条圆点着色错位**：标记第 N 张删除，圆点从第 1 个开始变黄。根因：用计数而非索引。修复：传递 `Set<number>`（索引集合）给 GroupProgressBar，每个圆点独立判断 `deleteIndices.has(i)`。
- **删除确认页预勾选失效**：React 状态批处理竞态，`setMarkedForDelete` + `router.push` 可能让 review 页先挂载再收到 context 更新。修复：`review.tsx` 加 `useEffect` 监听 `markedForDelete` 变化同步 `selectedIds`。

### UI 打磨

- **照片原比例展示**：`getDisplaySize()` 根据 `photo.width / photo.height` 计算展示尺寸，`resizeMode="cover"` + `borderRadius: 24`
- **相对日期**：去掉时:分，改为"2024年3月15日 · X天前/昨天/今天"
- **进度条位置下调**：底部 50→34，去掉 "1/10" 文字计数器
- **卡片间距收紧**：CARD_TOP 148→80，CARD_BOTTOM 240→76

### 构建与工程

- **版本**：1.0.0 → 1.0.1
- **Preview 名称**："拾遗 Preview" → "PickUp"
- **Metro 压缩**：`transformer.minifierConfig` 配置 `pure_funcs` 去掉 console.log/info/debug
- **iOS plist**：添加 `ITSAppUsesNonExemptEncryption: false` 消除构建警告
- **README 重写**：覆盖完整架构、Provider 嵌套层级、数据流、渲染优先级、构建配置

### 重要教训

- `index.tsx` 渲染检查顺序至关重要：权限 → 日用量 → 限制 → 加载 → 空相册，错一个就出 bug
- Metro `blockList` 只对 JS 模块生效，不能用于移除 asset 文件（如图标字体 TTF）
- `getPermissionsAsync()` 不弹对话框也能获取真实权限状态，是解决权限闪屏的关键

### 下一步

- Android preview 构建 `c0c0e38f` 完成（当前在 EAS 上构建中，已运行约 1.5h）
- 下载 APK 安装测试 v1.0.1 全部修复

---

## 2026-05-23 18:00 | 新需求记录-pickup

### 一句话概述

用户提出 4 个新改动点，已整理为 v1.3 需求文档。

### 新需求清单

1. **删除确认弹框UI改造**：QuickDeleteButton 点击后弹出确认弹框，次按钮文案统一为"取消"（替换"拒绝"），弹框整体采用毛玻璃（BlurView）效果 + 圆角卡片 + 淡入淡出动画
2. **修复不弹框Bug**：一组滑完后点击删除按钮有时无反应，需排查 `markedForDelete` 与 `currentGroup` 同步竞态及 `quickDeleting` 状态异常
3. **Tab栏Touch Bar改造**：底部 Tab 栏背景透明，图标居中聚在一个浮动胶囊区域中，胶囊采用毛玻璃半透明效果 + 轻微发光边框 + 选中放大动画
4. **新增聚合图标**：在浏览和个人图标中间新增一个聚合/更多入口，图标从阿里巴巴矢量图库选取（如 apps / grid / widgets / dice 风格），占位页面"更多功能 · 敬请期待"

### 当前决策

- v1.3 需求文档已追加到 REQUIREMENTS-v1.1.md 末尾
- 聚合页路由暂定为 `app/hub.tsx`，图标候选待从 iconfont.cn 确认

---

## 2026-05-24 01:20 | 项目进展-pickup

### 一句话概述
深入探索绕过 Android 系统删除弹框方案，经历 SDK 54 弃用 API、MANAGE_EXTERNAL_STORAGE 权限、FileSystem 直接删除等多轮尝试，最终结论不可行，回退到系统弹框方案并提交 preview 构建。

### 技术探索过程
- **方案 A（MANAGE_EXTERNAL_STORAGE）**：在 `app.config.js` 添加权限，用 `FileSystem.deleteAsync(localUri)` 直接删文件。发现 `getAssetsAsync` 返回的 Asset 不含 `localUri`（只有 AssetInfo 有），需额外调 `getAssetInfoAsync`
- **SDK 54 弃用坑**：`FileSystem.deleteAsync` 和 `getInfoAsync` 在 SDK 54 已弃用且直接 throw，需改用新 `File`/`Directory` 类（`new File(uri).delete()`、`new File(uri).exists`）
- **最终失败**：即使 `localUri` 有正确的 `file:///` 路径、MANAGE_EXTERNAL_STORAGE 已开启，`new File().delete()` 仍被系统 rejected
- **根本原因**：Android 11+ Scoped Storage 对共享存储的文件删除有 OS 级保护，换 SDK/框架/语言均无法绕过

### 当前方案
- **Android**：`MediaLibrary.deleteAssetsAsync` → 系统弹框确认（一次），UI 上直接触发删除，不弹自定义确认框
- **iOS**：自定义毛玻璃 `DeleteConfirmSheet` → `MediaLibrary.deleteAssetsAsync`（无系统弹框）
- 平台分支：`Platform.OS === 'android'` 直接调 delete 函数，`!== 'android'` 先弹自定义确认框

### 清理内容
- 移除 `MANAGE_EXTERNAL_STORAGE` 权限
- 移除 `PhotoAsset.localUri` 字段及相关赋值逻辑
- 移除 `delete-service.ts` 中所有 FileSystem/File 相关代码，精简为纯 MediaLibrary
- 移除 `openManageStorageSettings`、`needsManageStorage` 等临时逻辑
- `delete-service.ts` 不再依赖 `expo-file-system`

### 构建状态
- EAS preview build（Android）已提交，正在排队构建

### 下一步
- 等待 preview APK 构建完成，下载安装测试
- 确认 Android 只弹一次系统确认框，iOS 弹自定义毛玻璃弹框
- 后续如需优化：可考虑 Android 14+ 用 RecoverableSecurityException 改善流程

---

## 2026-05-24 16:30 | 项目进展-pickup

### 一句话概述

修复 Tab bar 图标左偏 + 幽灵点击区域 Bug，最终方案：隐藏默认 tab bar + 独立 SimpleTabBar 组件。

### 当前进度 / 关键结论

- **Bug 根因**：使用 `tabBar` prop 自定义 TabBar 时，默认 tab bar 仍会在底层渲染，导致两套 tab bar 叠加——自定义的图标左偏，默认的触摸区域仍可点击
- **尝试过的失败方案**：调整 iconsRow 的 flex/justifyContent、去掉胶囊矩形框、去掉自定义 TabBar 用默认 tab bar、绝对定位 —— 均未解决
- **最终方案**：
  - `tabBarStyle: { display: 'none' }` 彻底隐藏默认 tab bar
  - `SimpleTabBar` 作为 `<Tabs>` 的兄弟组件独立渲染，用 `expo-router` 的 `useRouter().navigate()` 导航
  - 用 `useNavigationState` 追踪当前路由实现选中高亮
  - 纯黑背景 (`#000`)，图标居中 (`justifyContent: 'center'`)，间距 4px (`gap: 4`)，选中金色/未选中灰色
- **不再使用** `src/components/ui/TabBar.tsx`（已被内联 `SimpleTabBar` 替代）
- 已提交推送 `b50fa72`

### 下一步

- 后续如需恢复 TabBar 动画效果（缩放、毛玻璃），在 SimpleTabBar 基础上迭代

---

## 2026-05-24 17:30 | 项目进展-pickup

### 一句话概述

完成 v1.4-v1.6 多轮迭代——首页架构重构、Hub 柱状图年份筛选、滑动交互优化、Review 页打磨、品牌改名 PickUp、新 LOGO 设计、本地构建环境搭建。

### v1.4 完成项

- **首页相册选择**：index.tsx 浏览页默认，albums.tsx 二级相册页（2列大方形缩略图，按数量降序）
- **PhotoContext 新增 selectedAlbum**：跨 Tab 共享当前相册状态
- **浏览页左上角 layers 图标**：点击进入相册选择
- **Hub 月度柱状图**：纯 RN 实现，12 个月份 yellow 柱体
- **Review 按钮**：左上返回 + 右下信息（后移到浏览页）
- **释放空间 0B 修复**：`expo-file-system` File 类获取大小
- **日期字体**：14px 居中防溢出

### v1.5 改动

- 浏览页回归默认首页（index.tsx），相册选择变二级（albums.tsx）
- 删除 browse.tsx，流程简化为 index ↔ albums ↔ review

### v1.6 改动

- **滑动优化**：卡片独立移动，去红背景，日期固定顶部不跟随滑动
- **Hub 年份筛选**：缓存 yearlyData，Modal 选择年份，柱状图联动
- **Review 空状态**：EmptyReviewPlaceholder 卡通幽灵占位图
- **滑动特效设置**：default/smooth 等 5 种，AsyncStorage 持久化
- **Review 缩略图**：180px，maxHeight 580 限 6 张滚动
- **Tab 栏**：usePathname 替代 useNavigationState 修复深层链接冲突

### 品牌改动

- App 内文案：拾遗 → PickUp，标语：记忆由你选择
- 新 LOGO：堆叠滑出设计（3张卡片错位+金色边框），已生成 1024px PNG
- 图标文件：assets/icon.png 已替换

### 本地构建环境

- EAS 免费配额已用完（6月1日重置）
- **放弃 EAS，改用本地 Gradle**：`cd android && gradlew assembleDebug`
- **网络问题**：国内墙 Google，已配置阿里云/腾讯云/华为云镜像
  - `settings.gradle` pluginManagement + dependencyResolutionManagement
  - `build.gradle` buildscript + allprojects
  - `init.gradle` 全局注入
- **已安装**：Android SDK 36、NDK 27、Build-Tools 37
- **SDK 路径**：`C:/Users/Fueen/AppData/Local/Android/Sdk`
- **当前状态**：构建仍报错（exit 137 或依赖解析问题），待排查
- **备选方案**：GitHub Actions workflow 已配好（`.github/workflows/build-apk.yml`）

### 下一步

- 解决本地 Gradle 构建最后一步报错（可能是 Expo 模块本地 autolinking 问题）
- 或直接用 GitHub Actions 触发远程构建（绕过本地网络问题）
- 测试新图标在 APP 中的实际显示效果
- EAS 配额重置后可恢复到 EAS 构建流程

---

## 2026-05-25 22:30 | 项目进展-pickup

### 一句话概述

v1.2 功能优化全部完成 + 3 个用户反馈 Bug 修复，Release APK 本地构建成功并推送到 GitHub。

### v1.2 完成项（PRD-v1.2 4 个需求）

- **REQ-01 释放空间累计**：像素估算法 `Math.round(width * height * 3 * 0.4)` 作为 `new File(uri).size` 返回 0 或抛异常时的兜底
- **REQ-02 统计卡片改造**：中文 label `fontWeight: '700'`，"最近删除"卡片 `onPress` 跳转 `/recent-deletes`，cheveron-right 箭头
- **REQ-03 最近删除页**：`app/recent-deletes.tsx` 3 列网格，`useFocusEffect` 每次进入重新加载，图片加载失败显示 `image-off-outline` 占位图标
- **REQ-04 排序功能**：`SortMode = 'random' | 'sizeDesc' | 'timeNewest' | 'timeOldest'`，`generateGroup()` 重构支持 sortMode，`generateRandomGroup()` 保留为薄封装向后兼容

### Bug 修复（用户反馈）

- **最近删除空白页**：根因 `addRecentDeletes()` fire-and-forget + `useEffect([], ...)` 只加载一次。修复：`await addRecentDeletes()` + `useFocusEffect` 每次聚焦重新拉取
- **StatCard "已浏览"右偏**：根因 pressable/non-pressable 卡片 DOM 结构不一致（有无 `cardWrapper` 外层）。修复：无 onPress 时也用 `<View style={cardWrapper}>` 包裹
- **黑色缩略图**：已删除照片 URI 失效，`Image onError` 捕获 → 显示 `image-off-outline` 占位符

### UI 打磨

- **毛玻璃胶囊工具栏**：方案 A 落地，`rgba(0,0,0,0.45)` 半透明底 + `0.5px rgba(255,255,255,0.15)` 边框，图标+中文标签+红色计数角标
- **SortPickerSheet**：自定义底部弹出卡片替代 `Alert.alert`（Android 仅支持 3 按钮，4 选项会被截断），毛玻璃背景 + 滑入动画 + 图标+勾选高亮 + 点击空白关闭
- **QuickDeleteButton 重写**：圆形图标按钮 → 胶囊按钮（图标+"删除"文字+红色计数 badge）

### 构建

- **EAS 免费配额已用尽**（6月1日重置），本地 Gradle `assembleRelease` 成功
- **APK 路径**：`android/app/build/outputs/apk/release/app-release.apk`，106MB
- **Git push**：`2637361` master → origin/master，13 files changed

### 关键文件（本次涉及）

| 新增 | 修改 |
|------|------|
| `app/recent-deletes.tsx` | `app/index.tsx`, `app/settings.tsx` |
| `src/components/photo-card/SortPickerSheet.tsx` | `src/services/delete-service.ts`, `stats-service.ts`, `photo-service.ts` |
| `designs/toolbar-options.html` | `src/hooks/usePhotoEngine.ts`, `src/types/photo.ts` |
| | `src/components/gesture/QuickDeleteButton.tsx` |
| | `src/components/settings/StatCard.tsx` |
| | `__tests__/unit/photo-service.test.ts` |

### 下一步

- 安装 `app-release.apk` 到手机测试全部功能
- 排序切换、最近删除加载、删除后缩略图占位等场景验证
- EAS 配额 6/1 重置后可考虑 EAS 构建替代本地 Gradle

---

## 2026-05-27 22:20 | 项目进展-pickup

### 一句话概述

v1.7 全部需求实现 + 滑动动效增强 + 庆祝动画 + 新手引导重做 + release APK 打包完成。

### 当前进度 / 关键结论

- **v1.7 四项需求完成**：
  - REQ-01：QuickDeleteButton 去文字去胶囊框，仅图标+badge
  - REQ-02：日期文字移入 topBar flexbox，与排序/删除按钮严格水平对齐，恢复 LIVE badge
  - REQ-03：delete-service.ts 增加缓存逻辑，删除前复制照片到 `Paths.cache/deleted-thumbnails/`，最近删除页缩略图可见
  - REQ-04：recent-deletes.tsx 标题改为 "最近删除 · X 张"，paddingHorizontal 防返回按钮重叠
- **审查修复**：expo-file-system API 误用（File→Directory、copy 是同步不是 async、目录创建竞态）、LIVE badge 回归、dead code loading 分支
- **StatCard 调整**：去掉最近删除 `>` 箭头，文字改为红色 (`#FF3B30`)
- **滑动效果注释**：settings.tsx 中整个滑动特效 section 已注释
- **左右滑动动画增强**：SwipeableCard 增加 rotationZ(±8°) + cardScale(0.92→0.82) + withSpring 回弹 + Easing.out(Easing.cubic) 飞出
- **庆祝动画**：CelebrationOverlay 组件 — 黄色 ✓ 图标弹入 + 12 颗彩色粒子爆散 + "完成！已清理 X 张"，接入 review.tsx 和 index.tsx
- **新手引导重做**：GestureGuideOverlay 完整覆盖顶部工具栏（排序/批量删除）、四向手势、底部按钮（相册/详情）、进度圆点（黄=删 绿=留）
- **Dev APK**：`android/app/build/outputs/apk/debug/app-debug.apk`，192MB，包名 `com.zackf.pickup.dev`
- **Release APK**：`android/app/build/outputs/apk/release/app-release.apk`，105MB，包名 `com.zackf.pickup.preview`，不覆盖 dev
- **Metro IP 变更**：当前本机 IP 为 `192.168.5.15`（之前是 `.68`）

### 关键文件（本次涉及）

| 新增 | 修改 |
|------|------|
| `src/components/ui/CelebrationOverlay.tsx` | `src/components/gesture/QuickDeleteButton.tsx` |
| | `app/index.tsx` |
| | `app/review.tsx` |
| | `app/recent-deletes.tsx` |
| | `app/settings.tsx` |
| | `src/services/delete-service.ts` |
| | `src/components/gesture/SwipeableCard.tsx` |
| | `src/components/gesture/GestureGuideOverlay.tsx` |
| | `src/components/settings/StatCard.tsx` |

### 下一步

- 安装 release APK 到手机测试全部 v1.7 功能
- 验证庆祝动画效果
- 验证左右滑动动画流畅度
- 验证新手引导显示完整
- 后续如需正式发布，需用 `EAS_BUILD_PROFILE=production` 生成正式包名 `com.zackf.pickup`

---
