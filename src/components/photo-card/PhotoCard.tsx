import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { Tokens } from '../../design-tokens';
import { PhotoAsset } from '../../types/photo';
import { formatPhotoDate } from '../../utils/date-utils';

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

interface Props { photo: PhotoAsset; }

export function PhotoCard({ photo }: Props) {
  const displaySize = getDisplaySize(photo);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date} numberOfLines={1} ellipsizeMode="tail">{formatPhotoDate(photo.creationTime)}</Text>
        {photo.mediaType === 'livePhoto' && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Image
          source={{ uri: photo.uri }}
          style={[styles.image, { width: displaySize.width, height: displaySize.height }]}
          resizeMode="cover"
        />
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
    fontSize: 14,
    fontWeight: '600',
    color: Tokens.color.textPrimary,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 4,
    textAlign: 'center',
    maxWidth: '80%',
  },
  liveBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Tokens.spacing.s,
    paddingVertical: 2,
    borderRadius: Tokens.radius.button,
  },
  liveText: {
    ...Tokens.typography.caption,
    color: Tokens.color.textPrimary,
    fontWeight: '700',
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
    borderRadius: 24,
    backgroundColor: '#0a0a0a',
  },
});
