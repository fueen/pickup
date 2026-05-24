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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 10;
const PADDING = 16;
const COLUMN_COUNT = 3;
const CARD_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

interface AlbumItem {
  id: string;
  title: string;
  assetCount: number;
  coverUri: string | null;
}

export default function AlbumPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setSelectedAlbum } = usePhotoContext();
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'limited' | 'denied'>('undetermined');
  const { dailyUsageLoaded } = useSubscriptionContext();

  useEffect(() => {
    MediaLibrary.getPermissionsAsync().then(({ status }) => {
      const s: string = status;
      if (s === 'granted' || s === 'limited' || s === 'denied') {
        setPermissionStatus(s as any);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (permissionStatus !== 'granted' && permissionStatus !== 'limited') return;
    (async () => {
      try {
        const albumList = await MediaLibrary.getAlbumsAsync();
        const items: AlbumItem[] = [];

        const allCount = await MediaLibrary.getAssetsAsync({
          mediaType: ['photo'],
          first: 1,
        });
        const allCover = allCount.assets[0]?.uri ?? null;
        items.push({
          id: '__all__',
          title: '所有照片',
          assetCount: allCount.totalCount,
          coverUri: allCover,
        });

        for (const album of albumList) {
          const cover = await MediaLibrary.getAssetsAsync({
            album: album.id,
            mediaType: ['photo'],
            first: 1,
          });
          items.push({
            id: album.id,
            title: album.title,
            assetCount: album.assetCount,
            coverUri: cover.assets[0]?.uri ?? null,
          });
        }

        setAlbums(items);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [permissionStatus]);

  const handlePickAlbum = (album: AlbumItem) => {
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
        columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handlePickAlbum(item)} activeOpacity={0.7}>
            <View style={styles.coverWrap}>
              {item.coverUri ? (
                <Image source={{ uri: item.coverUri }} style={styles.cover} />
              ) : (
                <MaterialCommunityIcons name="image-outline" size={32} color={Tokens.color.textMuted} />
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
    width: CARD_WIDTH, height: CARD_WIDTH, borderRadius: 12,
    backgroundColor: Tokens.color.surface, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  cover: { width: '100%', height: '100%', resizeMode: 'cover' },
  albumName: {
    ...Tokens.typography.caption, color: Tokens.color.textPrimary,
    marginTop: 6, maxWidth: CARD_WIDTH,
  },
  albumCount: { fontSize: 11, color: Tokens.color.textMuted, marginTop: 2 },
});
