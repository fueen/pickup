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
import { SortPickerSheet } from '../src/components/photo-card/SortPickerSheet';
import { File } from 'expo-file-system';
import { formatPhotoDate } from '../src/utils/date-utils';
import { CelebrationOverlay } from '../src/components/ui/CelebrationOverlay';
import { deletePhotos } from '../src/services/delete-service';
import { PhotoDetailSheet } from '../src/components/delete-review/PhotoDetailSheet';
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
    sortMode, changeSortMode,
  } = usePhotoContext();
  const { state, dispatch } = useSessionContext();
  const { dailyUsageLoaded, canBrowseNextGroup, incrementGroupCount } = useSubscriptionContext();
  const { recordViewed, recordDeleted } = useStatsContext();

  const [quickDeleting, setQuickDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [detailPhoto, setDetailPhoto] = useState<{
    creationTime: number; width: number; height: number; fileSize?: number; filename?: string;
  } | null>(null);

  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationCount, setCelebrationCount] = useState(0);
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

  const showSortPicker = useCallback(() => {
    setSortSheetVisible(true);
  }, []);

  const handleSortSelect = useCallback((mode: typeof sortMode) => {
    setSortSheetVisible(false);
    changeSortMode(mode);
  }, [changeSortMode]);

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
        setCelebrationCount(result.successCount);
        setShowCelebration(true);
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

  const isGate = permissionStatus === 'denied'
    || permissionStatus === 'undetermined'
    || !dailyUsageLoaded
    || !canBrowseNextGroup
    || isLoading
    || allPhotos.length === 0
    || !currentPhoto;

  return (
    <View style={styles.container}>
      {/* Top toolbar — frosted glass pills */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.pill} onPress={showSortPicker} activeOpacity={0.7}>
          <MaterialCommunityIcons name="sort-variant" size={16} color="#fff" />
          <Text style={styles.pillLabel}>排序</Text>
        </TouchableOpacity>

        <View style={styles.topCenter}>
          <Text style={styles.topDate} numberOfLines={1} ellipsizeMode="tail">
            {currentPhoto ? formatPhotoDate(currentPhoto.creationTime) : ''}
          </Text>
          {currentPhoto?.mediaType === 'livePhoto' && (
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        <QuickDeleteButton
          count={markedForDelete.size}
          onPress={Platform.OS === 'android' ? handleQuickDelete : () => setShowDeleteConfirm(true)}
          loading={quickDeleting}
        />
      </View>

      {/* Gates */}
      {(() => {
        if (permissionStatus === 'denied') return <PermissionGate status={permissionStatus} onRequest={requestPermissions} />;
        if (!dailyUsageLoaded) return <LoadingGate />;
        if (permissionStatus === 'undetermined') return <PermissionGate status={permissionStatus} onRequest={requestPermissions} />;
        if (!canBrowseNextGroup) return <DailyLimitReached />;
        if (isLoading) return <LoadingGate />;
        if (allPhotos.length === 0) return <EmptyGate />;
        if (!currentPhoto) return <LoadingGate />;
        return null;
      })()}

      {!isGate && (
        <>
          <SwipeableCard
            key={currentPhoto.id}
        onMarkDelete={handleMarkDelete}
        onMarkKeep={handleMarkKeep}
        onSkip={handleSkip}
        onPrevious={handlePrevious}
        isMarkedForDelete={markedForDelete.has(currentPhoto.id)}
        onUnmarkDelete={handleUnmarkDelete}
      >
        <PhotoCard photo={currentPhoto} hideHeader />
      </SwipeableCard>

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

          {/* Info button — bottom right */}
          <View style={styles.infoBtnWrap}>
            <TouchableOpacity
              style={styles.infoBtn}
              onPress={async () => {
                const p = currentPhoto;
                let fileSize: number | undefined;
                try { fileSize = new File(p.uri).size; } catch { /* ignore */ }
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

          {/* Album button — bottom left */}
          <View style={styles.albumBtnWrap}>
            <TouchableOpacity style={styles.infoBtn} onPress={() => router.push('/albums')} activeOpacity={0.7}>
              <MaterialCommunityIcons name="layers" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <GroupProgressBar
            current={groupIndex}
            total={currentGroup.length}
            deleteIndices={deleteIndices}
            keepIndices={keepIndices}
            onSelectIndex={setGroupIndex}
          />
        </>
      )}

      <LimitReachedModal
        visible={limitModalVisible}
        onClose={() => setLimitModalVisible(false)}
      />
      <GestureGuideOverlay
        visible={guideVisible}
        onDismiss={handleDismissGuide}
      />
      <PhotoDetailSheet
        visible={detailPhoto !== null}
        photo={detailPhoto}
        onClose={() => setDetailPhoto(null)}
      />
      <SortPickerSheet
        visible={sortSheetVisible}
        selected={sortMode}
        onSelect={handleSortSelect}
        onClose={() => setSortSheetVisible(false)}
      />
      <CelebrationOverlay
        visible={showCelebration}
        count={celebrationCount}
        onDone={() => setShowCelebration(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Tokens.color.background },
  topBar: {
    position: 'absolute',
    top: 54,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 30,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  pillLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  topCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 8,
  },
  topDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 4,
    flexShrink: 1,
  },
  liveBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  albumBtnWrap: { position: 'absolute', bottom: 100, left: 16, zIndex: 20 },
  infoBtnWrap: { position: 'absolute', bottom: 100, right: 16, zIndex: 20 },
  infoBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  centered: { flex: 1, backgroundColor: Tokens.color.background, justifyContent: 'center', alignItems: 'center', padding: Tokens.spacing.xxl },
  errorText: { ...Tokens.typography.body, color: Tokens.color.danger, textAlign: 'center' },
});
