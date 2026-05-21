import React, { useCallback } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
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
  const { impactMedium, notifySuccess, notifyWarning } = useHaptics();

  const handleEnd = useCallback((ty: number, tx: number) => {
    'worklet';
    if (isAnimating.value) return;
    if (Math.abs(ty) >= Tokens.photo.markThreshold * 200) {
      isAnimating.value = true;
      const direction = ty < 0 ? -1 : 1;
      translateY.value = withSpring(direction * SCREEN_HEIGHT * 1.5, { damping: 0.7, stiffness: 150 }, () => {
        isAnimating.value = false;
        if (direction < 0) runOnJS(onMarkDelete)();
        else runOnJS(onMarkKeep)();
      });
    } else if (Math.abs(tx) > Math.abs(ty) && Math.abs(tx) > 80) {
      isAnimating.value = true;
      const direction = tx < 0 ? -1 : 1;
      translateX.value = withSpring(direction * SCREEN_WIDTH * 1.5, { damping: 0.7, stiffness: 150 }, () => {
        isAnimating.value = false;
        translateX.value = 0;
        translateY.value = 0;
        markProgress.value = 0;
        runOnJS(onSkip)();
      });
    } else {
      translateY.value = withSpring(0, { damping: 0.7, stiffness: 150 });
      translateX.value = withSpring(0, { damping: 0.7, stiffness: 150 });
      markProgress.value = 0;
    }
  }, [onMarkDelete, onMarkKeep, onSkip]);

  const panGesture = Gesture.Pan()
    .onBegin(() => { isAnimating.value = false; hapticFired.value = false; })
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
    .onEnd((e) => { handleEnd(e.translationY, e.translationX); });

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
