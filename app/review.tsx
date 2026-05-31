import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { usePhotoContext } from '../src/contexts/PhotoContext';
import { useSessionContext } from '../src/contexts/SessionContext';
import { useSubscriptionContext } from '../src/contexts/SubscriptionContext';
import { useStatsContext } from '../src/contexts/StatsContext';
import { DeleteConfirmSheet } from '../src/components/delete-review/DeleteConfirmSheet';
import { EmptyReviewPlaceholder } from '../src/components/delete-review/EmptyReviewPlaceholder';
import { LimitReachedModal } from '../src/components/photo-card/LimitReachedModal';
import { CelebrationOverlay } from '../src/components/ui/CelebrationOverlay';
import { deletePhotos } from '../src/services/delete-service';
import { Tokens } from '../src/design-tokens';

export default function ReviewScreen() {
  const router = useRouter();
  const { currentGroup, markedForDelete, setMarkedForDelete, clearMarkedPhotos, loadNextGroup } = usePhotoContext();
  const { dispatch } = useSessionContext();
  const { canBrowseNextGroup, incrementGroupCount } = useSubscriptionContext();
  const { recordDeleted } = useStatsContext();

  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(markedForDelete));
  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const [showDeleteSheet, setShowDeleteSheet] = useState(markedForDelete.size > 0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationCount, setCelebrationCount] = useState(0);
  const deletingRef = useRef(false);

  const photosInGroup = currentGroup.filter((p) => markedForDelete.has(p.id));
  const selectedPhotos = photosInGroup.filter((p) => selectedIds.has(p.id));

  useEffect(() => {
    if (markedForDelete.size > 0) {
      setSelectedIds(new Set(markedForDelete));
      setShowDeleteSheet(true);
    }
  }, [markedForDelete]);

  const handleDiscardAndNext = useCallback(() => {
    if (!canBrowseNextGroup) {
      setShowDeleteSheet(false);
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
        setCelebrationCount(result.successCount);
        setShowCelebration(true);
        return;
      }

      // User may reject the system delete prompt. Keep this page open so they can retry or cancel.
      setShowDeleteSheet(true);
    } finally {
      setDeleting(false);
      deletingRef.current = false;
    }
  }, [selectedPhotos, clearMarkedPhotos, setMarkedForDelete, dispatch, recordDeleted]);

  return (
    <View style={styles.container}>
      {photosInGroup.length === 0 ? (
        <EmptyReviewPlaceholder />
      ) : (
        <View style={styles.confirmBackdrop} />
      )}

      <LimitReachedModal
        visible={limitModalVisible}
        onClose={() => setLimitModalVisible(false)}
      />

      <CelebrationOverlay
        visible={showCelebration}
        count={celebrationCount}
        onDone={() => {
          if (!canBrowseNextGroup) {
            setShowCelebration(false);
            setLimitModalVisible(true);
            return;
          }
          incrementGroupCount();
          loadNextGroup();
          router.replace('/');
          setTimeout(() => setShowCelebration(false), 80);
        }}
      />

      {showCelebration && photosInGroup.length === 0 && (
        <View style={styles.celebrationBackdrop} pointerEvents="none" />
      )}

      <DeleteConfirmSheet
        visible={photosInGroup.length > 0 && showDeleteSheet}
        count={selectedPhotos.length}
        photos={selectedPhotos}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleDiscardAndNext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Tokens.color.background },
  confirmBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Tokens.color.background,
  },
  celebrationBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Tokens.color.background,
    zIndex: 150,
  },
});
