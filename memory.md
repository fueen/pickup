# Memory Log

---

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
