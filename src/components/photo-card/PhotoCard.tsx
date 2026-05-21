import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { Tokens } from '../../design-tokens';
import { PhotoAsset } from '../../types/photo';
import { formatPhotoDate } from '../../utils/date-utils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props { photo: PhotoAsset; }

function getResizeMode(w: number, h: number): 'cover' | 'contain' {
  if (w <= 0 || h <= 0) return 'cover';
  if (w / h > 1.2) return 'contain';
  return 'cover';
}

export function PhotoCard({ photo }: Props) {
  const resizeMode = getResizeMode(photo.width, photo.height);
  return (
    <View style={styles.container}>
      <Image source={{ uri: photo.uri }} style={styles.image} resizeMode={resizeMode} />
      <View style={styles.header}>
        <Text style={styles.date}>{formatPhotoDate(photo.creationTime)}</Text>
      </View>
      {photo.mediaType === 'livePhoto' && (
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, backgroundColor: Tokens.color.background, justifyContent: 'center', alignItems: 'center' },
  image: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.75 },
  header: { position: 'absolute', top: 60, left: Tokens.spacing.l, right: Tokens.spacing.l },
  date: { ...Tokens.typography.caption, color: Tokens.color.textSecondary, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 4 },
  liveBadge: { position: 'absolute', top: 60, right: Tokens.spacing.l, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: Tokens.spacing.s, paddingVertical: 2, borderRadius: Tokens.radius.button },
  liveText: { ...Tokens.typography.caption, color: Tokens.color.textPrimary, fontWeight: '700' },
});
