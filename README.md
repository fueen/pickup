# 拾遗 Pickup

一键清理手机照片，告别照片焦虑。

## 功能

- **滑动整理**：上滑删除、下滑保留、左滑跳过、右滑上一张，像刷短视频一样快速整理
- **批量确认**：每组 10 张，确认后一键删除，安全可控
- **统计面板**：追踪浏览数量、删除数量、释放空间、连续使用天数
- **Pro 订阅**：免费用户每日 20 组，Pro 用户无限使用

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Expo SDK 54 + React Native 0.81 |
| 路由 | expo-router (file-based tabs) |
| 手势 | react-native-gesture-handler + react-native-reanimated |
| 触觉 | expo-haptics |
| 媒体 | expo-media-library |
| 支付 | RevenueCat (react-native-purchases) |
| 存储 | @react-native-async-storage/async-storage |
| 测试 | Jest + @testing-library/react-native |

## 项目结构

```
app/                  # 页面 (expo-router)
  _layout.tsx         # 根布局 + Tab 导航
  index.tsx           # 主浏览页
  review.tsx          # 删除确认页
  paywall.tsx         # Pro 订阅页
  settings.tsx        # 设置页
src/
  components/
    gesture/           # 手势卡片、滑动指示器
    photo-card/        # 照片卡片、进度条、权限门
    settings/          # 设置组件、定价卡片
    delete-review/     # 删除确认网格
    ui/                # 通用 UI (Modal, Toast)
  contexts/            # Photo / Session / Stats / Subscription
  hooks/               # usePhotoEngine, useHaptics
  services/            # photo, delete, subscription, stats
  types/               # TypeScript 类型定义
  utils/               # Fisher-Yates 洗牌、日期工具
```

## 开始开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# Android 预览构建
npx eas build --platform android --profile preview
```

## 手势操作

| 方向 | 操作 | 提示 |
|------|------|------|
| ↑ 上滑 | 标记删除 | 红色背景 + "删除" |
| ↓ 下滑 | 标记保留 | 绿色圆点 + "保留" |
| ← 左滑 | 跳过，下一张 | "跳过" |
| → 右滑 | 返回上一张 | "上一张" |

底部进度条可直接点击圆点跳转到对应照片。

## License

MIT
