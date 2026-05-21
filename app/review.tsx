import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { usePhotoContext } from '../src/contexts/PhotoContext';
import { useSessionContext } from '../src/contexts/SessionContext';
import { DeleteGrid } from '../src/components/delete-review/DeleteGrid';
import { DeleteConfirmSheet } from '../src/components/delete-review/DeleteConfirmSheet';
import { deletePhotos } from '../src/services/delete-service';
import { Tokens } from '../src/design-tokens';

export default function ReviewScreen() {
  const router = useRouter();
  const { currentGroup, markedForDelete, setMarkedForDelete, clearMarkedPhotos, loadNextGroup } = usePhotoContext();
  const { dispatch } = useSessionContext();

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deselectedIds, setDeselectedIds] = useState<Set<string>>(new Set());

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

  const handleConfirmDelete = useCallback(async () => {
    if (photosToDelete.length === 0) return;
    setDeleting(true);
    const ids = photosToDelete.map((p) => p.id);
    const result = await deletePhotos(ids);
    if (result.successCount > 0) {
      clearMarkedPhotos();
      dispatch({ type: 'RESET_SESSION' });
    }
    setDeleting(false);
    setShowConfirm(false);
    loadNextGroup();
    router.back();
  }, [photosToDelete, clearMarkedPhotos, loadNextGroup, router, dispatch]);

  // Handle zero-delete case
  if (photosToDelete.length === 0 && !deleting) {
    loadNextGroup();
    router.back();
    return null;
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
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
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
