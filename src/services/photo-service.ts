import { PhotoAsset, SortMode } from '../types/photo';
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

export function generateGroup(
  allPhotos: PhotoAsset[],
  viewedPhotoIds: Set<string>,
  groupSize: number,
  viewedOrder: string[],
  sortMode: SortMode,
): PhotoAsset[] {
  let candidates = allPhotos.filter((p) => !viewedPhotoIds.has(p.id));

  if (candidates.length < groupSize) {
    const order =
      viewedOrder.length > 0
        ? viewedOrder
        : allPhotos
            .filter((p) => viewedPhotoIds.has(p.id))
            .map((p) => p.id);

    const refillCount = Math.min(groupSize - candidates.length, order.length);
    const refill = order.slice(0, refillCount);
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
