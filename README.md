# 拾遗 PickUp

一键清理手机照片，告别照片焦虑。

像刷短视频一样快速整理相册：上滑删除、下滑保留，每 10 张一组批量确认，安全可控。

当前版本：**v1.3.0**

## 功能

### 核心流程
- **滑动整理**：上滑标记删除、下滑标记保留、左滑跳过、右滑上一张，配合触觉反馈 + 回弹动画
- **批量确认**：每组 10 张滑完后进入删除确认页，确认删除后自动切换下一组
- **中途快删**：浏览页右上角图标 + 计数 badge 可在一组中途删除，删除后只补齐当前组缺口并继续浏览
- **待删除列表**：确认页照片堆叠可进入待删除列表，支持 3 列缩略图、多选还原、长按照片全屏预览
- **智能分组**：Fisher-Yates 随机乱序 + 已浏览去重，照片看完一圈后从最早浏览的回填
- **排序模式**：支持随机 / 面积↓ / 最新↑ / 最早↑ 四种排序，偏好持久化

### 照片信息
- **相对日期**：显示为"年月日 · X天前/昨天/今天"，日期严格水平居中
- **地理位置**：自动读取照片 EXIF GPS 坐标，显示拍摄城市名（如 📍 上海市）
- **LIVE 标识**：Live Photo 显示 LIVE 徽章

### 会员与限制
- **免费用户**：每日 3 组（30 张），可浏览但受限制
- **Pro 订阅**：无限使用，通过 RevenueCat 管理周/月/年/永久订阅
- **开发者模式**：设置页连续点击底部文字 5 次解锁，绕过所有限制

### 最近删除
- 删除照片后自动记录缩略图到本地缓存，可在「最近删除」页回溯查看
- 3 列网格展示，按删除时间倒序，支持点击查看详情
- 删除前会缓存缩略图，避免系统删除后最近删除记录变成黑图

### 庆祝动画
- 完成一组删除后弹出庆祝动画：黄色 ✓ 弹入 + 彩色粒子爆散 + "已清理 X 张"

### 体验细节
- **手势引导**：首次启动弹出四方向操作说明覆盖层，覆盖全部 UI 区域，4 秒自动消失
- **原比例展示**：照片按原始宽高比显示，圆角卡片，不裁切不拉伸
- **进度指示**：底部圆点按实际标记索引着色（黄=删除、绿=保留），支持点击跳转
- **触觉反馈**：滑动标记时触发 haptic 反馈
- **启动闪屏**：品牌 Splash 动画
- **空状态**：空相册展示卡通幽灵占位图，与整体设计风格统一
- **相册切换**：支持选择系统相册，左下角按钮随时可切换

### 统计面板
- 累计浏览 / 累计删除 / 连续使用天数 / 释放空间（连续累计，重启不归零）
- 日使用量跨天自动重置
- 更多功能 Tab 展示月份分析、每周清理回顾、成就系统和扩展入口

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Expo SDK 54 + React Native 0.81.5 (New Architecture) |
| 路由 | expo-router 6 (file-based, Tab 导航) |
| 手势 | react-native-gesture-handler + react-native-reanimated 4 |
| 触觉 | expo-haptics |
| 媒体 | expo-media-library (相册读写 + 原生删除) |
| 文件 | expo-file-system (获取文件大小) |
| 支付 | RevenueCat (react-native-purchases) |
| 存储 | @react-native-async-storage/async-storage |
| 图标 | @expo/vector-icons (MaterialCommunityIcons) |
| 测试 | Jest + ts-jest + @testing-library/react-native |

## 项目结构

