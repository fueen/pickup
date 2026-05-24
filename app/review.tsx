import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePhotoContext } from '../src/contexts/PhotoContext';
import { useSessionContext } from '../src/contexts/SessionContext';
import { useSubscriptionContext } from '../src/contexts/SubscriptionContext';
import { useStatsContext } from '../src/contexts/StatsContext';
import { DeleteGrid } from '../src/components/delete-review/DeleteGrid';
import { DeleteConfirmSheet } from '../src/components/delete-review/DeleteConfirmSheet';
import { PhotoDetailSheet } from '../src/components/delete-review/PhotoDetailSheet';
import { EmptyReviewPlaceholder } from '../src/components/delete-review/EmptyReviewPlaceholder';
import { LimitReachedModal } from '../src/components/photo-card/LimitReachedModal';
import { File } from 'expo-file-system';
import { deletePhotos } from '../src/services/delete-service';
import { Tokens } from '../src/design-tokens';

export default function ReviewScreen() {
  const router = useRouter();
  const { currentGroup, markedForDelete, setMarkedForDelete, clearMarkedPhotos, loadNextGroup } = usePhotoContext();
  const { dispatch } = useSessionContext();
  const { canBrowseNextGroup, incrementGroupCount } = useSubscriptionContext();
  const { recordDeleted } = useStatsContext();

  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const deletingRef = useRef(false);
  const insets = useSafeAreaInsets();

  const [detailPhoto, setDetailPhoto] = useState<{
    creationTime: number; width: number; height: number; fileSize?: number; filename?: string;
  } | null>(null);

  // Sync from markedForDelete; guard against cleared set during delete to avoid flicker
  useEffect(() => {
    if (markedForDelete.size > 0) {
      setSelectedIds(new Set(markedForDelete));
    }
  }, [markedForDelete]);

  const photosInGroup = currentGroup.filter((p) => markedForDelete.has(p.id));
  const selectedPhotos = photosInGroup.filter((p) => selectedIds.has(p.id));
  const hasSelection = selectedIds.size > 0;

  const handleTogglePhoto = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleDiscardAndNext = useCallback(() => {
    if (!canBrowseNextGroup) {
      setLimitModalVisible(true);
      return;
    }
    incrementGroupCount();
    clearMarkedPhotos();
    setMarkedForDelete(new Set());
    loadNextGroup();
    dispatch({ type: 'RESET_SESSION' });
    router.replace('/');
  }, [canBrowseNextGroup, incrementGroupCount, clearMarkedPhotos, setMarkedForDelete, loadNextGroup, dispatch, router]);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedPhotos.length === 0 || deletingRef.current) return;
    deletingRef.current = true;
    setDeleting(true);
    try {
      const result = await deletePhotos(selectedPhotos);
      if (result.successCount > 0) {
        recordDeleted(result.successCount, result.freedBytes).catch(() => {});
        clearMarkedPhotos();
        setMarkedForDelete(new Set());
        dispatch({ type: 'RESET_SESSION' });
      }
    } finally {
      setDeleting(false);
      setShowDeleteSheet(false);
      deletingRef.current = false;
    }
    if (!canBrowseNextGroup) {
      setLimitModalVisible(true);
      return;
    }
    incrementGroupCount();
    loadNextGroup();
    router.replace('/');
  }, [selectedPhotos, canBrowseNextGroup, incrementGroupCount, clearMarkedPhotos, setMarkedForDelete, loadNextGroup, dispatch, router, recordDeleted]);

  return (
    <View style={styles.container}>
      <View style={[styles.backBtn, { top: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.replace('/')} activeOpacity={0.7}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      {photosInGroup.length === 0 ? (
        <EmptyReviewPlaceholder />
      ) : (
        <>
          <Text style={styles.heading}>确认删除 · {selectedPhotos.length} 张</Text>
          <Text style={styles.hint}>点击照片可取消/重新勾选</Text>
          <DeleteGrid
            photos={photosInGroup}
            onTap={handleTogglePhoto}
            selectedIds={selectedIds}
          />

          {selectedPhotos.length > 0 && (
            <View style={styles.infoBtnWrap}>
              <TouchableOpacity
                style={styles.infoBtn}
                onPress={async () => {
                  const p = selectedPhotos[0];
                  let fileSize: number | undefined;
                  try {
                    fileSize = new File(p.uri).size;
                  } catch { /* ignore */ }
                  setDetailPhoto({
                    creationTime: p.creationTime,
                    width: p.width,
                    height: p.height,
                    fileSize: fileSize && fileSize > 0 ? fileSize : undefined,
                    filename: (p as any).filename,
                  });
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="information-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.footer}>
            <TouchableOpacity style={styles.discardButton} onPress={handleDiscardAndNext} disabled={deleting}>
              <Text style={styles.discardText}>放弃，再来一组</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.deleteButton,
                !hasSelection && styles.deleteButtonDisabled,
                deleting && { opacity: 0.6 },
              ]}
              onPress={Platform.OS === 'android' ? handleConfirmDelete : () => setShowDeleteSheet(true)}
              disabled={!hasSelection || deleting}
            >
              <Text style={[styles.deleteText, !hasSelection && styles.deleteTextDisabled]}>
                {deleting ? '删除中...' : `删除 ${selectedPhotos.length} 张`}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <LimitReachedModal
        visible={limitModalVisible}
        onClose={() => setLimitModalVisible(false)}
      />

      {Platform.OS !== 'android' && (
        <DeleteConfirmSheet
          visible={showDeleteSheet}
          count={selectedPhotos.length}
          loading={deleting}
          onConfirm={() => {
            setShowDeleteSheet(false);
            handleConfirmDelete();
          }}
          onCancel={() => setShowDeleteSheet(false)}
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
  container: { flex: 1, backgroundColor: Tokens.color.background, paddingTop: 60 },
  backBtn: { position: 'absolute', left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', zIndex: 20 },
  heading: { ...Tokens.typography.title, color: Tokens.color.textPrimary, textAlign: 'center', marginBottom: Tokens.spacing.s },
  hint: { ...Tokens.typography.caption, color: Tokens.color.textMuted, textAlign: 'center', marginBottom: Tokens.spacing.xl },
  footer: { flexDirection: 'row', padding: Tokens.spacing.xl, gap: Tokens.spacing.m, position: 'absolute', bottom: 40, left: 0, right: 0 },
  discardButton: { flex: 1, paddingVertical: 15, alignItems: 'center', backgroundColor: Tokens.color.surface, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  discardText: { fontSize: 16, fontWeight: '700', color: Tokens.color.textSecondary, letterSpacing: 1 },
  deleteButton: { flex: 1, paddingVertical: 15, alignItems: 'center', backgroundColor: '#FFCC00', borderRadius: 30 },
  deleteButtonDisabled: { backgroundColor: '#3A3A3C' },
  deleteText: { fontSize: 16, fontWeight: '700', color: '#000000', letterSpacing: 1 },
  deleteTextDisabled: { color: '#8E8E93' },
  infoBtnWrap: { position: 'absolute', bottom: 120, right: 16, zIndex: 20 },
  infoBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
});
