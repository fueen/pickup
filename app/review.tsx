import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { usePhotoContext } from '../src/contexts/PhotoContext';
import { useSessionContext } from '../src/contexts/SessionContext';
import { useSubscriptionContext } from '../src/contexts/SubscriptionContext';
import { useStatsContext } from '../src/contexts/StatsContext';
import { DeleteGrid } from '../src/components/delete-review/DeleteGrid';
import { DeleteConfirmSheet } from '../src/components/delete-review/DeleteConfirmSheet';
import { LimitReachedModal } from '../src/components/photo-card/LimitReachedModal';
import { deletePhotos } from '../src/services/delete-service';
import { Tokens } from '../src/design-tokens';

export default function ReviewScreen() {
  const router = useRouter();
  const { currentGroup, markedForDelete, setMarkedForDelete, clearMarkedPhotos, loadNextGroup } = usePhotoContext();
  const { dispatch } = useSessionContext();
  const { canBrowseNextGroup, incrementGroupCount } = useSubscriptionContext();
  const { recordDeleted } = useStatsContext();

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deselectedIds, setDeselectedIds] = useState<Set<string>>(new Set());
  const [limitModalVisible, setLimitModalVisible] = useState(false);

  const photosToDelete = currentGroup.filter(
    (p) => markedForDelete.has(p.id) && !deselectedIds.has(p.id)
  );

  const handleTogglePhoto = useCallback((id: string) => {
    setDeselectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const loadNextWithLimit = useCallback(() => {
    if (!canBrowseNextGroup) {
      setLimitModalVisible(true);
      return false;
    }
    incrementGroupCount();
    loadNextGroup();
    return true;
  }, [canBrowseNextGroup, incrementGroupCount, loadNextGroup]);

  const handleConfirmDelete = useCallback(async () => {
    if (photosToDelete.length === 0) return;
    setDeleting(true);
    const result = await deletePhotos(photosToDelete);
    if (result.successCount > 0) {
      recordDeleted(result.successCount, result.freedBytes);
      clearMarkedPhotos();
      dispatch({ type: 'RESET_SESSION' });
    }
    setDeleting(false);
    setShowConfirm(false);
    loadNextWithLimit();
    router.replace('/');
  }, [photosToDelete, clearMarkedPhotos, loadNextWithLimit, router, dispatch, recordDeleted]);

  // Handle zero-delete case
  useEffect(() => {
    if (photosToDelete.length === 0 && !deleting) {
      const ok = loadNextWithLimit();
      if (ok) router.replace('/');
    }
  }, [photosToDelete.length, deleting, loadNextWithLimit, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>确认删除 · {photosToDelete.length} 张</Text>
      <Text style={styles.hint}>点击照片可取消删除标记</Text>

      <DeleteGrid
        photos={photosToDelete}
        onTap={handleTogglePhoto}
        markedIds={new Set(photosToDelete.map((p) => p.id))}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.replace('/')}>
          <Text style={styles.cancelText}>取消</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => setShowConfirm(true)}>
          <Text style={styles.deleteText}>删除 {photosToDelete.length} 张</Text>
        </TouchableOpacity>
      </View>

      <DeleteConfirmSheet
        visible={showConfirm}
        count={photosToDelete.length}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />

      <LimitReachedModal
        visible={limitModalVisible}
        onClose={() => setLimitModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Tokens.color.background, paddingTop: 60 },
  heading: { ...Tokens.typography.title, color: Tokens.color.textPrimary, textAlign: 'center', marginBottom: Tokens.spacing.s },
  hint: { ...Tokens.typography.caption, color: Tokens.color.textMuted, textAlign: 'center', marginBottom: Tokens.spacing.xl },
  footer: { flexDirection: 'row', padding: Tokens.spacing.xl, gap: Tokens.spacing.m, position: 'absolute', bottom: 40, left: 0, right: 0 },
  cancelButton: { flex: 1, paddingVertical: Tokens.spacing.l, alignItems: 'center', backgroundColor: Tokens.color.surface, borderRadius: Tokens.radius.button },
  cancelText: { ...Tokens.typography.body, color: Tokens.color.textSecondary },
  deleteButton: { flex: 1, paddingVertical: Tokens.spacing.l, alignItems: 'center', backgroundColor: Tokens.color.danger, borderRadius: Tokens.radius.button },
  deleteText: { ...Tokens.typography.body, color: '#FFFFFF', fontWeight: '600' },
});
