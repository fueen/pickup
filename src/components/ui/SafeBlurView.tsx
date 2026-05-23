import React from 'react';
import { View, Platform, UIManager } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'dark' | 'light' | 'default';
  children?: React.ReactNode;
  fallbackBackground?: string;
}

function hasNativeBlurView(): boolean {
  if (Platform.OS === 'web') return false;
  try {
    const config = UIManager.getViewManagerConfig?.('ExpoBlurView');
    return !!config;
  } catch {
    return false;
  }
}

const blurAvailable = hasNativeBlurView();

export function SafeBlurView({ style, intensity = 80, tint = 'dark', children, fallbackBackground }: Props) {
  if (!blurAvailable) {
    return (
      <View style={[style, { backgroundColor: fallbackBackground || 'rgba(28,28,30,0.85)' }]}>
        {children}
      </View>
    );
  }

  // Lazy require — only evaluated when native module is confirmed available
  const { BlurView } = require('expo-blur');
  return (
    <BlurView style={style} intensity={intensity} tint={tint}>
      {children}
    </BlurView>
  );
}
