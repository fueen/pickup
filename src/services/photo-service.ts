import { MonthScope, PhotoAsset, SortMode } from '../types/photo';
import { fisherYatesShuffle } from '../utils/fisher-yates';

function getSortComparator(mode: SortMode): (a: PhotoAsset, b: PhotoAsset) => number {
  switch (mode) {
    case 'sizeDesc':
      return (a, b) => (b.width * b.height) - (a.width * a.height);
    case 'timeNewest':
      return (a, b) => b.creationTime - a.creationTime;
    case 'timeOldest':
      return (a, b) => a.creationTime - b.creationTime;
    default:
      return () => 0;
  }
}

interface GenerateGroupOptions {
  excludedIds?: Set<string>;
}

export function filterPhotosByMonthScope(
  photos: PhotoAsset[],
  scope: MonthScope | null,
): PhotoAsset[] {
  if (!scope) return photos;

  return photos.filter((photo) => {
    const date = new Date(photo.creationTime);
    return date.getFullYear() === scope.year && date.getMonth() === scope.monthIndex;
  });
}

export function hasRemainingPhotosInMonthScope(
  photos: PhotoAsset[],
  scope: MonthScope | null,
): boolean {
  return filterPhotosByMonthScope(photos, scope).length > 0;
}

export function shouldReloadPhotosForSortChange(previousMode: SortMode, nextMode: SortMode): boolean {
  return nextMode === 'timeNewest';
}

export function shouldResetViewedForInitialLoad(sortMode: SortMode, explicitReset = false): boolean {
  return explicitReset || sortMode === 'timeNewest';
}

export function getViewedStateForSortChange(
  previousMode: SortMode,
  nextMode: SortMode,
  viewedPhotoIds: Set<string>,
  viewedOrder: string[],
): { viewedPhotoIds: Set<string>; viewedOrder: string[] } {
  if (shouldReloadPhotosForSortChange(previousMode, nextMode)) {
    return { viewedPhotoIds: new Set(), viewedOrder: [] };
  }

  return {
    viewedPhotoIds: new Set(viewedPhotoIds),
    viewedOrder: [...viewedOrder],
  };
}

export function generateGroup(
  allPhotos: PhotoAsset[],
  viewedPhotoIds: Set<string>,
  groupSize: number,
  viewedOrder: string[],
  sortMode: SortMode,
  options: GenerateGroupOptions = {},
): PhotoAsset[] {
  const excludedIds = options.excludedIds ?? new Set<string>();
  const availableIds = new Set(allPhotos.map((p) => p.id));
  let candidates = allPhotos.filter((p) => !viewedPhotoIds.has(p.id) && !excludedIds.has(p.id));

  if (candidates.length < groupSize) {
    const order =
      viewedOrder.length > 0
        ? viewedOrder
        : allPhotos
            .filter((p) => viewedPhotoIds.has(p.id))
            .map((p) => p.id);

    const refill = order
      .filter((id) => availableIds.has(id) && !excludedIds.has(id) && !candidates.some((p) => p.id === id))
      .slice(0, groupSize - candidates.length);
    const refillPhotos = allPhotos.filter((p) => refill.includes(p.id));
    candidates = [...candidates, ...refillPhotos];
  }

  if (candidates.length === 0) {
    throw new Error('没有可用的照片');
  }

  const size = Math.min(candidates.length, groupSize);

  if (sortMode === 'random') {
    return fisherYatesShuffle(candidates).slice(0, size);
  }

  candidates.sort(getSortComparator(sortMode));
  return candidates.slice(0, size);
}

export function generateRandomGroup(
  allPhotos: PhotoAsset[],
  viewedPhotoIds: Set<string>,
  groupSize: number,
  viewedOrder: string[] = [],
): PhotoAsset[] {
  return generateGroup(allPhotos, viewedPhotoIds, groupSize, viewedOrder, 'random');
}

export function shouldRefillViewedPool(
  allPhotos: PhotoAsset[],
  viewedPhotoIds: Set<string>,
  groupSize: number,
): boolean {
  const candidates = allPhotos.filter((p) => !viewedPhotoIds.has(p.id));
  return candidates.length < groupSize;
}

export function getRefillCandidates(
  allPhotos: PhotoAsset[],
  viewedPhotoIds: Set<string>,
  viewedOrder: string[],
  count: number,
): PhotoAsset[] {
  const refillIds = viewedOrder.slice(0, count);
  return allPhotos.filter((p) => refillIds.includes(p.id));
}
