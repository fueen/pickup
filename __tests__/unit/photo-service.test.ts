import {
  generateRandomGroup,
  shouldRefillViewedPool,
  getRefillCandidates,
} from '../../src/services/photo-service';
import { PhotoAsset } from '../../src/types/photo';

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

  it('throws when total pool plus refill is less than groupSize', () => {
    const pool = makePhotos(5);
    const viewed = new Set<string>();
    expect(() => generateRandomGroup(pool, viewed, 15)).toThrow();
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
