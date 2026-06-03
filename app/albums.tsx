import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 12;
const PADDING = 16;
const COLUMN_COUNT = 2;
const CARD_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

export default function AlbumPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setSelectedAlbum } = usePhotoContext();
  const [albums, setAlbums] = useState<VisibleAlbumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { dailyUsageLoaded } = useSubscriptionContext();

  useEffect(() => {
    (async () => {
      try {
        const albumList = await MediaLibrary.getAlbumsAsync();
        const validAlbums: VisibleAlbumItem[] = [];

        const allPhotosPage = await MediaLibrary.getAssetsAsync({
          mediaType: ['photo'],
          first: 1,
        });

        for (const album of albumList) {
          if (!album.id || !album.title || album.assetCount <= 0) continue;
          try {
            const cover = await MediaLibrary.getAssetsAsync({
              album: album.id,
              mediaType: ['photo'],
              first: 1,
            });
            const coverUri = cover.assets[0]?.uri ?? null;
            validAlbums.push({
              id: album.id,
              title: album.title,
              assetCount: cover.totalCount || album.assetCount,
              coverUri,
            });
          } catch {
            // Skip albums that the system returns but the app cannot read.
          }
        }

        setAlbums(toVisibleAlbumItems({
          allPhotos: {
            totalCount: allPhotosPage.totalCount,
            coverUri: allPhotosPage.assets[0]?.uri ?? null,
          },
          albums: validAlbums,
        }));
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handlePickAlbum = (album: VisibleAlbumItem) => {
    setSelectedAlbum({ id: album.id, title: album.title });
    router.back();
  };

  if (!dailyUsageLoaded) return <LoadingGate />;
  if (loading) return <LoadingGate />;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={[styles.backBtn, { top: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>相册</Text>
      <FlatList
        data={albums}
        numColumns={COLUMN_COUNT}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: PADDING, paddingBottom: 100 }}
        columnWrapperStyle={{ gap: GAP, marginBottom: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handlePickAlbum(item)} activeOpacity={0.7}>
            <View style={styles.coverWrap}>
              {item.coverUri ? (
                <Image source={{ uri: item.coverUri }} style={styles.cover} />
              ) : (
                <MaterialCommunityIcons name="image-outline" size={48} color={Tokens.color.textMuted} />
              )}
            </View>
            <Text style={styles.albumName} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.albumCount}>{item.assetCount}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Tokens.color.background },
  backBtn: { position: 'absolute', left: 16, zIndex: 20 },
  title: {
    ...Tokens.typography.headline,
    color: Tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 4,
  },
  card: { width: CARD_WIDTH, alignItems: 'center' },
  coverWrap: {
    width: CARD_WIDTH, height: CARD_WIDTH, borderRadius: 16,
    backgroundColor: Tokens.color.surface, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  cover: { width: '100%', height: '100%', resizeMode: 'cover' },
  albumName: {
    ...Tokens.typography.caption, color: Tokens.color.textPrimary,
    marginTop: 8, maxWidth: CARD_WIDTH,
  },
  albumCount: { fontSize: 11, color: Tokens.color.textMuted, marginTop: 2 },
});
