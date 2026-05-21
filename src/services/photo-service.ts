import { PhotoAsset } from '../types/photo';
import { fisherYatesShuffle } from '../utils/fisher-yates';

export function generateRandomGroup(
  allPhotos: PhotoAsset[],
  viewedPhotoIds: Set<string>,
  groupSize: number,
  viewedOrder: string[] = [],
): PhotoAsset[] {
  let candidates = allPhotos.filter((p) => !viewedPhotoIds.has(p.id));

  if (candidates.length < groupSize) {
    // Refill from viewed photos in viewedOrder (FIFO by view time).
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

  if (candidates.length < groupSize) {
    throw new Error(
      `Not enough photos: need ${groupSize}, have ${candidates.length}`,
    );
  }

  return fisherYatesShuffle(candidates).slice(0, groupSize);
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
