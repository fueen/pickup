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
