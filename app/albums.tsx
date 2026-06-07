import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubscriptionContext } from '../src/contexts/SubscriptionContext';
import { usePhotoContext } from '../src/contexts/PhotoContext';
import { LoadingGate } from '../src/components/photo-card/LoadingGate';
import { Tokens } from '../src/design-tokens';
import { toVisibleAlbumItems, VisibleAlbumItem } from '../src/utils/album-utils';
import { AlbumMosaicCard } from '../src/components/albums/AlbumMosaicCard';

const COVER_COUNT = 6;

async function getAlbumPreview(albumId?: string): Promise<{ totalCount: number; coverUri: string | null; coverUris: string[] }> {
  const page = await MediaLibrary.getAssetsAsync({
    album: albumId,
    mediaType: ['photo'],
    first: COVER_COUNT,
  });

  const coverUris = page.assets.map((asset) => asset.uri).filter(Boolean);

  return {
    totalCount: page.totalCount,
    coverUri: coverUris[0] ?? null,
    coverUris,
  };
}

export default function AlbumPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setSelectedAlbum } = usePhotoContext();
  const [albums, setAlbums] = useState<VisibleAlbumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { dailyUsageLoaded } = useSubscriptionContext();

  useEffect(() => {
    let isActive = true;

    (async () => {
      try {
        const albumList = await MediaLibrary.getAlbumsAsync();
        const validAlbums: VisibleAlbumItem[] = [];
        const allPhotosPreview = await getAlbumPreview();

        for (const album of albumList) {
          if (!album.id || !album.title || album.assetCount <= 0) continue;

          try {
            const preview = await getAlbumPreview(album.id);
            validAlbums.push({
              id: album.id,
              title: album.title,
              assetCount: preview.totalCount || album.assetCount,
              coverUri: preview.coverUri,
              coverUris: preview.coverUris,
            });
          } catch {
            // Skip albums that the system returns but the app cannot read.
          }
        }

        if (!isActive) return;
        setAlbums(toVisibleAlbumItems({
          allPhotos: {
            totalCount: allPhotosPreview.totalCount,
            coverUri: allPhotosPreview.coverUri,
            coverUris: allPhotosPreview.coverUris,
          },
          albums: validAlbums,
        }));
      } catch {
        if (isActive) setAlbums([]);
      } finally {
        if (isActive) setLoading(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, []);

  const handlePickAlbum = (album: VisibleAlbumItem) => {
    setSelectedAlbum({ id: album.id, title: album.title });
    router.back();
  };

  if (!dailyUsageLoaded) return <LoadingGate />;
  if (loading) return <LoadingGate />;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.topGlow} pointerEvents="none" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.back()}
          activeOpacity={0.72}
          accessibilityRole="button"
          accessibilityLabel="返回"
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color={Tokens.color.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>相册</Text>
          <Text style={styles.subtitle}>选择一个相册开始整理</Text>
        </View>
        <View style={styles.navButton}>
          <MaterialCommunityIcons name="image-multiple-outline" size={22} color={Tokens.color.accent} />
        </View>
      </View>

      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 42 },
        ]}
        renderItem={({ item }) => (
          <AlbumMosaicCard album={item} onPress={handlePickAlbum} />
        )}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <MaterialCommunityIcons name="image-off-outline" size={38} color={Tokens.color.textMuted} />
            <Text style={styles.emptyText}>还没有可选择的相册</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.color.background,
  },
  topGlow: {
    position: 'absolute',
    top: -90,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(168,212,111,0.16)',
  },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Tokens.color.surfaceGlass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Tokens.color.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
    letterSpacing: 0,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: Tokens.color.textSecondary,
  },
  listContent: {
    paddingHorizontal: 18,
  },
  empty: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '800',
    color: Tokens.color.textSecondary,
  },
});
