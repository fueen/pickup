import React, { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePhotoContext } from '../src/contexts/PhotoContext';
import { useSessionContext } from '../src/contexts/SessionContext';
import { useSubscriptionContext } from '../src/contexts/SubscriptionContext';
import { useStatsContext } from '../src/contexts/StatsContext';
import { PhotoCard } from '../src/components/photo-card/PhotoCard';
import { GroupProgressBar } from '../src/components/photo-card/GroupProgressBar';
import { SwipeableCard } from '../src/components/gesture/SwipeableCard';
import { GestureGuideOverlay } from '../src/components/gesture/GestureGuideOverlay';
import { PermissionGate } from '../src/components/photo-card/PermissionGate';
import { LoadingGate } from '../src/components/photo-card/LoadingGate';
import { EmptyGate } from '../src/components/photo-card/EmptyGate';
import { LimitReachedModal } from '../src/components/photo-card/LimitReachedModal';
import { DeleteConfirmSheet } from '../src/components/delete-review/DeleteConfirmSheet';
import { DailyLimitReached } from '../src/components/photo-card/DailyLimitReached';
import { QuickDeleteButton } from '../src/components/gesture/QuickDeleteButton';
import { deletePhotos } from '../src/services/delete-service';
import { Tokens } from '../src/design-tokens';

