import React, { useCallback } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Tokens } from '../../design-tokens';
import { DeleteOverlay } from './DeleteOverlay';
import { ActionIndicator } from './ActionIndicator';
import { useHaptics } from '../../hooks/useHaptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  children: React.ReactNode;
  onMarkDelete: () => void;
  onMarkKeep: () => void;
  onSkip: () => void;
}

export function SwipeableCard({ children, onMarkDelete, onMarkKeep, onSkip }: Props) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const markProgress = useSharedValue(0);
  const isAnimating = useSharedValue(false);
  const hapticFired = useSharedValue(false);
  const { impactMedium } = useHaptics();

  const handleEnd = useCallback((ty: number, tx: number) => {
    'worklet';
    if (isAnimating.value) return;

    const isVertical = Math.abs(ty) > Math.abs(tx);
    const threshold = Tokens.photo.markThreshold * 200;

    if (isVertical && Math.abs(ty) >= threshold) {
      // Up = delete, Down = keep
      isAnimating.value = true;
      const direction = ty < 0 ? -1 : 1;
      translateY.value = withTiming(direction * SCREEN_HEIGHT * 1.5, { duration: 300 }, () => {
        isAnimating.value = false;
        runOnJS(direction < 0 ? onMarkDelete : onMarkKeep)();
      });
    } else if (!isVertical && Math.abs(tx) > 80) {
      // Horizontal swipe = skip — instant dismiss, no bounce
      isAnimating.value = true;
      const direction = tx < 0 ? -1 : 1;
      translateX.value = withTiming(direction * SCREEN_WIDTH * 1.5, { duration: 250 }, () => {
        translateX.value = 0;
        translateY.value = 0;
        markProgress.value = 0;
        isAnimating.value = false;
        runOnJS(onSkip)();
      });
    } else {
      // Snap back
      translateY.value = withTiming(0, { duration: 300 });
      translateX.value = withTiming(0, { duration: 300 });
      markProgress.value = 0;
    }
  }, [onMarkDelete, onMarkKeep, onSkip]);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      hapticFired.value = false;
    })
    .onUpdate((e) => {
      if (isAnimating.value) return;
      translateY.value = e.translationY * 0.8;
      translateX.value = e.translationX * 0.8;
      const dy = e.translationY;
      const maxDist = 200;
      const progressY = Math.max(-1, Math.min(1, dy / maxDist));
      markProgress.value = Math.abs(dy) > Math.abs(e.translationX) ? progressY : 0;
      const overThreshold = Math.abs(progressY) >= Tokens.photo.markThreshold;
      if (overThreshold && !hapticFired.value) {
        hapticFired.value = true;
        runOnJS(impactMedium)();
      }
      if (!overThreshold) {
        hapticFired.value = false;
      }
    })
    .onEnd((e) => {
      if (isAnimating.value) return;
      handleEnd(e.translationY, e.translationX);
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, cardStyle]}>
        {children}
        <DeleteOverlay progress={markProgress} />
        <ActionIndicator progress={markProgress} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, width: SCREEN_WIDTH, height: SCREEN_HEIGHT } });