```
app/                          # 页面 (expo-router file-based routing)
  _layout.tsx                 # 根布局：Provider 嵌套 + Tab 导航 + Splash + ErrorBoundary
  index.tsx                   # 主浏览页：滑动卡片、排序、相册选择、日期 + 地理位置
  review.tsx                  # 待删除列表页：缩略图网格、多选还原、全屏缩放预览
  settings.tsx                # 设置页：会员状态、统计数据、开发者模式入口
  paywall.tsx                 # Pro 订阅页：定价卡片、购买/恢复
  recent-deletes.tsx          # 最近删除页：3 列网格，已删照片缩略图回溯
  albums.tsx                  # 相册选择页：2 列缩略图，按数量降序
  hub.tsx                     # 更多功能页：概览、月份分析、每周回顾、成就、功能入口

src/
  components/
    gesture/                  # 手势交互
      SwipeableCard.tsx       # PanResponder 手势卡片，四方向滑动
      ActionIndicator.tsx     # 滑动方向指示器（删除/保留/跳过/上一张）
      QuickDeleteButton.tsx   # 快速删除浮动按钮
      GestureGuideOverlay.tsx # 首次启动手势引导覆盖层
      DeleteOverlay.tsx       # 标记删除红色蒙层
    delete-review/            # 删除确认
      DeleteGrid.tsx          # 待删除缩略图网格，点击多选 + 长按预览
      DeleteConfirmSheet.tsx  # 全屏删除确认页，最多展示 3 张预览图
      PhotoZoomModal.tsx      # 全屏缩放预览（捏合/双指点击/拖动）
      EmptyReviewPlaceholder.tsx # 无待删照片的卡通占位图
    settings/                 # 设置页组件
      AchievementStrip.tsx    # 成就徽章横向列表
      WeeklyReviewCard.tsx    # 每周清理回顾卡片
      StatCard.tsx            # 统计卡片
      SettingsSection.tsx     # 设置分组容器
      SettingsRow.tsx         # 设置行
      PricingCard.tsx         # 定价卡片
    photo-card/               # 照片浏览组件
      PhotoCard.tsx           # 照片卡片：原比例计算、圆角图片、日期标签
      GroupProgressBar.tsx    # 底部圆点进度条，支持点击跳转
      SortPickerSheet.tsx     # 排序模式底部弹出选择器
      PermissionGate.tsx      # 权限请求/被拒门
      LoadingGate.tsx         # 加载中占位
      EmptyGate.tsx           # 空相册占位（卡通幽灵插图）
      DailyLimitReached.tsx   # 每日限制达到占位（带动画）
      LimitReachedModal.tsx   # 限制达到弹窗
    ui/                       # 通用 UI
      Modal.tsx               # 通用模态框
      Toast.tsx               # Toast 提示
      CelebrationOverlay.tsx  # 删除完成庆祝动画（✓ + 粒子爆散）
    ErrorBoundary.tsx         # 全局错误边界
    SplashScreen.tsx          # 品牌闪屏动画

  contexts/                   # React Context 状态管理
    PhotoContext.tsx           # 照片引擎上下文（usePhotoEngine hook 封装）
    SessionContext.tsx         # 会话交互日志（reducer 模式）
    SubscriptionContext.tsx    # 订阅状态 + 日用量（RevenueCat + AsyncStorage）
    StatsContext.tsx           # 使用统计（AsyncStorage 持久化）

  hooks/
    usePhotoEngine.ts         # 核心照片引擎：权限、加载分页、随机分组、浏览追踪
    useHaptics.ts             # 触觉反馈 hook

  services/
    photo-service.ts          # 照片分组算法（Fisher-Yates + 去重 + 回填）
    delete-service.ts         # 原生删除（MediaLibrary.deleteAssetsAsync + 文件大小）
    subscription-service.ts   # RevenueCat 封装（配置、购买、恢复、权益检查）
    stats-service.ts          # 统计持久化（浏览数、删除数、连续天数、周历史）

  types/
    photo.ts                  # PhotoAsset, PermissionStatus, GestureState, InteractionLogEntry
    subscription.ts           # SubscriptionType, DailyUsage, DailyStats, PricingTier

  utils/
    fisher-yates.ts           # Fisher-Yates 洗牌算法
    date-utils.ts             # 日期格式化（相对日期 + 今日键）
    achievement-utils.ts      # 成就系统派生规则
    delete-confirm-utils.ts   # 删除确认文案、空间估算、流程决策

  design-tokens.ts            # 全局设计令牌：颜色、间距、圆角、动画参数、排版

__tests__/unit/               # 单元测试
  date-utils.test.ts          # 日期格式化测试
```

