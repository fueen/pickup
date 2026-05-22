import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { usePhotoContext } from '../src/contexts/PhotoContext';
import { useSessionContext } from '../src/contexts/SessionContext';
import { useSubscriptionContext } from '../src/contexts/SubscriptionContext';
import { useStatsContext } from '../src/contexts/StatsContext';
import { DeleteGrid } from '../src/components/delete-review/DeleteGrid';
import { LimitReachedModal } from '../src/components/photo-card/LimitReachedModal';
import { deletePhotos } from '../src/services/delete-service';
import { Tokens } from '../src/design-tokens';

export default function ReviewScreen() {
  const router = useRouter();
  const { currentGroup, markedForDelete, setMarkedForDelete, clearMarkedPhotos, loadNextGroup } = usePhotoContext();
  const { dispatch } = useSessionContext();
  const { canBrowseNextGroup, incrementGroupCount } = useSubscriptionContext();
  const { recordDeleted } = useStatsContext();

  const [deleting, setDeleting] = useState(false);
  const [deselectedIds, setDeselectedIds] = useState<Set<string>>(new Set());
  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const autoNavRef = useRef(false);

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
    loadNextWithLimit();
    router.replace('/');
  }, [photosToDelete, clearMarkedPhotos, loadNextWithLimit, router, dispatch, recordDeleted]);

  // Handle zero-delete case — autoNavRef prevents infinite loop from dep changes
  useEffect(() => {
    if (autoNavRef.current) return;
    if (photosToDelete.length === 0 && !deleting) {
      autoNavRef.current = true;
      const ok = loadNextWithLimit();
      if (ok) router.replace('/');
    }
  }, [photosToDelete.length, deleting, loadNextWithLimit, router]);

  // If nothing to delete, skip rendering to avoid flashing empty UI
  if (photosToDelete.length === 0 && !deleting) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Tokens.color.textPrimary} size="large" />
      </View>
    );
  }

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
        <TouchableOpacity
          style={[styles.deleteButton, deleting && { opacity: 0.6 }]}
          onPress={handleConfirmDelete}
          disabled={deleting}
        >
          <Text style={styles.deleteText}>
            {deleting ? '删除中...' : `删除 ${photosToDelete.length} 张`}
          </Text>
        </TouchableOpacity>
      </View>

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
  cancelButton: { flex: 1, paddingVertical: 15, alignItems: 'center', backgroundColor: Tokens.color.surface, borderRadius: 30 },
  cancelText: { fontSize: 16, fontWeight: '700', color: Tokens.color.textSecondary, letterSpacing: 1 },
  deleteButton: { flex: 1, paddingVertical: 15, alignItems: 'center', backgroundColor: '#FFCC00', borderRadius: 30 },
  deleteText: { fontSize: 16, fontWeight: '700', color: '#000000', letterSpacing: 1 },
});
