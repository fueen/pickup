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

## 2026-05-22 22:30 | 项目进展-pickup

### 一句话概述
定位并修复了困扰已久的 Android 原生崩溃 `getDirectConverter`，根因是 expo-font SDK 版本不匹配。

### 当前进度 / 关键结论
- **getDirectConverter 崩溃根因**：`expo-font@56.0.5`（未来 SDK 版本）被安装到 SDK 54 项目中，其原生代码调用 `ReturnTypeKt.getDirectConverter()`，该方法在 SDK 54 的 `expo-modules-core@3.0.30` 中不存在
- **触发方式**：EAS 构建日志报 "duplicate expo-font" 和 "missing peer dependency expo-font" 两个警告，顺藤摸瓜发现版本错配
- **修复**：用 `npx expo install expo-font` 安装正确版本 `14.0.11`，消除重复，添加 expo-font 插件到 app.config.js
- **app.config.js 动态配置**：通过 `EAS_BUILD_PROFILE` 环境变量区分三套包名/应用名（dev/preview/prod），实现同一设备并存安装
- **已提交修复** `f1aa0e6`，已推送 GitHub
- **Dev build** `b0849955` 和 **Preview build** `af36e61f` 已触发排队

### 重要教训
- 添加 Expo 包务必用 `npx expo install <pkg>`，不能用 `npm install`，否则版本不匹配会引发难以调试的原生崩溃
- EAS 构建日志里的 warning 要认真看，duplicate/missing peer dependency 往往是崩溃的直接原因

### 下一步
- 两个新构建完成后下载测试，验证 getDirectConverter 崩溃是否已修复
- Dev build 成功后，用 `npx expo start --dev-client` + Metro 热加载实现快速迭代
