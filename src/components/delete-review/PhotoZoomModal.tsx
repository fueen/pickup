import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Tokens } from '../../design-tokens';
import { PhotoAsset } from '../../types/photo';
import { resolvePlayableLivePhotoUri } from '../../utils/photo-asset-utils';
import { LivePhotoBadge } from '../ui/LivePhotoBadge';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  photo: PhotoAsset | null;
  onClose: () => void;
}

export function PhotoZoomModal({ visible, photo, onClose }: Props) {
  const [displayScale, setDisplayScale] = useState(1);
  const [livePlaying, setLivePlaying] = useState(false);
  const [liveFallbackVisible, setLiveFallbackVisible] = useState(false);
  const [playbackUri, setPlaybackUri] = useState<string | null>(photo?.pairedVideoUri ?? null);
  const videoSource = useMemo(
    () => (playbackUri ? { uri: playbackUri } : null),
    [playbackUri],
  );
  const player = useVideoPlayer(videoSource, (nextPlayer) => {
    nextPlayer.loop = false;
    nextPlayer.muted = false;
  });
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
      setLivePlaying(false);
      setLiveFallbackVisible(false);
      setPlaybackUri(photo?.pairedVideoUri ?? null);
      try { player.pause(); } catch { /* ignore native player cleanup issues */ }
    }
  }, [photo?.id, player, scale, startScale, startX, startY, translateX, translateY, visible]);

  useEffect(() => {
    if (!visible) {
      setLivePlaying(false);
      try { player.pause(); } catch { /* ignore */ }
    }
  }, [player, visible]);

  useEffect(() => {
    if (!livePlaying) return undefined;

    const durationMs = Math.max(1800, Math.min(5000, (player.duration || 3) * 1000));
    const timer = setTimeout(() => {
      setLivePlaying(false);
      try { player.pause(); } catch { /* ignore */ }
    }, durationMs);

    return () => clearTimeout(timer);
  }, [livePlaying, player]);

  useEffect(() => {
    if (!livePlaying || !playbackUri) return;

    try {
      player.replay();
      player.play();
    } catch {
      setLivePlaying(false);
      setLiveFallbackVisible(true);
      setTimeout(() => setLiveFallbackVisible(false), 1600);
    }
  }, [livePlaying, playbackUri, player]);

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

  const handleLivePress = useCallback(async () => {
    if (!photo || photo.mediaType !== 'livePhoto') return;

    const uri = await resolvePlayableLivePhotoUri(photo, MediaLibrary.getAssetInfoAsync);

    if (!uri) {
      setLiveFallbackVisible(true);
      setTimeout(() => setLiveFallbackVisible(false), 1600);
      return;
    }

    setPlaybackUri(uri);
    setLiveFallbackVisible(false);
    setLivePlaying(true);
  }, [photo]);

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

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(320)
    .maxDelay(280)
    .onEnd(() => {
      const zoomed = scale.value > 1.05;
      scale.value = withTiming(zoomed ? 1 : 2, { duration: 180 });
      translateX.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(0, { duration: 180 });
    });

  const liveTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(240)
    .onEnd(() => {
      if (photo?.mediaType === 'livePhoto') {
        runOnJS(handleLivePress)();
      }
    });

  const composedGesture = Gesture.Simultaneous(
    Gesture.Simultaneous(pinchGesture, panGesture),
    Gesture.Exclusive(doubleTapGesture, liveTapGesture),
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
      <GestureHandlerRootView style={styles.modalRoot}>
        <View style={styles.backdrop}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <MaterialCommunityIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          {photo.mediaType === 'livePhoto' && (
            <View style={styles.liveBadgeWrap}>
              <LivePhotoBadge onPress={handleLivePress} playing={livePlaying} />
            </View>
          )}

          {displayScale > 1.05 && (
            <View style={[styles.zoomBadge, photo.mediaType === 'livePhoto' && styles.zoomBadgeWithLive]}>
              <MaterialCommunityIcons name="magnify-plus" size={14} color="#000" />
              <Text style={styles.zoomBadgeText}>{displayScale.toFixed(1)}x</Text>
            </View>
          )}

          <GestureDetector gesture={composedGesture}>
            <Animated.View key={photo.id} style={styles.zoomStage}>
              <Animated.Image
                source={{ uri: photo.uri }}
                style={[{ width: displayWidth, height: displayHeight }, imageStyle]}
                resizeMode="contain"
              />
              {photo.mediaType === 'livePhoto' && playbackUri && livePlaying && (
                <VideoView
                  player={player}
                  style={[styles.liveVideo, { width: displayWidth, height: displayHeight }]}
                  contentFit="contain"
                  nativeControls={false}
                />
              )}
            </Animated.View>
          </GestureDetector>

          {liveFallbackVisible && (
            <View style={styles.liveFallback}>
              <Text style={styles.liveFallbackText}>Live Photo 暂时无法播放</Text>
            </View>
          )}

          <View style={styles.hintBar} pointerEvents="none">
            <Text style={styles.hintText}>
              {displayScale < 1.05 ? '双击 / 双指捏合缩放' : '拖动查看细节 · 双击还原'}
            </Text>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
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
  liveBadgeWrap: {
    position: 'absolute',
    top: 54,
    left: 16,
    zIndex: 10,
  },
  zoomBadge: {
    position: 'absolute',
    top: 54,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Tokens.color.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
  },
  zoomBadgeWithLive: {
    top: 106,
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
  liveVideo: {
    position: 'absolute',
  },
  liveFallback: {
    position: 'absolute',
    top: 106,
    left: 16,
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  liveFallbackText: {
    fontSize: 12,
    fontWeight: '800',
    color: Tokens.color.textPrimary,
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
