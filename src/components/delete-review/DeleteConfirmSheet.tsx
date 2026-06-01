import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tokens } from '../../design-tokens';
import { PhotoAsset } from '../../types/photo';
import { buildDeleteConfirmCopy, getDeletePreviewPhotos } from '../../utils/delete-confirm-utils';

interface Props {
  visible: boolean;
  count: number;
  loading: boolean;
  photos?: PhotoAsset[];
  onConfirm: () => void;
  onCancel: () => void;
  onOpenList?: () => void;
}

const STACK_ROTATIONS = ['-5deg', '4deg', '0deg'];
const STACK_OFFSETS = [
  { top: -26, left: 26 },
  { top: -12, left: -20 },
  { top: 0, left: 0 },
];

export function DeleteConfirmSheet({ visible, count, loading, photos = [], onConfirm, onCancel, onOpenList }: Props) {
  const [render, setRender] = useState(false);
  const insets = useSafeAreaInsets();
  const overlayOpacity = useSharedValue(0);
  const contentTranslate = useSharedValue(24);
  const contentOpacity = useSharedValue(0);
  const confirmedRef = useRef(false);
  const prevVisible = useRef(false);

  const previewPhotos = getDeletePreviewPhotos(photos);
  const copy = buildDeleteConfirmCopy(photos.length > 0 ? photos : []);
  const subtitle = photos.length > 0 ? copy.subtitle : `删除你刚归档的 ${count} 张照片。`;
  const primaryLabel = photos.length > 0 ? copy.primaryLabel : `Delete ${count} 张`;

  useEffect(() => {
    if (visible === prevVisible.current) return;
    prevVisible.current = visible;

    if (visible) {
      confirmedRef.current = false;
      setRender(true);
      overlayOpacity.value = withTiming(1, { duration: 260 });
      contentTranslate.value = withTiming(0, { duration: 300 });
      contentOpacity.value = withTiming(1, { duration: 300 });
    } else if (render) {
      overlayOpacity.value = withTiming(0, { duration: 180 });
      contentTranslate.value = withTiming(18, { duration: 180 });
      contentOpacity.value = withTiming(0, { duration: 180 }, () => {
        runOnJS(setRender)(false);
      });
    }
  }, [visible, render]);

  useEffect(() => {
    if (!loading) {
      confirmedRef.current = false;
    }
  }, [loading]);

  const handleConfirm = () => {
    if (confirmedRef.current || loading) return;
    confirmedRef.current = true;
    onConfirm();
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslate.value }],
  }));

  if (!render) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onCancel}>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <View style={styles.backdropPanel} pointerEvents="none" />
        <View style={styles.warmGlow} pointerEvents="none" />
        <View style={styles.coolGlow} pointerEvents="none" />
        <View style={styles.lineGlowTop} pointerEvents="none" />

        <Animated.View style={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 22 }, contentStyle]}>
          <TouchableOpacity
            style={[styles.backButton, { top: Math.max(0, insets.top - 16) }]}
            onPress={onCancel}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="取消删除"
          >
            <MaterialCommunityIcons name="chevron-left" size={34} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <TouchableOpacity
            style={styles.previewArea}
            activeOpacity={onOpenList ? 0.86 : 1}
            onPress={onOpenList}
            disabled={!onOpenList || previewPhotos.length === 0}
            accessibilityRole="button"
            accessibilityLabel="查看待删除照片列表"
          >
            {previewPhotos.length > 0 ? (
              <View style={styles.stackFrame}>
                {previewPhotos.map((photo, index) => {
                  const visualIndex = previewPhotos.length - 1 - index;
                  return (
                    <Image
                      key={photo.id}
                      source={{ uri: photo.uri }}
                      style={[
                        styles.previewImage,
                        STACK_OFFSETS[index],
                        {
                          zIndex: index + 1,
                          transform: [{ rotate: STACK_ROTATIONS[index] }],
                          opacity: visualIndex === 0 ? 1 : 0.9,
                        },
                      ]}
                      resizeMode="cover"
                    />
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyPreview}>
                <MaterialCommunityIcons name="image-multiple-outline" size={52} color="rgba(255,255,255,0.72)" />
              </View>
            )}
            {onOpenList && photos.length > 1 && (
              <View style={styles.openListBadge}>
                <Text style={styles.openListText}>查看全部 {photos.length} 张</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.doubleCheckRow}>
            <MaterialCommunityIcons name="gesture-tap" size={20} color="rgba(255,255,255,0.34)" />
            <Text style={styles.doubleCheckText}>点击照片再次确认</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.helper}>{copy.helper}</Text>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && !loading && styles.primaryButtonPressed,
                loading && styles.primaryButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={`删除 ${count} 张照片`}
            >
              {loading ? (
                <ActivityIndicator color="#111111" />
              ) : (
                <MaterialCommunityIcons name="trash-can-outline" size={24} color={Tokens.color.danger} />
              )}
              <Text style={styles.primaryButtonText}>{loading ? 'Deleting...' : primaryLabel}</Text>
            </Pressable>

            <TouchableOpacity
              style={styles.laterButton}
              onPress={onCancel}
              activeOpacity={0.74}
              accessibilityRole="button"
              accessibilityLabel="稍后删除"
            >
              <Text style={styles.laterText}>稍后删除</Text>
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
    backgroundColor: '#10100F',
  },
  backdropPanel: {
    position: 'absolute',
    left: 22,
    right: 22,
    top: 92,
    bottom: 108,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  warmGlow: {
    position: 'absolute',
    left: -110,
    right: 40,
    top: 110,
    height: 360,
    borderRadius: 220,
    backgroundColor: 'rgba(255,204,0,0.09)',
  },
  coolGlow: {
    position: 'absolute',
    left: 90,
    right: -160,
    bottom: 150,
    height: 340,
    borderRadius: 180,
    backgroundColor: 'rgba(80,92,112,0.16)',
  },
  lineGlowTop: {
    position: 'absolute',
    left: 36,
    right: 36,
    top: 88,
    height: 1,
    backgroundColor: 'rgba(255,204,0,0.22)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
  },
  backButton: {
    position: 'absolute',
    left: 28,
    top: 54,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  header: {
    marginTop: 78,
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.56)',
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  previewArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 204,
    marginBottom: 16,
  },
  stackFrame: {
    width: 202,
    height: 202,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 24,
    backgroundColor: Tokens.color.surface,
    shadowColor: '#000',
    shadowOpacity: 0.38,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 16 },
  },
  emptyPreview: {
    width: 190,
    height: 190,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openListBadge: {
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.52)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  openListText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  doubleCheckRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  doubleCheckText: {
    color: 'rgba(255,255,255,0.32)',
    fontSize: 18,
    fontWeight: '900',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
  helper: {
    marginBottom: 22,
    color: 'rgba(255,255,255,0.40)',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  primaryButton: {
    alignSelf: 'center',
    width: '88%',
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
  },
  primaryButtonPressed: {
    opacity: 0.86,
  },
  primaryButtonDisabled: {
    opacity: 0.68,
  },
  primaryButtonText: {
    color: '#090909',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900',
  },
  laterButton: {
    alignSelf: 'center',
    minHeight: 48,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  laterText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
});
