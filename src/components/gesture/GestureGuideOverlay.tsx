import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableWithoutFeedback } from 'react-native';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export function GestureGuideOverlay({ visible, onDismiss }: Props) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(overlayOpacity, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }).start();

      const timer = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timer);
    } else {
      overlayOpacity.setValue(0);
    }
  }, [visible, onDismiss, overlayOpacity]);

  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={onDismiss}>
      <Animated.View style={[styles.container, { opacity: overlayOpacity }]}>
        <View style={styles.overlay}>
          {/* UP: delete */}
          <View style={[styles.group, styles.up]}>
            <View style={styles.pillDelete}>
              <Text style={styles.pillDeleteText}>删 除</Text>
            </View>
            <Text style={styles.sub}>删除照片</Text>
            <View style={[styles.ring, styles.ringDelete]}>
              <Text style={styles.arrow}>👆</Text>
            </View>
          </View>

          {/* DOWN: keep */}
          <View style={[styles.group, styles.down]}>
            <View style={[styles.ring, styles.ringKeep]}>
              <Text style={styles.arrow}>👇</Text>
            </View>
            <Text style={styles.sub}>保留照片</Text>
            <View style={styles.pillKeep}>
              <Text style={styles.pillKeepText}>保 留</Text>
            </View>
          </View>

          {/* LEFT: skip (no text) */}
          <View style={[styles.group, styles.left]}>
            <View style={[styles.ring, styles.ringNav]}>
              <Text style={styles.arrow}>👈</Text>
            </View>
            <Text style={styles.sub}>跳过</Text>
          </View>

          {/* RIGHT: previous */}
          <View style={[styles.group, styles.right]}>
            <View style={[styles.ring, styles.ringNav]}>
              <Text style={styles.arrow}>👉</Text>
            </View>
            <Text style={styles.sub}>上一张</Text>
          </View>

          {/* Center hint */}
          <View style={styles.centerHint}>
            <Text style={styles.centerHintText}>📸 滑动照片开始整理</Text>
          </View>

          <Text style={styles.dismissText}>点击屏幕关闭</Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  group: {
    position: 'absolute',
    alignItems: 'center',
    gap: 10,
  },
  up: { top: 70, left: 0, right: 0 },
  down: { bottom: 210, left: 0, right: 0 },
  left: { left: 32, top: '50%', marginTop: -50 },
  right: { right: 32, top: '50%', marginTop: -50 },

  pillDelete: {
    backgroundColor: '#FFCC00',
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 24,
  },
  pillDeleteText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 2,
  },
  pillKeep: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  pillKeepText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },

  ring: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDelete: {
    backgroundColor: 'rgba(255,204,0,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,204,0,0.4)',
  },
  ringKeep: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  ringNav: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  arrow: {
    fontSize: 28,
  },
  sub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
  centerHint: {
    position: 'absolute',
    bottom: 280,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  centerHintText: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    overflow: 'hidden',
  },
  dismissText: {
    position: 'absolute',
    bottom: 200,
    fontSize: 12,
    color: 'rgba(255,255,255,0.25)',
  },
});
