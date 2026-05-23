import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';
import { Tokens } from '../../design-tokens';

interface Props {
  progress: SharedValue<number>;
  skipProgress: SharedValue<number>;
  isMarkedForDelete: boolean;
}

export function ActionIndicator({ progress, skipProgress, isMarkedForDelete }: Props) {
  const deleteStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [-0.5, 0], [1, 0]);
    return { opacity };
  });
  const undoStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.5], [0, 1]);
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
        <Animated.Text style={styles.deleteText}>删除</Animated.Text>
      </Animated.View>
      <Animated.View style={[styles.indicator, styles.undo, undoStyle]}>
        <Animated.Text style={isMarkedForDelete ? styles.undoText : styles.keepText}>
          {isMarkedForDelete ? '已撤回' : '保留'}
        </Animated.Text>
      </Animated.View>
      <Animated.View style={[styles.indicator, styles.skipRight, skipRightStyle]}>
        <Animated.Text style={styles.navText}>上一张 →</Animated.Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  indicator: { position: 'absolute', alignItems: 'center', zIndex: 20 },
  delete: { top: 108, left: 0, right: 0 },
  keep: { bottom: 205, left: 0, right: 0 },
  skipRight: { right: 4, top: 0, bottom: 0, justifyContent: 'center' },
  deleteText: {
    fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: 2,
    backgroundColor: '#FFCC00', paddingHorizontal: 22, paddingVertical: 8,
    borderRadius: 24, overflow: 'hidden',
  },
  undo: { bottom: 205, left: 0, right: 0 },
  undoText: {
    fontSize: 16, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2,
    backgroundColor: '#34C759', paddingHorizontal: 22, paddingVertical: 8,
    borderRadius: 24, overflow: 'hidden',
  },
  keepText: {
    fontSize: 16, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2,
    backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 22, paddingVertical: 8,
    borderRadius: 24, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  navText: {
    fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: 1,
    backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 24, overflow: 'hidden',
  },
});
