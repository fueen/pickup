import { useState, useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MonthScope, PhotoAsset, PermissionStatus } from '../types/photo';
import {
  filterPhotosByMonthScope,
  generateGroup,
  getViewedStateForSortChange,
  hasRemainingPhotosInMonthScope,
  shouldResetViewedForInitialLoad,
  shouldReloadPhotosForSortChange,
} from '../services/photo-service';
import { SortMode } from '../types/photo';
import { Tokens } from '../design-tokens';
import { toPhotoAsset } from '../utils/photo-asset-utils';

const VIEWED_IDS_KEY = 'viewedPhotoIds';
const VIEWED_ORDER_KEY = 'viewedPhotoOrder';
const SORT_MODE_KEY = 'sortMode';

interface LoadPhotosOptions {
  sortModeOverride?: SortMode;
  resetViewed?: boolean;
  monthScopeOverride?: MonthScope | null;
}

async function loadLivePhotoInfoById(albumId?: string): Promise<Map<string, any>> {
  const liveInfoById = new Map<string, any>();
  if (Platform.OS !== 'ios') return liveInfoById;

  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const options: MediaLibrary.AssetsOptions = {
      mediaType: ['photo'],
      mediaSubtypes: ['livePhoto'],
      first: 500,
      after: cursor,
    };
    if (albumId && albumId !== '__all__') {
      options.album = albumId;
    }

    const page = await MediaLibrary.getAssetsAsync(options);
    for (const asset of page.assets) {
      try {
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
        liveInfoById.set(asset.id, assetInfo);
      } catch {
        liveInfoById.set(asset.id, asset);
      }
    }
    hasMore = page.hasNextPage;
    cursor = page.endCursor;
  }

  return liveInfoById;
}

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
  const [sortMode, setSortMode] = useState<SortMode>('random');
  const [monthScope, setMonthScope] = useState<MonthScope | null>(null);

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

  const loadPhotos = useCallback(async (albumId?: string, options: LoadPhotosOptions = {}) => {
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

      const liveInfoById = await loadLivePhotoInfoById(albumId);

      const loadedPhotos: PhotoAsset[] = await Promise.all(allAssets.map(async (asset) => {
        const knownLiveInfo = liveInfoById.get(asset.id);
        if (knownLiveInfo) {
          return toPhotoAsset(asset as any, knownLiveInfo);
        }

        const subtypes = (asset as any).mediaSubtypes as string[] | undefined;
        const looksLikeLivePhoto = String(asset.mediaType) === 'livePhoto' || subtypes?.includes('livePhoto');

        if (!looksLikeLivePhoto) {
          return toPhotoAsset(asset as any);
        }

        try {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
          return toPhotoAsset({ ...(asset as any), ...(assetInfo as any) });
        } catch {
          return toPhotoAsset(asset as any);
        }
      }));
      const activeMonthScope = options.monthScopeOverride !== undefined
        ? options.monthScopeOverride
        : monthScope;
      const photos = filterPhotosByMonthScope(loadedPhotos, activeMonthScope);
      setMonthScope(activeMonthScope);
      setAllPhotos(photos);
      setGroupIndex(0);
      setMarkedForDelete(new Set());
      setMarkedForKeep(new Set());

      if (photos.length === 0) {
        setCurrentGroup([]);
        setIsLoading(false);
        return;
      }

      const savedIds = await AsyncStorage.getItem(VIEWED_IDS_KEY);
      const savedOrder = await AsyncStorage.getItem(VIEWED_ORDER_KEY);
      const savedSortMode = await AsyncStorage.getItem(SORT_MODE_KEY);
      const currentSortMode: SortMode = options.sortModeOverride ?? ((savedSortMode as SortMode) || 'random');
      const resetViewed = shouldResetViewedForInitialLoad(currentSortMode, options.resetViewed);
      const idSet: Set<string> = resetViewed || !savedIds ? new Set() : new Set(JSON.parse(savedIds));
      const orderArr: string[] = resetViewed || !savedOrder ? [] : JSON.parse(savedOrder);
      setViewedPhotoIds(idSet);
      viewedOrderRef.current = orderArr;
      setSortMode(currentSortMode);

      const group = generateGroup(photos, idSet, Tokens.photo.groupSize, orderArr, currentSortMode);
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
  }, [monthScope]);

  const loadNextGroup = useCallback(() => {
    try {
      const group = generateGroup(allPhotos, viewedPhotoIds, Tokens.photo.groupSize, viewedOrderRef.current, sortMode);
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
  }, [allPhotos, viewedPhotoIds, sortMode]);

  const clearMarkedPhotos = useCallback(() => {
    if (markedForDelete.size === 0) return;
    const remainingPhotos = allPhotos.filter((p) => !markedForDelete.has(p.id));
    setAllPhotos(remainingPhotos);
  }, [allPhotos, markedForDelete]);

  const clearMonthScope = useCallback(() => {
    setMonthScope(null);
  }, []);

  // REQ-09: refill group after quick-delete to maintain group size
  const refillGroup = useCallback((deleteCount: number) => {
    setCurrentGroup((prev) => {
      const remaining = prev.filter((p) => !markedForDelete.has(p.id));
      const excludedIds = new Set(prev.map((p) => p.id));

      try {
        const newIds = new Set(viewedPhotoIds);
        const currentOrder = [...viewedOrderRef.current];
        const fillCount = Math.min(deleteCount, Tokens.photo.groupSize);
        const newPhotos = generateGroup(
          allPhotos.filter((p) => !markedForDelete.has(p.id)),
          newIds,
          fillCount,
          currentOrder,
          sortMode,
          { excludedIds },
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
  }, [allPhotos, viewedPhotoIds, markedForDelete, sortMode]);

  const changeSortMode = useCallback(async (newMode: SortMode, albumId?: string) => {
    const previousMode = sortMode;
    setSortMode(newMode);
    await AsyncStorage.setItem(SORT_MODE_KEY, newMode);

    if (shouldReloadPhotosForSortChange(previousMode, newMode)) {
      await loadPhotos(albumId, { sortModeOverride: newMode, resetViewed: true });
      return;
    }

    try {
      const viewedState = getViewedStateForSortChange(
        previousMode,
        newMode,
        viewedPhotoIds,
        viewedOrderRef.current,
      );
      const group = generateGroup(
        allPhotos, viewedState.viewedPhotoIds, Tokens.photo.groupSize,
        viewedState.viewedOrder, newMode,
      );
      setCurrentGroup(group);
      setGroupIndex(0);
      setMarkedForDelete(new Set());
      setMarkedForKeep(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : '排序切换失败');
    }
  }, [allPhotos, loadPhotos, sortMode, viewedPhotoIds]);

  return {
    allPhotos, currentGroup, groupIndex, setGroupIndex,
    viewedPhotoIds, markedForDelete, setMarkedForDelete,
    markedForKeep, setMarkedForKeep, isLoading,
    permissionStatus, error, requestPermissions,
    loadPhotos, loadNextGroup, clearMarkedPhotos, refillGroup,
    sortMode, changeSortMode,
    monthScope, setMonthScope, clearMonthScope,
    hasRemainingInMonthScope: (photos: PhotoAsset[] = allPhotos) => hasRemainingPhotosInMonthScope(photos, monthScope),
  };
}
