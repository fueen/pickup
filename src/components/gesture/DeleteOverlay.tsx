import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';
import { Tokens } from '../../design-tokens';

interface Props { progress: SharedValue<number>; }

export function DeleteOverlay({ progress }: Props) {
  const overlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [-1, -Tokens.photo.markThreshold, 0], [1, 0.3, 0]);
    return { opacity, backgroundColor: Tokens.color.danger };
  });
  return <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none" />;
}

const styles = StyleSheet.create({ overlay: { ...StyleSheet.absoluteFillObject, zIndex: 10 } });
