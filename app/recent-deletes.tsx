import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRecentDeletes } from '../src/services/stats-service';
import { PhotoDetailSheet } from '../src/components/delete-review/PhotoDetailSheet';
import { LoadingGate } from '../src/components/photo-card/LoadingGate';
import { Tokens } from '../src/design-tokens';
import { DeletedPhotoRecord } from '../src/types/photo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING = 16;
const GAP = 4;
const COLUMNS = 3;
const IMAGE_SIZE = (SCREEN_WIDTH - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

export default function RecentDeletesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<DeletedPhotoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedUris, setFailedUris] = useState<Set<string>>(new Set());
  const [detailPhoto, setDetailPhoto] = useState<{
    creationTime: number; width: number; height: number; fileSize?: number; filename?: string;
  } | null>(null);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    setFailedUris(new Set());
    getRecentDeletes().then(setRecords).finally(() => setLoading(false));
  }, []));

  const handleImageError = useCallback((uri: string) => {
    setFailedUris((prev) => {
      if (prev.has(uri)) return prev;
      const next = new Set(prev);
      next.add(uri);
      return next;
    });
  }, []);

  const renderItem = useCallback(({ item }: { item: DeletedPhotoRecord }) => {
    const isFailed = failedUris.has(item.uri);
    return (
      <TouchableOpacity
        style={styles.thumbnailWrap}
        onPress={() => setDetailPhoto({
          creationTime: item.creationTime,
          width: item.width,
          height: item.height,
          fileSize: item.fileSize > 0 ? item.fileSize : undefined,
        })}
        activeOpacity={0.7}
      >
        {isFailed ? (
          <View style={styles.placeholder}>
            <MaterialCommunityIcons name="image-off-outline" size={24} color={Tokens.color.textMuted} />
          </View>
        ) : (
          <Image
            source={{ uri: item.uri }}
            style={styles.thumbnail}
            onError={() => handleImageError(item.uri)}
          />
        )}
      </TouchableOpacity>
    );
  }, [failedUris, handleImageError]);

  if (loading) return <LoadingGate />;

  return (
    <View style={styles.container}>
      <View style={[styles.backBtn, { top: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={[styles.title, { marginTop: insets.top + 20 }]} numberOfLines={1} ellipsizeMode="tail">
        {records.length > 0 ? `最近删除 · ${records.length} 张` : '最近删除'}
      </Text>

      {records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="delete-outline" size={64} color={Tokens.color.textMuted} />
          <Text style={styles.emptyTitle}>暂无删除记录</Text>
          <Text style={styles.emptySubtitle}>删除照片后会在这里显示</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          numColumns={COLUMNS}
          keyExtractor={(item) => `${item.id}_${item.deletedAt}`}
          contentContainerStyle={{ paddingHorizontal: PADDING, paddingBottom: 100 }}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}

      <PhotoDetailSheet
        visible={detailPhoto !== null}
        photo={detailPhoto}
        onClose={() => setDetailPhoto(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Tokens.color.background },
  backBtn: {
    position: 'absolute', left: 16, width: 40, height: 40,
    borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center', zIndex: 20,
  },
  title: {
    ...Tokens.typography.headline,
    color: Tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 4,
    paddingHorizontal: 56,
  },
  thumbnailWrap: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Tokens.color.surface,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Tokens.color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
  },
  emptyTitle: {
    ...Tokens.typography.title,
    color: Tokens.color.textPrimary,
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtitle: {
    ...Tokens.typography.caption,
    color: Tokens.color.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
