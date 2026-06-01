import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePhotoContext } from '../src/contexts/PhotoContext';
import { useSessionContext } from '../src/contexts/SessionContext';
import { DeleteGrid } from '../src/components/delete-review/DeleteGrid';
import { EmptyReviewPlaceholder } from '../src/components/delete-review/EmptyReviewPlaceholder';
import { PhotoZoomModal } from '../src/components/delete-review/PhotoZoomModal';
import { Tokens } from '../src/design-tokens';
import { PhotoAsset } from '../src/types/photo';
import { DeleteConfirmSource } from '../src/utils/delete-confirm-utils';

export default function ReviewScreen() {
  const router = useRouter();
  const { confirmSource, returnToConfirm } = useLocalSearchParams<{
    confirmSource?: DeleteConfirmSource;
    returnToConfirm?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { currentGroup, markedForDelete, setMarkedForDelete } = usePhotoContext();
  const { dispatch } = useSessionContext();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewPhoto, setPreviewPhoto] = useState<PhotoAsset | null>(null);

  const photosInGroup = useMemo(
    () => currentGroup
      .filter((p) => markedForDelete.has(p.id))
      .sort((a, b) => b.creationTime - a.creationTime),
    [currentGroup, markedForDelete],
  );

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleRestoreSelected = useCallback(() => {
    if (selectedIds.size === 0) return;

    setMarkedForDelete((prev) => {
      const next = new Set(prev);
      selectedIds.forEach((id) => next.delete(id));
      return next;
    });

    const remainingCount = photosInGroup.filter((photo) => !selectedIds.has(photo.id)).length;
    setSelectedIds(new Set());

    if (remainingCount === 0) {
      dispatch({ type: 'RESET_SESSION' });
      router.replace('/');
    }
  }, [dispatch, photosInGroup, router, selectedIds, setMarkedForDelete]);

  const handleBack = useCallback(() => {
    if (returnToConfirm === '1' && markedForDelete.size > 0) {
      router.replace({
        pathname: '/',
        params: {
          confirmSource: confirmSource === 'group-complete' ? 'group-complete' : 'manual',
          showDeleteConfirm: Date.now().toString(),
        },
      });
      return;
    }

    router.replace('/');
  }, [confirmSource, markedForDelete.size, returnToConfirm, router]);

  const selectedCount = selectedIds.size;

  return (
    <View style={styles.container}>
      <View style={styles.topWash} pointerEvents="none" />
      <View style={styles.sideGlow} pointerEvents="none" />
      <View style={styles.gridPlate} pointerEvents="none" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.72}
          accessibilityRole="button"
          accessibilityLabel="返回浏览"
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>待删除列表</Text>
            {photosInGroup.length > 0 && (
              <View style={styles.countPill}>
                <Text style={styles.countText}>{photosInGroup.length}</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>
            {photosInGroup.length > 0
              ? selectedCount > 0
                ? `已选择 ${selectedCount} 张`
                : '点选照片后可批量还原'
              : '当前没有待删除照片'}
          </Text>
        </View>
      </View>

      {photosInGroup.length === 0 ? (
        <EmptyReviewPlaceholder />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.gridContent,
            { paddingBottom: insets.bottom + (selectedCount > 0 ? 142 : 92) },
          ]}
        >
          <DeleteGrid
            photos={photosInGroup}
            selectedIds={selectedIds}
            onTap={toggleSelected}
            onPhotoPreview={setPreviewPhoto}
          />
        </ScrollView>
      )}

      {selectedCount > 0 && (
        <View style={[styles.restoreBar, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.restoreCopy}>
            <Text style={styles.restoreEyebrow}>已选择 {selectedCount} 张</Text>
            <Text style={styles.restoreHint}>还原后会回到浏览列表，不会删除</Text>
          </View>
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestoreSelected}
            activeOpacity={0.76}
            accessibilityRole="button"
            accessibilityLabel={`还原 ${selectedCount} 张照片`}
          >
            <MaterialCommunityIcons name="backup-restore" size={20} color="#080808" />
            <Text style={styles.restoreText}>还原</Text>
          </TouchableOpacity>
        </View>
      )}

      <PhotoZoomModal
        visible={previewPhoto !== null}
        photo={previewPhoto}
        onClose={() => setPreviewPhoto(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090A0B' },
  topWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 190,
    backgroundColor: 'rgba(255,255,255,0.045)',
  },
  sideGlow: {
    position: 'absolute',
    right: -90,
    top: 34,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,204,0,0.10)',
  },
  gridPlate: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 126,
    bottom: 18,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.032)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  headerCopy: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
  },
  countPill: {
    minWidth: 34,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,204,0,0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,204,0,0.42)',
  },
  countText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
    color: Tokens.color.accent,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: Tokens.color.textSecondary,
  },
  gridContent: {
    paddingTop: 10,
  },
  restoreBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 10,
    minHeight: 88,
    borderRadius: 28,
    paddingTop: 13,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(247,247,242,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  restoreCopy: { flex: 1 },
  restoreEyebrow: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111111',
  },
  restoreHint: {
    marginTop: 4,
    fontSize: 11,
    color: 'rgba(17,17,17,0.58)',
  },
  restoreButton: {
    minWidth: 102,
    height: 46,
    borderRadius: 23,
    backgroundColor: Tokens.color.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  restoreText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#080808',
  },
});