## 架构设计

### Provider 嵌套层级

```
GestureHandlerRootView
  └─ StatusBar
  └─ ErrorBoundary
     └─ SubscriptionProvider    (RevenueCat + AsyncStorage 日用量)
        └─ StatsProvider        (AsyncStorage 统计数据)
           └─ PhotoProvider     (usePhotoEngine: 权限、加载、分组)
              └─ SessionProvider (useReducer: 交互日志)
                 └─ Tab Navigator
```

### 数据流

1. **权限检查**：`usePhotoEngine` 挂载时静默查询 `getPermissionsAsync()`，不弹系统对话框
2. **照片加载**：`MediaLibrary.getAssetsAsync()` 分页拉取全部照片（500 张/页），映射为 `PhotoAsset[]`
3. **分组生成**：`generateRandomGroup()` 从未浏览照片中 Fisher-Yates 随机选 10 张，不足时从最早浏览回填
4. **浏览追踪**：已浏览 ID 集合 + 浏览顺序数组持久化到 AsyncStorage
5. **日用量**：`SubscriptionContext` 维护 `{ date, count }` 结构，跨天自动清零
6. **手势交互**：`SwipeableCard` 的 PanResponder → dispatch SessionContext → 同时更新 PhotoContext 标记集合

### 渲染优先级

主浏览页 `index.tsx` 按以下顺序判断渲染：

```
权限被拒 → PermissionGate
日用量未加载 → LoadingGate
权限未确定 → PermissionGate
达到日限制 → DailyLimitReached
照片加载中 → LoadingGate
相册为空 → EmptyGate
无当前照片 → LoadingGate
正常 → 浏览界面
```

## 构建配置

项目使用 `app.config.js` 动态配置 + `build.gradle` 的 `applicationIdSuffix` 区分包名：

| Build Type | App 名 | Package ID | 体积 | 用途 |
|-----------|--------|------------|------|------|
| debug | 拾忆 | com.zackf.pickup.dev | ~192MB | 本地 dev-client 热更新 |
| release | PickUp | com.zackf.pickup.preview | ~100MB | Android 内部分发测试 |
| production | 拾遗 | com.zackf.pickup | — | 正式发布 |

Release 构建启用 R8 代码混淆 + 资源压缩 + ABI 过滤（arm64-v8a / armeabi-v7a）。Metro 打包通过 `pure_funcs` 去掉 `console.log/info/debug`。

v1.3.0 本地 release 包输出：

```
dist/pickup-v1.3.0-release.apk
```

## 开始开发

```bash
# 安装依赖
npm install

# 启动 dev-client（支持热更新）
npm start

# 本地 Gradle 构建（无需 EAS）
cd android && gradlew assembleDebug      # dev 包 (拾忆, com.zackf.pickup.dev)
cd android && gradlew assembleRelease    # release 包 (PickUp, com.zackf.pickup.preview)

# 运行测试
npx jest
```

## 手势操作

| 方向 | 操作 | 视觉反馈 |
|------|------|----------|
| ↑ 上滑 | 标记删除 | 红色背景 + "删除" + 触觉 |
| ↓ 下滑 | 标记保留 | 绿色圆点 + "保留" + 触觉 |
| ← 左滑 | 跳过，下一张 | "跳过" |
| → 右滑 | 返回上一张 | "上一张" |

底部进度条圆点可直接点击跳转到对应照片。浏览页右上角按钮可一键删除当前组所有已标记照片。

## 文档

- [更新日志](./CHANGELOG.md)
- [v1.3 趣味化与确认删除体验需求文档](./PRD-v1.3-趣味化与确认删除体验需求.md)
- [功能优化需求文档 (PRD v1.2-v1.9)](./PRD-v1.2-功能优化需求.md)
- [需求文档 HTML 版](./docs/PRD-v1.2.html) — 杂志风格排版
- [开发日志 HTML 版](./docs/memory.html) — 时间线式开发记录

## License

MIT
