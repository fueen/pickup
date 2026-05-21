import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';
import { Tokens } from '../../design-tokens';

interface Props {
  progress: SharedValue<number>;
  skipProgress: SharedValue<number>;
}

export function ActionIndicator({ progress, skipProgress }: Props) {
  const deleteStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [-0.5, 0], [1, 0]);
    return { opacity };
  });
  const keepStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.5], [0, 1]);
    return { opacity };
  });
  const skipLeftStyle = useAnimatedStyle(() => {
    const v = skipProgress.value;
    const opacity = v < 0 ? interpolate(-v, [Tokens.photo.markThreshold, 0.5], [0, 1]) : 0;
    return { opacity };
  });
  const skipRightStyle = useAnimatedStyle(() => {
    const v = skipProgress.value;
    const opacity = v > 0 ? interpolate(v, [Tokens.photo.markThreshold, 0.5], [0, 1]) : 0;
    return { opacity };
  });
  return (
    <>
      <Animated.View style={[styles.indicator, styles.delete, deleteStyle]}>
        <Animated.Text style={styles.text}>删除</Animated.Text>
      </Animated.View>
      <Animated.View style={[styles.indicator, styles.keep, keepStyle]}>
        <Animated.Text style={styles.text}>保留</Animated.Text>
      </Animated.View>
      <Animated.View style={[styles.indicator, styles.skipLeft, skipLeftStyle]}>
        <Animated.Text style={styles.text}>跳过</Animated.Text>
      </Animated.View>
      <Animated.View style={[styles.indicator, styles.skipRight, skipRightStyle]}>
        <Animated.Text style={styles.text}>上一张</Animated.Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  indicator: { position: 'absolute', alignItems: 'center', zIndex: 20 },
  delete: { top: 120, left: 0, right: 0 },
  keep: { bottom: 120, left: 0, right: 0 },
  skipLeft: { left: 40, top: 0, bottom: 0, justifyContent: 'center' },
  skipRight: { right: 40, top: 0, bottom: 0, justifyContent: 'center' },
  text: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 8 },
});
