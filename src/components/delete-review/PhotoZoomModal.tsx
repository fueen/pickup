import React, { useRef, useState } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tokens } from '../../design-tokens';
import { PhotoAsset } from '../../types/photo';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  photo: PhotoAsset | null;
  onClose: () => void;
}

export function PhotoZoomModal({ visible, photo, onClose }: Props) {
  const [zoomScale, setZoomScale] = useState(1);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scale = e.nativeEvent.zoomScale;
    if (scale !== undefined) {
      setZoomScale(scale);
    }
  };

  if (!photo) return null;

  // Calculate display size matching the natural aspect ratio
  const imageAspect = photo.width / photo.height;
  let displayWidth = SCREEN_WIDTH;
  let displayHeight = displayWidth / imageAspect;

  if (displayHeight > SCREEN_HEIGHT) {
    displayHeight = SCREEN_HEIGHT;
    displayWidth = displayHeight * imageAspect;
  }

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
        {zoomScale > 1.05 && (
          <View style={styles.zoomBadge}>
            <MaterialCommunityIcons name="magnify-plus" size={14} color="#000" />
            <Text style={styles.zoomBadgeText}>{zoomScale.toFixed(1)}×</Text>
          </View>
        )}

        {/* Pinch-to-zoom via ScrollView */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          maximumZoomScale={5}
          minimumZoomScale={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          bouncesZoom={false}
          centerContent
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              // Single tap on non-zoomed image closes the modal
              if (zoomScale < 1.05) {
                onClose();
              }
            }}
          >
            <Image
              source={{ uri: photo.uri }}
              style={{ width: displayWidth, height: displayHeight }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </ScrollView>

        {/* Hint */}
        <View style={styles.hintBar}>
          <Text style={styles.hintText}>
            {zoomScale < 1.05 ? '双指捏合缩放 · 单击关闭' : '单击还原'}
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
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flex: 1,
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
