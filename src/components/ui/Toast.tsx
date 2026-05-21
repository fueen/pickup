import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({
  message,
  visible,
  onDismiss,
  duration = 3000,
}: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onDismiss());
      }, duration);

      return () => clearTimeout(timer);
    } else {
      opacity.setValue(0);
    }
    return undefined;
  }, [visible, duration, opacity, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: Tokens.spacing.xl,
    right: Tokens.spacing.xl,
    backgroundColor: Tokens.color.surfaceElevated,
    borderRadius: Tokens.radius.card,
    paddingVertical: Tokens.spacing.m,
    paddingHorizontal: Tokens.spacing.l,
    alignItems: 'center',
    zIndex: 999,
  },
  message: {
    ...Tokens.typography.body,
    color: Tokens.color.textPrimary,
    textAlign: 'center',
  },
});
