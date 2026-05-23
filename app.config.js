const IS_DEV = process.env.EAS_BUILD_PROFILE === 'development';
const IS_PREVIEW = process.env.EAS_BUILD_PROFILE === 'preview';

const APP_NAME = IS_DEV ? '拾遗 Dev' : IS_PREVIEW ? 'PickUp' : '拾遗';
const PACKAGE_SUFFIX = IS_DEV ? '.dev' : IS_PREVIEW ? '.preview' : '';
const BASE_PACKAGE = 'com.zackf.pickup';

export default {
  expo: {
    name: APP_NAME,
    slug: 'pickup',
    version: '1.0.1',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      bundleIdentifier: BASE_PACKAGE + PACKAGE_SUFFIX,
      supportsTablet: true,
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          '拾遗需要访问你的照片库，以便浏览和整理照片。所有处理均在本地完成，不会上传任何照片。',
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    plugins: [
      'expo-font',
      [
        'expo-media-library',
        {
          photosPermission:
            '拾遗需要访问你的照片库，以便浏览和整理照片。所有处理均在本地完成，不会上传任何照片。',
          savePhotosPermission: '拾遗需要保存照片到你的照片库。',
        },
      ],
    ],
    android: {
      package: BASE_PACKAGE + PACKAGE_SUFFIX,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: false,
      predictiveBackGestureEnabled: false,
      permissions: ['android.permission.READ_MEDIA_IMAGES'],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: {
        projectId: 'd6e7a872-71ab-4a4b-9f8f-f78370734323',
      },
    },
    owner: 'zack_f',
  },
};
