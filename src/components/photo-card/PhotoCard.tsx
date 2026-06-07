import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { Tokens } from '../../design-tokens';
import { PhotoAsset } from '../../types/photo';
import { formatPhotoDate } from '../../utils/date-utils';
import { LivePhotoBadge } from '../ui/LivePhotoBadge';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CARD_H_PADDING = 24;
const CARD_TOP = 80;
const CARD_BOTTOM = 76;
const MAX_IMG_W = SCREEN_WIDTH - CARD_H_PADDING * 2;
const MAX_IMG_H = SCREEN_HEIGHT - CARD_TOP - CARD_BOTTOM;

function getDisplaySize(photo: PhotoAsset) {
  if (!photo.width || !photo.height) {
    return { width: MAX_IMG_W, height: MAX_IMG_W };
  }
  const ratio = photo.width / photo.height;
  let w = MAX_IMG_W;
  let h = w / ratio;
  if (h > MAX_IMG_H) {
    h = MAX_IMG_H;
    w = h * ratio;
  }
  return { width: w, height: h };
}

interface Props { photo: PhotoAsset; hideHeader?: boolean; }

export function PhotoHeader({ photo }: { photo: PhotoAsset }) {
  return (
    <View style={styles.header}>
      <Text style={styles.date} numberOfLines={1} ellipsizeMode="tail">{formatPhotoDate(photo.creationTime)}</Text>
    </View>
  );
}

export function PhotoCard({ photo, hideHeader }: Props) {
  const displaySize = getDisplaySize(photo);

  return (
    <View style={styles.container}>
      {!hideHeader && <PhotoHeader photo={photo} />}

      <View style={styles.card}>
        <View style={[styles.imageWrap, { width: displaySize.width, height: displaySize.height }]}>
        <Image
          source={{ uri: photo.uri }}
          style={styles.image}
          resizeMode="cover"
        />
        {photo.mediaType === 'livePhoto' && (
          <View style={styles.liveBadgeWrap}>
            <LivePhotoBadge disabled />
          </View>
        )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: Tokens.color.background,
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 54,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  date: {
    fontSize: 15,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 4,
    textAlign: 'center',
    maxWidth: '80%',
  },
  card: {
    position: 'absolute',
    top: CARD_TOP,
    left: CARD_H_PADDING,
    right: CARD_H_PADDING,
    bottom: CARD_BOTTOM,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#0a0a0a',
  },
  imageWrap: {
    position: 'relative',
  },
  liveBadgeWrap: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
});
