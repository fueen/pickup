import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS, Easing } from 'react-native-reanimated';
import { Tokens } from '../../design-tokens';
import { DeleteOverlay } from './DeleteOverlay';
import { ActionIndicator } from './ActionIndicator';
import { useHaptics } from '../../hooks/useHaptics';
import { SwipeEffect, getSwipeEffect } from '../../services/preferences-service';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  children: React.ReactNode;
  onMarkDelete: () => void;
  onMarkKeep: () => void;
  onSkip: () => void;
  onPrevious: () => void;
  isMarkedForDelete: boolean;
  onUnmarkDelete: () => void;
}

export function SwipeableCard({
  children, onMarkDelete, onMarkKeep, onSkip, onPrevious,
  isMarkedForDelete, onUnmarkDelete,
}: Props) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotationZ = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const markProgress = useSharedValue(0);
  const skipProgress = useSharedValue(0);
  const isAnimating = useSharedValue(false);
  const hapticFired = useSharedValue(false);
  const swipeEffectSV = useSharedValue<SwipeEffect>('default');
  const { impactMedium } = useHaptics();

  const [, setSwipeEffectState] = useState<SwipeEffect>('default');

  useEffect(() => {
    getSwipeEffect().then((effect) => {
      setSwipeEffectState(effect);
      swipeEffectSV.value = effect;
    });
  }, [swipeEffectSV]);

  const handleEnd = useCallback((ty: number, tx: number) => {
    'worklet';
    if (isAnimating.value) return;

    const isSmooth = swipeEffectSV.value === 'smooth';
    const hDuration = isSmooth ? 200 : 250;
    const vDuration = isSmooth ? 250 : 300;
    const snapDuration = isSmooth ? 250 : 300;

    const absTY = Math.abs(ty);
    const absTX = Math.abs(tx);
    const threshold = Tokens.photo.markThreshold * 200;

    // Prefer horizontal (skip) only when clearly horizontal
    const isHorizontal = absTX > 80 && absTX > absTY * 1.2;

    if (isHorizontal) {
      isAnimating.value = true;
      const goingLeft = tx < 0;
      const direction = goingLeft ? -1 : 1;
      rotationZ.value = withTiming(direction * 12, { duration: hDuration, easing: Easing.out(Easing.cubic) });
      cardScale.value = withTiming(0.82, { duration: hDuration, easing: Easing.out(Easing.cubic) });
      translateX.value = withTiming(direction * SCREEN_WIDTH * 1.5, {
        duration: hDuration,
        easing: Easing.out(Easing.cubic),
      }, () => {
        translateX.value = 0;
        translateY.value = 0;
        markProgress.value = 0;
        skipProgress.value = 0;
        rotationZ.value = 0;
        cardScale.value = 1;
        isAnimating.value = false;
        runOnJS(goingLeft ? onSkip : onPrevious)();
      });
    } else if (absTY >= threshold) {
      // Down swipe on a marked photo = unmark (undo delete)
      if (ty > 0 && isMarkedForDelete) {
        isAnimating.value = true;
        translateY.value = withTiming(SCREEN_HEIGHT * 1.5, { duration: vDuration }, () => {
          translateY.value = 0;
          translateX.value = 0;
          markProgress.value = 0;
          skipProgress.value = 0;
          isAnimating.value = false;
          runOnJS(onUnmarkDelete)();
        });
      } else {
        // Up = delete, Down = keep
        isAnimating.value = true;
        const direction = ty < 0 ? -1 : 1;
        translateY.value = withTiming(direction * SCREEN_HEIGHT * 1.5, { duration: vDuration }, () => {
          skipProgress.value = 0;
          isAnimating.value = false;
          runOnJS(direction < 0 ? onMarkDelete : onMarkKeep)();
        });
      }
    } else {
      // Snap back with spring
      translateY.value = withSpring(0, { damping: 18, stiffness: 250 });
      translateX.value = withSpring(0, { damping: 18, stiffness: 250 });
      rotationZ.value = withSpring(0, { damping: 15, stiffness: 200 });
      cardScale.value = withSpring(1, { damping: 15, stiffness: 200 });
      markProgress.value = 0;
      skipProgress.value = 0;
    }
  }, [onMarkDelete, onMarkKeep, onSkip, onPrevious, isMarkedForDelete, onUnmarkDelete]);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      hapticFired.value = false;
    })
    .onUpdate((e) => {
      if (isAnimating.value) return;
      translateY.value = e.translationY * 0.8;
      translateX.value = e.translationX * 0.8;
      const dx = e.translationX;
      const dy = e.translationY;
      const maxDist = 200;
      const isHorizontal = Math.abs(dx) > Math.abs(dy) * 1.2;
      if (isHorizontal) {
        const progressX = Math.max(-1, Math.min(1, dx / maxDist));
        skipProgress.value = progressX;
        markProgress.value = 0;
        rotationZ.value = progressX * 8;
        cardScale.value = 1 - Math.abs(progressX) * 0.08;
      } else {
        const progressY = Math.max(-1, Math.min(1, dy / maxDist));
        markProgress.value = Math.abs(dy) > Math.abs(dx) * 1.2 ? progressY : 0;
        skipProgress.value = 0;
        rotationZ.value = 0;
        cardScale.value = 1;
      }
      const overThreshold = Math.abs(markProgress.value) >= Tokens.photo.markThreshold
        || Math.abs(skipProgress.value) >= Tokens.photo.markThreshold;
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
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotateZ: `${rotationZ.value}deg` },
      { scale: cardScale.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <Animated.View style={[styles.cardInner, cardStyle]}>
          {children}
        </Animated.View>
        <DeleteOverlay progress={markProgress} />
        <ActionIndicator progress={markProgress} isMarkedForDelete={isMarkedForDelete} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: SCREEN_WIDTH, height: SCREEN_HEIGHT, backgroundColor: '#000000' },
  cardInner: { flex: 1, width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
});
