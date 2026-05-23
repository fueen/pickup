import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { SafeBlurView } from '../ui/SafeBlurView';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { Tokens } from '../../design-tokens';

interface Props {
  visible: boolean;
  count: number;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmSheet({ visible, count, loading, onConfirm, onCancel }: Props) {
  const [render, setRender] = useState(false);
  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.85);
  const cardOpacity = useSharedValue(0);
  const confirmedRef = useRef(false);
  const prevVisible = useRef(false);

  useEffect(() => {
    // Only act on actual visible transitions
    if (visible === prevVisible.current) return;
    prevVisible.current = visible;

    if (visible) {
      // Reset confirmed flag when modal opens
      confirmedRef.current = false;
      setRender(true);
      overlayOpacity.value = withTiming(1, { duration: 300 });
      cardScale.value = withTiming(1, { duration: 300 });
      cardOpacity.value = withTiming(1, { duration: 300 });
    } else if (render) {
      overlayOpacity.value = withTiming(0, { duration: 200 });
      cardScale.value = withTiming(0.85, { duration: 200 });
      cardOpacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(setRender)(false);
      });
    }
  }, [visible, render]);

  // Ensure modal closes when confirmed — if parent toggles visible back
  // to true after confirm, ignore it until the close animation completes.
  const handleConfirm = () => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;
    onConfirm();
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  if (!render) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onCancel}>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <Animated.View style={[styles.card, cardStyle]}>
          <SafeBlurView style={StyleSheet.absoluteFill} tint="dark" intensity={80} fallbackBackground="rgba(28,28,30,0.85)" />
          <View style={styles.cardContent}>
            <Text style={styles.title}>确认删除</Text>
            <Text style={styles.body}>
              将删除 {count} 张照片，删除后可在系统「最近删除」中恢复（30 天内）
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteText}>
                {loading ? '删除中...' : `删除 ${count} 张`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onCancel} activeOpacity={0.7}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '78%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardContent: {
    padding: Tokens.spacing.xl,
    paddingVertical: Tokens.spacing.xxl,
    alignItems: 'center',
  },
  title: {
    ...Tokens.typography.title,
    color: Tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: Tokens.spacing.m,
  },
  body: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: Tokens.spacing.xl,
    lineHeight: 22,
  },
  button: {
    width: '100%',
    paddingVertical: Tokens.spacing.l,
    alignItems: 'center',
    marginBottom: Tokens.spacing.s,
  },
  deleteButton: {
    backgroundColor: Tokens.color.danger,
    borderRadius: Tokens.radius.button,
  },
  deleteText: {
    ...Tokens.typography.title,
    color: '#FFFFFF',
  },
  cancelText: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
  },
});
