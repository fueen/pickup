import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Tokens } from '../../design-tokens';
import { PhotoAsset } from '../../types/photo';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  photo: PhotoAsset | null;
  onClose: () => void;
}

export function PhotoZoomModal({ visible, photo, onClose }: Props) {
  const [displayScale, setDisplayScale] = useState(1);
  const scale = useSharedValue(1);
  const startScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = 1;
      startScale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      startX.value = 0;
      startY.value = 0;
      setDisplayScale(1);
    }
  }, [photo?.id, visible]);

  // Calculate display size matching the natural aspect ratio
  const imageAspect = photo && photo.width > 0 && photo.height > 0 ? photo.width / photo.height : 1;
  let displayWidth = SCREEN_WIDTH;
  let displayHeight = displayWidth / imageAspect;

  if (displayHeight > SCREEN_HEIGHT) {
    displayHeight = SCREEN_HEIGHT;
    displayWidth = displayHeight * imageAspect;
  }

  const clampTranslation = (value: number, imageSize: number, viewportSize: number, currentScale: number) => {
    'worklet';
    const max = Math.max(0, (imageSize * currentScale - viewportSize) / 2);
    return Math.min(max, Math.max(-max, value));
  };

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      startScale.value = scale.value;
    })
    .onUpdate((event) => {
      const nextScale = Math.min(5, Math.max(1, startScale.value * event.scale));
      scale.value = nextScale;
      translateX.value = clampTranslation(translateX.value, displayWidth, SCREEN_WIDTH, nextScale);
      translateY.value = clampTranslation(translateY.value, displayHeight, SCREEN_HEIGHT, nextScale);
    })
    .onEnd(() => {
      if (scale.value <= 1.01) {
        scale.value = withTiming(1, { duration: 160 });
        translateX.value = withTiming(0, { duration: 160 });
        translateY.value = withTiming(0, { duration: 160 });
      } else {
        translateX.value = withTiming(
          clampTranslation(translateX.value, displayWidth, SCREEN_WIDTH, scale.value),
          { duration: 120 },
        );
        translateY.value = withTiming(
          clampTranslation(translateY.value, displayHeight, SCREEN_HEIGHT, scale.value),
          { duration: 120 },
        );
      }
    });

  const panGesture = Gesture.Pan()
    .minPointers(1)
    .onBegin(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (scale.value <= 1.01) return;
      translateX.value = clampTranslation(startX.value + event.translationX, displayWidth, SCREEN_WIDTH, scale.value);
      translateY.value = clampTranslation(startY.value + event.translationY, displayHeight, SCREEN_HEIGHT, scale.value);
    });

  const twoFingerTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .minPointers(2)
    .maxDuration(260)
    .onEnd(() => {
      const zoomed = scale.value > 1.05;
      scale.value = withTiming(zoomed ? 1 : 2, { duration: 180 });
      translateX.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(0, { duration: 180 });
    });

  const singleTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(260)
    .onEnd(() => {
      if (scale.value <= 1.05) {
        runOnJS(onClose)();
      }
    });

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    Gesture.Exclusive(twoFingerTapGesture, singleTapGesture),
  );

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  useAnimatedReaction(
    () => Math.round(scale.value * 10) / 10,
    (nextScale, previousScale) => {
      if (nextScale !== previousScale) {
        runOnJS(setDisplayScale)(nextScale);
      }
    },
  );

  if (!photo) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        {/* Close button — top right */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
          <MaterialCommunityIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Zoom level badge */}
        {displayScale > 1.05 && (
          <View style={styles.zoomBadge}>
            <MaterialCommunityIcons name="magnify-plus" size={14} color="#000" />
            <Text style={styles.zoomBadgeText}>{displayScale.toFixed(1)}×</Text>
          </View>
        )}

        <GestureDetector gesture={composedGesture}>
          <Animated.View
            key={photo.id}
            style={styles.zoomStage}
          >
            <Animated.Image
              source={{ uri: photo.uri }}
              style={[{ width: displayWidth, height: displayHeight }, imageStyle]}
              resizeMode="contain"
            />
          </Animated.View>
        </GestureDetector>

        {/* Hint */}
        <View style={styles.hintBar}>
          <Text style={styles.hintText}>
            {displayScale < 1.05 ? '双指捏合 / 双指点击缩放 · 单击关闭' : '拖动查看细节 · 双指点击还原'}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 54,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  zoomBadge: {
    position: 'absolute',
    top: 54,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFCC00',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
  },
  zoomBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  zoomStage: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
  },
});
