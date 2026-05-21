import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Tokens } from '../../design-tokens';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export function GestureGuideOverlay({ visible, onDismiss }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const slideDown = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, damping: 12, stiffness: 120, useNativeDriver: true }),
        Animated.spring(slideDown, { toValue: 0, damping: 12, stiffness: 120, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timer);
    } else {
      opacity.setValue(0);
      slideUp.setValue(30);
      slideDown.setValue(-30);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <Animated.View style={[styles.arrow, styles.arrowUp, { transform: [{ translateY: slideUp }] }]}>
        <Text style={styles.arrowText}>👆</Text>
        <Text style={styles.label}>上滑保留</Text>
      </Animated.View>

      <Animated.View style={[styles.arrow, styles.arrowDown, { transform: [{ translateY: slideDown }] }]}>
        <Text style={styles.arrowText}>👇</Text>
        <Text style={styles.label}>下滑删除</Text>
      </Animated.View>

      <View style={styles.hintRow}>
        <View style={styles.hintItem}>
          <Text style={styles.hintArrow}>←</Text>
          <Text style={styles.hintLabel}>跳过</Text>
        </View>
        <View style={styles.hintItem}>
          <Text style={styles.hintArrow}>→</Text>
          <Text style={styles.hintLabel}>跳过</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  arrowUp: { top: 100 },
  arrowDown: { bottom: 100 },
  arrowText: { fontSize: 40 },
  label: {
    ...Tokens.typography.title,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 8,
    marginTop: Tokens.spacing.s,
  },
  hintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    left: Tokens.spacing.xxl,
    right: Tokens.spacing.xxl,
    top: '50%',
    marginTop: -20,
  },
  hintItem: { alignItems: 'center' },
  hintArrow: {
    fontSize: 28,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  hintLabel: {
    ...Tokens.typography.caption,
    color: '#FFFFFF',
    opacity: 0.6,
    marginTop: Tokens.spacing.xs,
  },
});