export default function BrowseScreen() {
  const router = useRouter();
  const { selectedAlbum } = usePhotoContext();
  const albumIdStr = selectedAlbum?.id ?? '__all__';

  const {
    currentGroup, groupIndex, setGroupIndex,
    markedForDelete, setMarkedForDelete,
    markedForKeep, setMarkedForKeep,
    isLoading, permissionStatus, error, allPhotos,
    requestPermissions, loadPhotos, loadNextGroup,
    clearMarkedPhotos, refillGroup,
  } = usePhotoContext();
  const { state, dispatch } = useSessionContext();
  const { dailyUsageLoaded, canBrowseNextGroup, incrementGroupCount } = useSubscriptionContext();
  const { recordViewed, recordDeleted } = useStatsContext();

  const [quickDeleting, setQuickDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const [guideVisible, setGuideVisible] = useState(false);
  const lastViewedGroupRef = useRef<string>('');
  const triedLoadRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const groupLenRef = useRef(currentGroup.length);
  const deletingRef = useRef(false);

  // First-launch gesture guide (REQ-05)
  useEffect(() => {
    const checkGuide = async () => {
      try {
        const shown = await AsyncStorage.getItem('gestureGuideShown');
        if (!shown) setGuideVisible(true);
      } catch { /* ignore */ }
    };
    // Delay slightly to let the UI settle after splash
    const timer = setTimeout(checkGuide, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDismissGuide = useCallback(async () => {
    setGuideVisible(false);
    try {
      await AsyncStorage.setItem('gestureGuideShown', 'true');
    } catch { /* ignore */ }
  }, []);

  const deleteIndices = useMemo(() => {
    const s = new Set<number>();
    currentGroup.forEach((p, i) => { if (markedForDelete.has(p.id)) s.add(i); });
    return s;
  }, [currentGroup, markedForDelete]);

  const keepIndices = useMemo(() => {
    const s = new Set<number>();
    currentGroup.forEach((p, i) => { if (markedForKeep.has(p.id)) s.add(i); });
    return s;
  }, [currentGroup, markedForKeep]);

  const currentPhoto = currentGroup[groupIndex];
  groupLenRef.current = currentGroup.length;

  // Reset load state when album changes
  useEffect(() => {
    hasLoadedRef.current = false;
    triedLoadRef.current = false;
  }, [albumIdStr]);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    if (!dailyUsageLoaded) return;
    if (!canBrowseNextGroup) return;
    if (permissionStatus === 'undetermined') {
      requestPermissions().then((status) => {
        if ((status === 'granted' || status === 'limited') && !hasLoadedRef.current) {
          hasLoadedRef.current = true;
          loadPhotos(albumIdStr);
        }
      });
    } else if (permissionStatus === 'granted' || permissionStatus === 'limited') {
      hasLoadedRef.current = true;
      loadPhotos(albumIdStr);
    }
  }, [permissionStatus, dailyUsageLoaded, canBrowseNextGroup, albumIdStr, loadPhotos, requestPermissions]);

  // Record viewed when a new group starts (groupIndex === 0)
  useEffect(() => {
    if (groupIndex === 0 && currentGroup.length > 0) {
      const groupId = currentGroup.map((p) => p.id).join(',');
      if (groupId !== lastViewedGroupRef.current) {
        lastViewedGroupRef.current = groupId;
        recordViewed(Tokens.photo.groupSize);
      }
    }
  }, [groupIndex, currentGroup, recordViewed]);

  // Load next group when current group is exhausted (only when no pending marks)
  useEffect(() => {
    if (!currentPhoto && allPhotos.length > 0 && !isLoading && canBrowseNextGroup && !triedLoadRef.current && markedForDelete.size === 0) {
      triedLoadRef.current = true;
      incrementGroupCount();
      loadNextGroup();
    }
  }, [currentPhoto, allPhotos.length, isLoading, canBrowseNextGroup, incrementGroupCount, loadNextGroup, markedForDelete.size]);

  // Reset load flag when we have photos again
  useEffect(() => {
    if (currentPhoto) {
      triedLoadRef.current = false;
    }
  }, [currentPhoto]);

  const advanceToNext = useCallback((justMarkedDelete = false) => {
    if (groupIndex + 1 >= currentGroup.length) {
      if (markedForDelete.size === 0 && !justMarkedDelete) {
        if (!canBrowseNextGroup) {
          setLimitModalVisible(true);
          return;
        }
        incrementGroupCount();
        loadNextGroup();
      } else {
        router.push('/review');
      }
    } else {
      setGroupIndex(groupIndex + 1);
    }
  }, [groupIndex, currentGroup.length, markedForDelete.size, setGroupIndex, incrementGroupCount, loadNextGroup, router, canBrowseNextGroup]);

  const handleMarkDelete = useCallback(() => {
    const photo = currentGroup[groupIndex];
    if (!photo) return;
    setMarkedForDelete((prev) => new Set(prev).add(photo.id));
    dispatch({ type: 'MARK_DELETE', payload: { photoId: photo.id, timestamp: Date.now() } });
    advanceToNext(true);
  }, [currentGroup, groupIndex, advanceToNext, dispatch]);

  const handleUnmarkDelete = useCallback(() => {
    const photo = currentGroup[groupIndex];
    if (!photo) return;
    setMarkedForDelete((prev) => {
      const next = new Set(prev);
      next.delete(photo.id);
      return next;
    });
  }, [currentGroup, groupIndex]);

  const handleMarkKeep = useCallback(() => {
    const photo = currentGroup[groupIndex];
    if (!photo) return;
    setMarkedForKeep((prev) => new Set(prev).add(photo.id));
    dispatch({ type: 'MARK_KEEP', payload: { photoId: photo.id, timestamp: Date.now() } });
    advanceToNext();
  }, [currentGroup, groupIndex, advanceToNext, dispatch]);

  const handleSkip = useCallback(() => {
    const photo = currentGroup[groupIndex];
    if (!photo) return;
    dispatch({ type: 'SKIP', payload: { photoId: photo.id, timestamp: Date.now() } });
    advanceToNext();
  }, [currentGroup, groupIndex, advanceToNext, dispatch]);

  const handlePrevious = useCallback(() => {
    if (groupIndex > 0) {
      setGroupIndex(groupIndex - 1);
    }
  }, [groupIndex, setGroupIndex]);

  // REQ-09: Quick delete marked photos
  const handleQuickDelete = useCallback(async () => {
    if (markedForDelete.size === 0 || quickDeleting || deletingRef.current) return;
    deletingRef.current = true;
    setQuickDeleting(true);
    try {
      const photosToDelete = currentGroup.filter((p) => markedForDelete.has(p.id));
      const deleteCount = photosToDelete.length;
      if (deleteCount === 0) return;
      const result = await deletePhotos(photosToDelete);
      if (result.successCount > 0) {
        recordDeleted(result.successCount, result.freedBytes).catch(() => {});
        setMarkedForDelete(new Set());
        clearMarkedPhotos();
        refillGroup(deleteCount);
        setGroupIndex((prev) => {
          const maxIdx = Math.max(0, currentGroup.length - deleteCount - 1);
          return Math.max(0, Math.min(prev, maxIdx));
        });
      }
    } finally {
      setQuickDeleting(false);
      setShowDeleteConfirm(false);
      deletingRef.current = false;
    }
  }, [markedForDelete, currentGroup, quickDeleting, clearMarkedPhotos, setMarkedForDelete, refillGroup, setGroupIndex, recordDeleted]);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Always show settings redirect if permission was explicitly denied
  if (permissionStatus === 'denied') {
    return <PermissionGate status={permissionStatus} onRequest={requestPermissions} />;
  }

  // Wait for daily usage to load before deciding what to show
  if (!dailyUsageLoaded) return <LoadingGate />;

  // Only prompt for permission after we know daily state
  if (permissionStatus === 'undetermined') {
    return <PermissionGate status={permissionStatus} onRequest={requestPermissions} />;
  }

  // Limit reached — show placeholder immediately, regardless of isLoading
  if (!canBrowseNextGroup) return <DailyLimitReached />;

  // Normal browsing flow
  if (isLoading) return <LoadingGate />;
  if (allPhotos.length === 0) return <EmptyGate />;
  if (!currentPhoto) return <LoadingGate />;

  return (
    <View style={styles.container}>
      {/* Album button — top left */}
      <View style={styles.albumBtnWrap}>
        <TouchableOpacity style={styles.albumBtn} onPress={() => router.push('/albums')} activeOpacity={0.7}>
          <MaterialCommunityIcons name="folder-image" size={24} color="#fff" />
        </TouchableOpacity>
        {selectedAlbum && (
          <Text style={styles.albumLabel} numberOfLines={1}>{selectedAlbum.title}</Text>
        )}
      </View>

      <SwipeableCard
        key={currentPhoto.id}
        onMarkDelete={handleMarkDelete}
        onMarkKeep={handleMarkKeep}
        onSkip={handleSkip}
        onPrevious={handlePrevious}
        isMarkedForDelete={markedForDelete.has(currentPhoto.id)}
        onUnmarkDelete={handleUnmarkDelete}
      >
        <PhotoCard photo={currentPhoto} />
      </SwipeableCard>

      {/* Quick delete button — top right */}
      <View style={styles.quickDeleteWrap}>
        <QuickDeleteButton
          count={markedForDelete.size}
          onPress={Platform.OS === 'android' ? handleQuickDelete : () => setShowDeleteConfirm(true)}
          loading={quickDeleting}
        />
      </View>

      {Platform.OS !== 'android' && (
        <DeleteConfirmSheet
          visible={showDeleteConfirm}
          count={markedForDelete.size}
          loading={quickDeleting}
          onConfirm={() => {
            setShowDeleteConfirm(false);
            handleQuickDelete();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      <GroupProgressBar
        current={groupIndex}
        total={currentGroup.length}
        deleteIndices={deleteIndices}
        keepIndices={keepIndices}
        onSelectIndex={setGroupIndex}
      />
      <LimitReachedModal
        visible={limitModalVisible}
        onClose={() => setLimitModalVisible(false)}
      />
      <GestureGuideOverlay
        visible={guideVisible}
        onDismiss={handleDismissGuide}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Tokens.color.background },
  albumBtnWrap: { position: 'absolute', top: 54, left: 20, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 30 },
  albumBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  albumLabel: { fontSize: 16, fontWeight: '600', color: '#fff', maxWidth: 160 },
  quickDeleteWrap: {
    position: 'absolute',
    top: 54,
    right: 20,
    zIndex: 30,
  },
  centered: { flex: 1, backgroundColor: Tokens.color.background, justifyContent: 'center', alignItems: 'center', padding: Tokens.spacing.xxl },
  errorText: { ...Tokens.typography.body, color: Tokens.color.danger, textAlign: 'center' },
});
