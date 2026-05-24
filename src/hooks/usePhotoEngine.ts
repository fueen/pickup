import { useState, useCallback, useEffect, useRef } from 'react';
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

  // Check real permission status on mount without prompting
  useEffect(() => {
    MediaLibrary.getPermissionsAsync().then(({ status }) => {
      const s: string = status;
      if (s === 'granted' || s === 'limited' || s === 'denied') {
        setPermissionStatus(s as PermissionStatus);
      }
    }).catch(() => { /* ignore, stay undetermined */ });
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
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
    } catch (e) {
      const message = e instanceof Error ? e.message : '未知错误';
      if (message.includes('rejected') || message.includes('not available')) {
        setError('原生模块未加载，请使用 development build 运行');
      } else {
        setError(`权限请求失败：${message}`);
      }
      setPermissionStatus('denied');
      return 'denied' as PermissionStatus;
    }
  }, []);

  const loadPhotos = useCallback(async (albumId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all photos with pagination
      let allAssets: MediaLibrary.Asset[] = [];
      let cursor: string | undefined;
      let hasMore = true;

      while (hasMore) {
        const options: MediaLibrary.AssetsOptions = {
          mediaType: ['photo'],
          first: 500,
          after: cursor,
        };
        if (albumId && albumId !== '__all__') {
          options.album = albumId;
        }
        const page = await MediaLibrary.getAssetsAsync(options);
        allAssets = allAssets.concat(page.assets);
        hasMore = page.hasNextPage;
        cursor = page.endCursor;
      }

      console.log(`[pickup] Total photos found: ${allAssets.length}`);

      const photos: PhotoAsset[] = allAssets.map((a) => ({
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

      if (photos.length === 0) {
        setCurrentGroup([]);
        setIsLoading(false);
        return;
      }

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
      setError(e instanceof Error ? e.message : '加载照片失败');
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
      ]).catch((e) => console.warn('保存浏览状态失败:', e));
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载下一组失败');
    }
  }, [allPhotos, viewedPhotoIds]);

  const clearMarkedPhotos = useCallback(() => {
    if (markedForDelete.size === 0) return;
    const remainingPhotos = allPhotos.filter((p) => !markedForDelete.has(p.id));
    setAllPhotos(remainingPhotos);
  }, [allPhotos, markedForDelete]);

  // REQ-09: refill group after quick-delete to maintain group size
  const refillGroup = useCallback((deleteCount: number) => {
    setCurrentGroup((prev) => {
      const remaining = prev.filter((p) => !markedForDelete.has(p.id));

      try {
        const newIds = new Set(viewedPhotoIds);
        const currentOrder = [...viewedOrderRef.current];
        const fillCount = Math.min(deleteCount, Tokens.photo.groupSize);
        const newPhotos = generateRandomGroup(
          allPhotos.filter((p) => !markedForDelete.has(p.id)),
          newIds,
          fillCount,
          currentOrder,
        );

        newPhotos.forEach((p) => newIds.add(p.id));
        setViewedPhotoIds(newIds);
        const newOrder = [
          ...newPhotos.map((p) => p.id),
          ...currentOrder.filter((id) => !newPhotos.find((p) => p.id === id)),
        ];
        viewedOrderRef.current = newOrder;
        AsyncStorage.multiSet([
          [VIEWED_IDS_KEY, JSON.stringify([...newIds])],
          [VIEWED_ORDER_KEY, JSON.stringify(newOrder)],
        ]).catch(() => {});

        return [...remaining, ...newPhotos];
      } catch {
        return remaining;
      }
    });
  }, [allPhotos, viewedPhotoIds, markedForDelete]);

  return {
    allPhotos, currentGroup, groupIndex, setGroupIndex,
    viewedPhotoIds, markedForDelete, setMarkedForDelete,
    markedForKeep, setMarkedForKeep, isLoading,
    permissionStatus, error, requestPermissions,
    loadPhotos, loadNextGroup, clearMarkedPhotos, refillGroup,
  };
}
