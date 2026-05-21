import React, { useEffect, useCallback, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { usePhotoContext } from '../src/contexts/PhotoContext';
import { useSessionContext } from '../src/contexts/SessionContext';
import { useSubscriptionContext } from '../src/contexts/SubscriptionContext';
import { useStatsContext } from '../src/contexts/StatsContext';
import { PhotoCard } from '../src/components/photo-card/PhotoCard';
import { GroupProgressBar } from '../src/components/photo-card/GroupProgressBar';
import { SwipeableCard } from '../src/components/gesture/SwipeableCard';
import { PermissionGate } from '../src/components/photo-card/PermissionGate';
import { LoadingGate } from '../src/components/photo-card/LoadingGate';
import { EmptyGate } from '../src/components/photo-card/EmptyGate';
import { LimitReachedModal } from '../src/components/photo-card/LimitReachedModal';
import { Tokens } from '../src/design-tokens';

export default function BrowseScreen() {
  const router = useRouter();
  const {
    currentGroup, groupIndex, setGroupIndex,
    markedForDelete, setMarkedForDelete,
    markedForKeep, setMarkedForKeep,
    isLoading, permissionStatus, error, allPhotos,
    requestPermissions, loadPhotos, loadNextGroup,
  } = usePhotoContext();
  const { state, dispatch } = useSessionContext();
  const { canBrowseNextGroup, incrementGroupCount } = useSubscriptionContext();
  const { recordViewed } = useStatsContext();

  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const lastViewedGroupRef = useRef<string>('');
  const triedLoadRef = useRef(false);
  const hasLoadedRef = useRef(false);

  const currentPhoto = currentGroup[groupIndex];

  useEffect(() => {
    if (hasLoadedRef.current) return;
    if (permissionStatus === 'undetermined') {
      requestPermissions().then((status) => {
        if ((status === 'granted' || status === 'limited') && !hasLoadedRef.current) {
          hasLoadedRef.current = true;
          loadPhotos();
        }
      });
    } else if (permissionStatus === 'granted' || permissionStatus === 'limited') {
      hasLoadedRef.current = true;
      loadPhotos();
    }
  }, [permissionStatus]);

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

  // Load next group when current group is exhausted
  useEffect(() => {
    if (!currentPhoto && allPhotos.length > 0 && !isLoading && canBrowseNextGroup && !triedLoadRef.current) {
      triedLoadRef.current = true;
      incrementGroupCount();
      loadNextGroup();
    }
  }, [currentPhoto, allPhotos.length, isLoading, canBrowseNextGroup, incrementGroupCount, loadNextGroup]);

  // Reset load flag when we have photos again
  useEffect(() => {
    if (currentPhoto) {
      triedLoadRef.current = false;
    }
  }, [currentPhoto]);

  const advanceToNext = useCallback(() => {
    if (groupIndex + 1 >= currentGroup.length) {
      if (markedForDelete.size === 0) {
        incrementGroupCount();
        loadNextGroup();
      } else {
        router.push('/review');
      }
    } else {
      setGroupIndex(groupIndex + 1);
    }
  }, [groupIndex, currentGroup.length, markedForDelete.size, setGroupIndex, incrementGroupCount, loadNextGroup, router]);

  const handleMarkDelete = useCallback(() => {
    const photo = currentGroup[groupIndex];
    if (!photo) return;
    setMarkedForDelete((prev) => new Set(prev).add(photo.id));
    dispatch({ type: 'MARK_DELETE', payload: { photoId: photo.id, timestamp: Date.now() } });
    advanceToNext();
  }, [currentGroup, groupIndex, advanceToNext, dispatch]);

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

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (permissionStatus === 'denied' || permissionStatus === 'undetermined') {
    return <PermissionGate status={permissionStatus} onRequest={requestPermissions} />;
  }
  if (isLoading) return <LoadingGate />;
  if (allPhotos.length === 0) return <EmptyGate />;

  if (!currentPhoto) {
    if (!canBrowseNextGroup) {
      return (
        <View style={styles.centered}>
          <LimitReachedModal
            visible={true}
            onClose={() => router.push('/paywall')}
          />
        </View>
      );
    }
    return <LoadingGate />;
  }

  return (
    <View style={styles.container}>
      <SwipeableCard
        key={currentPhoto.id}
        onMarkDelete={handleMarkDelete}
        onMarkKeep={handleMarkKeep}
        onSkip={handleSkip}
        onPrevious={handlePrevious}
      >
        <PhotoCard photo={currentPhoto} />
      </SwipeableCard>
      <GroupProgressBar
        current={groupIndex}
        total={currentGroup.length}
        markedDelete={markedForDelete.size}
        markedKeep={markedForKeep.size}
        onSelectIndex={setGroupIndex}
      />
      <LimitReachedModal
        visible={limitModalVisible}
        onClose={() => setLimitModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Tokens.color.background },
  centered: { flex: 1, backgroundColor: Tokens.color.background, justifyContent: 'center', alignItems: 'center', padding: Tokens.spacing.xxl },
  errorText: { ...Tokens.typography.body, color: Tokens.color.danger, textAlign: 'center' },
});
