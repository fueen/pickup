import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tokens } from '../../design-tokens';
import { VisibleAlbumItem } from '../../utils/album-utils';

interface Props {
  album: VisibleAlbumItem;
  onPress: (album: VisibleAlbumItem) => void;
}

export function AlbumMosaicCard({ album, onPress }: Props) {
  const covers = album.coverUris.length > 0 ? album.coverUris.slice(0, 6) : [];
  const remainingCount = Math.max(0, album.assetCount - covers.length);
  const tilePatterns = [
    styles.tileSmall,
    styles.tileSmall,
    styles.tileTall,
    styles.tileWide,
    styles.tileLarge,
    styles.tileSmall,
  ];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(album)}
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={`选择相册 ${album.title}`}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title} numberOfLines={1}>{album.title}</Text>
          <Text style={styles.subtitle}>{album.assetCount} 张照片</Text>
        </View>
        <View style={styles.chevron}>
          <MaterialCommunityIcons name="chevron-right" size={22} color={Tokens.color.textPrimary} />
        </View>
      </View>

      <View style={styles.mosaic}>
        {covers.length === 0 ? (
          <View style={[styles.placeholder, styles.tileLarge]}>
            <MaterialCommunityIcons name="image-outline" size={32} color={Tokens.color.textMuted} />
          </View>
        ) : (
          covers.map((uri, index) => (
            <Image
              key={`${album.id}-${uri}-${index}`}
              source={{ uri }}
              style={[styles.tile, tilePatterns[index] ?? styles.tileSmall]}
              resizeMode="cover"
            />
          ))
        )}
        {remainingCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>+{remainingCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
  },
  header: {
    minHeight: 44,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
    letterSpacing: 0,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: Tokens.color.textSecondary,
  },
  chevron: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Tokens.color.surfaceGlass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Tokens.color.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mosaic: {
    height: 178,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    overflow: 'hidden',
  },
  tile: {
    borderRadius: 12,
    backgroundColor: Tokens.color.surface,
  },
  tileSmall: {
    width: '18%',
    height: 52,
  },
  tileTall: {
    width: '24%',
    height: 111,
  },
  tileWide: {
    width: '36%',
    height: 52,
  },
  tileLarge: {
    width: '40%',
    height: 111,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: Tokens.color.surfaceElevated,
  },
  countBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    minWidth: 54,
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(168,212,111,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.36)',
  },
  countText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#101405',
  },
});
