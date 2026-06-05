import {
  filterPhotosByMonthScope,
  generateGroup,
  generateRandomGroup,
  getViewedStateForSortChange,
  hasRemainingPhotosInMonthScope,
  shouldRefillViewedPool,
  shouldReloadPhotosForSortChange,
  getRefillCandidates,
} from '../../src/services/photo-service';
import { MonthScope, PhotoAsset } from '../../src/types/photo';

function makePhoto(id: string): PhotoAsset {
  return {
    id,
    uri: `file:///photos/${id}.jpg`,
    width: 1080,
    height: 1920,
    mediaType: 'photo',
    creationTime: Date.now(),
    fileSize: 2_000_000,
    albumIds: [],
  };
}

function makePhotos(count: number): PhotoAsset[] {
  return Array.from({ length: count }, (_, i) => makePhoto(`photo-${i}`));
}

function makePhotoAt(id: string, year: number, monthIndex: number, day: number): PhotoAsset {
  return {
    ...makePhoto(id),
    creationTime: new Date(year, monthIndex, day).getTime(),
  };
}

describe('generateRandomGroup', () => {
  it('returns exactly groupSize photos', () => {
    const pool = makePhotos(100);
    const viewed = new Set<string>();
    const result = generateRandomGroup(pool, viewed, 15);
    expect(result.length).toBe(15);
  });

  it('avoids already-viewed photos', () => {
    const pool = makePhotos(100);
    const viewed = new Set(pool.slice(0, 50).map((p) => p.id));
    const result = generateRandomGroup(pool, viewed, 15);
    const hasViewed = result.some((p) => viewed.has(p.id));
    expect(hasViewed).toBe(false);
  });

  it('uses FIFO refill when candidate pool is too small', () => {
    const pool = makePhotos(20);
    const viewed = new Set(pool.slice(0, 15).map((p) => p.id));
    const result = generateRandomGroup(pool, viewed, 15);
    expect(result.length).toBe(15);
  });

  it('returns all available photos when pool is smaller than groupSize', () => {
    const pool = makePhotos(5);
    const viewed = new Set<string>();
    const result = generateRandomGroup(pool, viewed, 15);
    expect(result.length).toBe(5);
  });
});

describe('generateGroup', () => {
  it('refills from viewed photos that exist in the current album pool', () => {
    const pool = [makePhoto('album-photo-1'), makePhoto('album-photo-2')];
    const viewed = new Set(['album-photo-1', 'album-photo-2']);
    const viewedOrder = ['other-album-1', 'other-album-2', 'album-photo-1', 'album-photo-2'];

    const result = generateGroup(pool, viewed, 2, viewedOrder, 'timeOldest');

    expect(result.map((photo) => photo.id)).toEqual(['album-photo-1', 'album-photo-2']);
  });

  it('excludes current group leftovers and deleted photos when refilling', () => {
    const pool = makePhotos(8);
    const viewed = new Set(pool.slice(0, 6).map((p) => p.id));
    const viewedOrder = pool.slice(0, 6).map((p) => p.id);
    const excludedIds = new Set(['photo-0', 'photo-1', 'photo-6']);

    const result = generateGroup(pool, viewed, 3, viewedOrder, 'timeOldest', { excludedIds });

    expect(result.map((photo) => photo.id)).toEqual(['photo-7', 'photo-2', 'photo-3']);
    expect(result.some((photo) => excludedIds.has(photo.id))).toBe(false);
  });
});

describe('month scope helpers', () => {
  const may2026: MonthScope = { year: 2026, monthIndex: 4, label: '2026年5月' };

  it('filters photos to the selected year and month using creationTime', () => {
    const photos = [
      makePhotoAt('apr-last', 2026, 3, 30),
      makePhotoAt('may-start', 2026, 4, 1),
      makePhotoAt('may-mid', 2026, 4, 15),
      makePhotoAt('jun-start', 2026, 5, 1),
      makePhotoAt('may-other-year', 2025, 4, 10),
    ];

    const result = filterPhotosByMonthScope(photos, may2026);

    expect(result.map((photo) => photo.id)).toEqual(['may-start', 'may-mid']);
  });

  it('reports whether a selected month still has remaining photos', () => {
    const photos = [
      makePhotoAt('may-1', 2026, 4, 2),
      makePhotoAt('may-2', 2026, 4, 3),
      makePhotoAt('june-1', 2026, 5, 2),
    ];

    expect(hasRemainingPhotosInMonthScope(photos, may2026)).toBe(true);
    expect(hasRemainingPhotosInMonthScope(photos.filter((photo) => photo.id === 'june-1'), may2026)).toBe(false);
  });
});

describe('sort change refresh policy', () => {
  it('requires a media-library reload when switching to newest-first sorting', () => {
    expect(shouldReloadPhotosForSortChange('random', 'timeNewest')).toBe(true);
    expect(shouldReloadPhotosForSortChange('sizeDesc', 'timeNewest')).toBe(true);
    expect(shouldReloadPhotosForSortChange('timeOldest', 'timeNewest')).toBe(true);
    expect(shouldReloadPhotosForSortChange('timeNewest', 'timeNewest')).toBe(true);
  });

  it('resets viewed state when switching to newest-first sorting', () => {
    const viewed = new Set(['old-photo-1', 'old-photo-2']);
    const order = ['old-photo-2', 'old-photo-1'];

    const result = getViewedStateForSortChange('random', 'timeNewest', viewed, order);

    expect([...result.viewedPhotoIds]).toEqual([]);
    expect(result.viewedOrder).toEqual([]);
  });

  it('keeps viewed state for non-newest sort changes', () => {
    const viewed = new Set(['photo-1']);
    const order = ['photo-1'];

    const result = getViewedStateForSortChange('random', 'sizeDesc', viewed, order);

    expect([...result.viewedPhotoIds]).toEqual(['photo-1']);
    expect(result.viewedOrder).toEqual(['photo-1']);
  });
});

describe('shouldRefillViewedPool', () => {
  it('returns true when candidates < groupSize', () => {
    const pool = makePhotos(20);
    const viewed = new Set(pool.slice(0, 18).map((p) => p.id));
    expect(shouldRefillViewedPool(pool, viewed, 15)).toBe(true);
  });

  it('returns false when candidates >= groupSize', () => {
    const pool = makePhotos(100);
    const viewed = new Set<string>();
    expect(shouldRefillViewedPool(pool, viewed, 15)).toBe(false);
  });
});

describe('getRefillCandidates', () => {
  it('returns oldest viewed photos as FIFO candidates', () => {
    const pool = makePhotos(30);
    const viewedOrder = pool.slice(0, 20).map((p) => p.id);
    const viewed = new Set(viewedOrder);
    const count = 10;
    const result = getRefillCandidates(pool, viewed, viewedOrder, count);
    expect(result.length).toBeLessThanOrEqual(count);
  });
});
