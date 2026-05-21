import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { usePhotoContext } from '../src/contexts/PhotoContext';
import { useSessionContext } from '../src/contexts/SessionContext';
import { PhotoCard } from '../src/components/photo-card/PhotoCard';
import { GroupProgressBar } from '../src/components/photo-card/GroupProgressBar';
import { SwipeableCard } from '../src/components/gesture/SwipeableCard';
import { PermissionGate } from '../src/components/photo-card/PermissionGate';
import { LoadingGate } from '../src/components/photo-card/LoadingGate';
import { EmptyGate } from '../src/components/photo-card/EmptyGate';
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

  useEffect(() => {
    if (permissionStatus === 'undetermined') {
      requestPermissions().then((status) => {
        if (status === 'granted' || status === 'limited') {
          loadPhotos();
        }
      });
    } else if (permissionStatus === 'granted' || permissionStatus === 'limited') {
      loadPhotos();
    }
  }, [permissionStatus]);

  const advanceToNext = useCallback(() => {
    if (groupIndex + 1 >= Tokens.photo.groupSize) {
      router.push('/review');
    } else {
      setGroupIndex(groupIndex + 1);
    }
  }, [groupIndex, setGroupIndex, router]);

  const handleMarkDelete = useCallback(() => {
    const photo = currentGroup[groupIndex];
    if (!photo) return;
    setMarkedForDelete((prev) => new Set(prev).add(photo.id));
    dispatch({ type: 'MARK_DELETE', payload: photo.id });
    advanceToNext();
  }, [currentGroup, groupIndex, advanceToNext]);

  const handleMarkKeep = useCallback(() => {
    const photo = currentGroup[groupIndex];
    if (!photo) return;
    setMarkedForKeep((prev) => new Set(prev).add(photo.id));
    dispatch({ type: 'MARK_KEEP', payload: photo.id });
    advanceToNext();
  }, [currentGroup, groupIndex, advanceToNext]);

  const handleSkip = useCallback(() => {
    const photo = currentGroup[groupIndex];
    if (!photo) return;
    dispatch({ type: 'SKIP', payload: photo.id });
    advanceToNext();
  }, [currentGroup, groupIndex, advanceToNext]);

  if (permissionStatus === 'denied' || permissionStatus === 'undetermined') {
    return <PermissionGate status={permissionStatus} onRequest={requestPermissions} />;
  }
  if (isLoading) return <LoadingGate />;
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>加载失败：{error}</Text>
      </View>
    );
  }
  if (allPhotos.length === 0) return <EmptyGate />;

  const currentPhoto = currentGroup[groupIndex];
  if (!currentPhoto) {
    loadNextGroup();
    return <LoadingGate />;
  }

  return (
    <View style={styles.container}>
      <SwipeableCard
        onMarkDelete={handleMarkDelete}
        onMarkKeep={handleMarkKeep}
        onSkip={handleSkip}
      >
        <PhotoCard photo={currentPhoto} />
      </SwipeableCard>
      <GroupProgressBar
        current={groupIndex}
        total={Tokens.photo.groupSize}
        markedDelete={markedForDelete.size}
        markedKeep={markedForKeep.size}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Tokens.color.background },
  centered: { flex: 1, backgroundColor: Tokens.color.background, justifyContent: 'center', alignItems: 'center', padding: Tokens.spacing.xxl },
  errorText: { ...Tokens.typography.body, color: Tokens.color.danger, textAlign: 'center' },
});
