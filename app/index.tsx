import React, { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { getAssetInfoAsync } from 'expo-media-library';
import { formatPhotoDate } from '../src/utils/date-utils';
import { CelebrationOverlay } from '../src/components/ui/CelebrationOverlay';
import { deletePhotos } from '../src/services/delete-service';
import { PhotoDetailSheet } from '../src/components/delete-review/PhotoDetailSheet';
import { Tokens } from '../src/design-tokens';
import {
  DeleteConfirmSource,
  getBrowseAdvanceAction,
  getPostDeleteAction,
} from '../src/utils/delete-confirm-utils';

export default function BrowseScreen() {
  const router = useRouter();
  const {
    confirmSource: confirmSourceParam,
    showDeleteConfirm: showDeleteConfirmParam,
  } = useLocalSearchParams<{ confirmSource?: DeleteConfirmSource; showDeleteConfirm?: string }>();
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
  const [deleteConfirmSource, setDeleteConfirmSource] = useState<DeleteConfirmSource>('manual');
  const [detailPhoto, setDetailPhoto] = useState<{
    creationTime: number; width: number; height: number; fileSize?: number; filename?: string;
  } | null>(null);

  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationCount, setCelebrationCount] = useState(0);
  const [guideVisible, setGuideVisible] = useState(false);
  const [photoLocation, setPhotoLocation] = useState<string | null>(null);
  const lastViewedGroupRef = useRef<string>('');
  const lastConsumedConfirmParamRef = useRef<string | null>(null);
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
  const photosPendingDelete = useMemo(
    () => currentGroup.filter((p) => markedForDelete.has(p.id)),
    [currentGroup, markedForDelete],
  );

  useEffect(() => {
    const confirmToken = Array.isArray(showDeleteConfirmParam) ? showDeleteConfirmParam[0] : showDeleteConfirmParam;
    if (
      confirmToken
      && confirmToken !== lastConsumedConfirmParamRef.current
      && markedForDelete.size > 0
    ) {
      lastConsumedConfirmParamRef.current = confirmToken;
      setDeleteConfirmSource(confirmSourceParam === 'group-complete' ? 'group-complete' : 'manual');
      setShowDeleteConfirm(true);
    }
  }, [confirmSourceParam, markedForDelete.size, showDeleteConfirmParam]);

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

  // Fetch location (city-level) for current photo
  useEffect(() => {
    let cancelled = false;
    const fetchLocation = async () => {
      if (!currentPhoto) { setPhotoLocation(null); return; }
      try {
        const info = await getAssetInfoAsync(currentPhoto.id);
        const loc = info.location;
        if (!loc || cancelled) { setPhotoLocation(null); return; }
        const { latitude, longitude } = loc;
        if (latitude == null || longitude == null) { setPhotoLocation(null); return; }
        // Show coordinates immediately from EXIF data (no API needed)
        const coordStr = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
        if (!cancelled) setPhotoLocation(coordStr);
        // Async: try reverse geocode to replace coordinates with city name
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=zh`;
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);
          const resp = await fetch(url, { headers: { 'User-Agent': 'PickUp/1.0' }, signal: controller.signal });
          clearTimeout(timeout);
          const data = await resp.json();
          if (!cancelled && data?.address) {
            const city = data.address.city || data.address.town || data.address.county || data.address.state || '';
            if (city) setPhotoLocation(city);
          }
        } catch {
          // Keep coordStr — already displayed
        }
      } catch {
        if (!cancelled) setPhotoLocation(null);
      }
    };
    fetchLocation();
    return () => { cancelled = true; };
  }, [currentPhoto?.id]);

  const advanceToNext = useCallback((justMarkedDelete = false) => {
    const action = getBrowseAdvanceAction({
      groupIndex,
      groupLength: currentGroup.length,
      markedForDeleteCount: markedForDelete.size,
      justMarkedDelete,
      canBrowseNextGroup,
    });

    if (action === 'next-photo') {
      setGroupIndex(groupIndex + 1);
      return;
    }

    if (action === 'open-confirm') {
      setDeleteConfirmSource('group-complete');
      setShowDeleteConfirm(true);
      return;
    }

    if (action === 'show-limit') {
      setLimitModalVisible(true);
      return;
    }

    incrementGroupCount();
    loadNextGroup();
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
        const postDeleteAction = getPostDeleteAction(deleteConfirmSource);
        setMarkedForDelete(new Set());
        clearMarkedPhotos();

        if (postDeleteAction === 'load-next-group') {
          incrementGroupCount();
          loadNextGroup();
        } else {
          refillGroup(deleteCount);
          setGroupIndex((prev) => {
            const maxIdx = Math.max(0, currentGroup.length - deleteCount - 1);
            return Math.max(0, Math.min(prev, maxIdx));
          });
        }

        setCelebrationCount(result.successCount);
        setShowCelebration(true);
      }
    } finally {
      setQuickDeleting(false);
      setShowDeleteConfirm(false);
      deletingRef.current = false;
    }
  }, [
    markedForDelete,
    currentGroup,
    quickDeleting,
    deleteConfirmSource,
    clearMarkedPhotos,
    setMarkedForDelete,
    refillGroup,
    setGroupIndex,
    recordDeleted,
    incrementGroupCount,
    loadNextGroup,
  ]);

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
      {/* Top toolbar — left: sort, right: quick-delete */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.pill} onPress={showSortPicker} activeOpacity={0.7}>
          <MaterialCommunityIcons name="sort-variant" size={16} color="#fff" />
          <Text style={styles.pillLabel}>排序</Text>
        </TouchableOpacity>

        <QuickDeleteButton
          count={markedForDelete.size}
          onPress={() => {
            setDeleteConfirmSource('manual');
            setShowDeleteConfirm(true);
          }}
          loading={quickDeleting}
        />
      </View>

      {/* Date + Location — absolute centered */}
      {!isGate && currentPhoto && (
        <View style={styles.topCenter} pointerEvents="none">
          <View style={styles.topDateRow}>
            <Text style={styles.topDate} numberOfLines={1} ellipsizeMode="tail">
              {formatPhotoDate(currentPhoto.creationTime)}
            </Text>
            {currentPhoto?.mediaType === 'livePhoto' && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>
          {photoLocation ? (
            <Text style={styles.topLocation} numberOfLines={1}>📍 {photoLocation}</Text>
          ) : null}
        </View>
      )}

      {/* Gates — suppressed while celebration is showing to avoid flash */}
      {!showCelebration && (() => {
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

      <DeleteConfirmSheet
        visible={showDeleteConfirm}
        count={markedForDelete.size}
        photos={photosPendingDelete}
        loading={quickDeleting}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          handleQuickDelete();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        onOpenList={() => {
          setShowDeleteConfirm(false);
          router.push({
            pathname: '/review',
            params: { confirmSource: deleteConfirmSource, returnToConfirm: '1' },
          });
        }}
      />

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

          <GroupProgressBar
            current={groupIndex}
            total={currentGroup.length}
            deleteIndices={deleteIndices}
            keepIndices={keepIndices}
            onSelectIndex={setGroupIndex}
          />
        </>
      )}

      {/* Album button — always visible (including empty albums) */}
      {permissionStatus !== 'denied' && (
        <View style={styles.albumBtnWrap}>
          <TouchableOpacity style={styles.infoBtn} onPress={() => router.push('/albums')} activeOpacity={0.7}>
            <MaterialCommunityIcons name="layers" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 31,
  },
  topDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 4,
  },
  topLocation: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
    marginTop: 3,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 3,
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
