import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';

interface Props { progress: SharedValue<number>; }

export function DeleteOverlay({ progress }: Props) {
  const overlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [-0.5, -0.2, 0], [0.6, 0.1, 0]);
    return { opacity, backgroundColor: 'transparent' };
  });
  return <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none" />;
}

const styles = StyleSheet.create({ overlay: { ...StyleSheet.absoluteFillObject, zIndex: 10 } });
