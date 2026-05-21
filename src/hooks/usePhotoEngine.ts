import { useState, useCallback, useRef } from 'react';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhotoAsset, PermissionStatus } from '../types/photo';
import { generateRandomGroup } from '../services/photo-service';
import { Tokens } from '../design-tokens';

const VIEWED_IDS_KEY = 'viewedPhotoIds';
const VIEWED_ORDER_KEY = 'viewedPhotoOrder';

export function usePhotoEngine() {
  const [allPhotos, setAllPhotos] = useState<PhotoAsset[]>([]);
  const [currentGroup, setCurrentGroup] = useState<PhotoAsset[]>([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [viewedPhotoIds, setViewedPhotoIds] = useState<Set<string>>(new Set());
  const [markedForDelete, setMarkedForDelete] = useState<Set<string>>(new Set());
  const [markedForKeep, setMarkedForKeep] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [error, setError] = useState<string | null>(null);

  const viewedOrderRef = useRef<string[]>([]);

  const requestPermissions = useCallback(async () => {
    const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
    const statusStr: string = status;
    if (statusStr === 'granted' || statusStr === 'limited') {
      setPermissionStatus(statusStr as PermissionStatus);
      return statusStr as PermissionStatus;
    }
    if (canAskAgain) {
      const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
      const newStatusStr: string = newStatus;
      const mapped: PermissionStatus =
        newStatusStr === 'granted' || newStatusStr === 'limited'
          ? (newStatusStr as PermissionStatus)
          : 'denied';
      setPermissionStatus(mapped);
      return mapped;
    }
    setPermissionStatus('denied');
    return 'denied' as PermissionStatus;
  }, []);

  const loadPhotos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: ['photo'],
        first: 0,
      });
      const photos: PhotoAsset[] = assets.map((a) => ({
        id: a.id,
        uri: a.uri,
        width: a.width,
        height: a.height,
        mediaType: (a.mediaType as PhotoAsset['mediaType']) || 'photo',
        creationTime: a.creationTime,
        fileSize: 0,
        albumIds: a.albumId ? [a.albumId] : [],
      }));
      setAllPhotos(photos);

      const savedIds = await AsyncStorage.getItem(VIEWED_IDS_KEY);
      const savedOrder = await AsyncStorage.getItem(VIEWED_ORDER_KEY);
      const idSet: Set<string> = savedIds ? new Set(JSON.parse(savedIds)) : new Set();
      const orderArr: string[] = savedOrder ? JSON.parse(savedOrder) : [];
      setViewedPhotoIds(idSet);
      viewedOrderRef.current = orderArr;

      const group = generateRandomGroup(photos, idSet, Tokens.photo.groupSize, orderArr);
      setCurrentGroup(group);

      const newIds = new Set(idSet);
      group.forEach((p) => newIds.add(p.id));
      setViewedPhotoIds(newIds);
      const newOrder = [
        ...group.map((p) => p.id),
        ...orderArr.filter((id) => !group.find((p) => p.id === id)),
      ];
      viewedOrderRef.current = newOrder;
      await AsyncStorage.multiSet([
        [VIEWED_IDS_KEY, JSON.stringify([...newIds])],
        [VIEWED_ORDER_KEY, JSON.stringify(newOrder)],
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load photos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadNextGroup = useCallback(() => {
    try {
      const group = generateRandomGroup(allPhotos, viewedPhotoIds, Tokens.photo.groupSize, viewedOrderRef.current);
      setCurrentGroup(group);
      setGroupIndex(0);
      setMarkedForDelete(new Set());
      setMarkedForKeep(new Set());

      const newIds = new Set(viewedPhotoIds);
      group.forEach((p) => newIds.add(p.id));
      setViewedPhotoIds(newIds);
      const newOrder = [
        ...group.map((p) => p.id),
        ...viewedOrderRef.current.filter((id) => !group.find((p) => p.id === id)),
      ];
      viewedOrderRef.current = newOrder;
      AsyncStorage.multiSet([
        [VIEWED_IDS_KEY, JSON.stringify([...newIds])],
        [VIEWED_ORDER_KEY, JSON.stringify(newOrder)],
      ]).catch((e) => console.warn('Failed to persist viewed state:', e));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load next group');
    }
  }, [allPhotos, viewedPhotoIds]);

  const clearMarkedPhotos = useCallback(() => {
    if (markedForDelete.size === 0) return;
    const remainingPhotos = allPhotos.filter((p) => !markedForDelete.has(p.id));
    setAllPhotos(remainingPhotos);
  }, [allPhotos, markedForDelete]);

  return {
    allPhotos, currentGroup, groupIndex, setGroupIndex,
    viewedPhotoIds, markedForDelete, setMarkedForDelete,
    markedForKeep, setMarkedForKeep, isLoading,
    permissionStatus, error, requestPermissions,
    loadPhotos, loadNextGroup, clearMarkedPhotos,
  };
}
