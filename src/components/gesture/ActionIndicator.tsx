import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';
import { Tokens } from '../../design-tokens';

interface Props { progress: SharedValue<number>; }

export function ActionIndicator({ progress }: Props) {
  const deleteStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [-0.5, 0], [1, 0]);
    return { opacity };
  });
  const keepStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.5], [0, 1]);
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
    </>
  );
}

const styles = StyleSheet.create({
  indicator: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 20 },
  delete: { top: 120 },
  keep: { bottom: 120 },
  text: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 8 },
});
