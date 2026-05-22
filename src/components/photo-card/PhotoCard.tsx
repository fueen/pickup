import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { Tokens } from '../../design-tokens';
import { PhotoAsset } from '../../types/photo';
import { formatPhotoDate } from '../../utils/date-utils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props { photo: PhotoAsset; }

export function PhotoCard({ photo }: Props) {
  return (
    <View style={styles.container}>
      {/* Date and LIVE badge outside the photo card */}
      <View style={styles.header}>
        <Text style={styles.date}>{formatPhotoDate(photo.creationTime)}</Text>
        {photo.mediaType === 'livePhoto' && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* Rounded photo card */}
      <View style={styles.card}>
        <Image
          source={{ uri: photo.uri }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const CARD_H_PADDING = 24;
const CARD_TOP = 148;
const CARD_BOTTOM = 240;

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
    justifyContent: 'space-between',
    zIndex: 10,
  },
  date: {
    fontSize: 21,
    fontWeight: '600',
    color: Tokens.color.textPrimary,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 4,
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
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
