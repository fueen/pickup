import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeBlurView } from './SafeBlurView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tokens } from '../../design-tokens';

function TabBarIcon({
  descriptor,
  isFocused,
  onPress,
}: {
  descriptor: BottomTabBarProps['descriptors'][string];
  isFocused: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withTiming(isFocused ? 1.15 : 1, { duration: 200 });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity onPress={onPress} style={styles.iconButton} activeOpacity={0.7}>
      <Animated.View style={animatedStyle}>
        {descriptor.options.tabBarIcon?.({
          focused: isFocused,
          color: isFocused ? Tokens.color.accent : Tokens.color.textMuted,
          size: 24,
        })}
      </Animated.View>
    </TouchableOpacity>
  );
}

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const capsuleLeft = (screenWidth - CAPSULE_WIDTH) / 2;

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom + 8 }]} pointerEvents="box-none">
      <View style={[styles.capsule, { left: capsuleLeft, bottom: insets.bottom + 8 }]}>
        <SafeBlurView
          style={StyleSheet.absoluteFill}
          tint="dark"
          intensity={90}
          fallbackBackground="rgba(28,28,30,0.85)"
        />
        <View style={styles.iconsRow}>
          {state.routes.map((route, index) => {
            const descriptor = descriptors[route.key];
            if (!descriptor) return null;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabBarIcon
                key={route.key}
                descriptor={descriptor}
                isFocused={isFocused}
                onPress={onPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const ICON_COUNT = 3;
const ICON_SIZE = 48;
const CAPSULE_WIDTH = ICON_COUNT * ICON_SIZE + 48; // 144 + 48 = 192

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'transparent',
  },
  capsule: {
    position: 'absolute',
    width: CAPSULE_WIDTH,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(28,28,30,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,204,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: ICON_SIZE,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
