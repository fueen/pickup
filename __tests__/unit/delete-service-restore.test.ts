import * as MediaLibrary from 'expo-media-library';
import { deletePhotos, restoreDeletedPhotos } from '../../src/services/delete-service';
import { addRecentDeletes, removeRecentDeletes } from '../../src/services/stats-service';
import { DeletedPhotoRecord, PhotoAsset } from '../../src/types/photo';

const mockExistingUris = new Set<string>();
const mockFileSizes = new Map<string, number>();

jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation((uri: string) => ({
    exists: mockExistingUris.has(uri),
    size: mockFileSizes.get(uri) ?? 1024,
    copy: jest.fn(),
  })),
  Directory: jest.fn().mockImplementation(() => ({
    exists: true,
    create: jest.fn(),
  })),
  Paths: { cache: 'file:///cache/' },
}));

jest.mock('expo-media-library', () => ({
  deleteAssetsAsync: jest.fn(),
  createAssetAsync: jest.fn(),
}));

jest.mock('../../src/services/stats-service', () => ({
  addRecentDeletes: jest.fn(() => Promise.resolve()),
  removeRecentDeletes: jest.fn(() => Promise.resolve()),
}));

const mockDeleteAssetsAsync = MediaLibrary.deleteAssetsAsync as jest.Mock;
const mockCreateAssetAsync = MediaLibrary.createAssetAsync as jest.Mock;
const mockAddRecentDeletes = addRecentDeletes as jest.Mock;
const mockRemoveRecentDeletes = removeRecentDeletes as jest.Mock;

function makeRecord(id: string, uri = `file:///cache/${id}.jpg`): DeletedPhotoRecord {
  return {
    id,
    uri,
    width: 100,
    height: 100,
    creationTime: 1000,
    fileSize: 1200,
    deletedAt: 2000,
    mediaType: 'photo',
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockExistingUris.clear();
  mockFileSizes.clear();
  mockDeleteAssetsAsync.mockResolvedValue(true);
  mockCreateAssetAsync.mockResolvedValue({ id: 'asset-id' });
});

function makePhoto(id: string, uri = `file:///photos/${id}.jpg`): PhotoAsset {
  return {
    id,
    uri,
    width: 100,
    height: 100,
    creationTime: 1000,
    fileSize: 1200,
    mediaType: 'photo',
    albumIds: [],
  };
}

describe('deletePhotos', () => {
  it('uses a pixel estimate when file size reads as zero', async () => {
    const photo = { ...makePhoto('zero-size'), fileSize: 0, width: 1000, height: 800 };
    mockFileSizes.set(photo.uri, 0);

    const result = await deletePhotos([photo]);

    expect(result.freedBytes).toBe(960000);
    expect(mockAddRecentDeletes).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'zero-size',
        fileSize: 960000,
      }),
    ]);
  });

  it('treats deleteAssetsAsync false as a failed delete and does not write recent deletes', async () => {
    const photo = makePhoto('failed-delete');
    mockDeleteAssetsAsync.mockResolvedValue(false);

    const result = await deletePhotos([photo]);

    expect(result.successCount).toBe(0);
    expect(result.failedCount).toBe(1);
    expect(mockAddRecentDeletes).not.toHaveBeenCalled();
  });
});

describe('restoreDeletedPhotos', () => {
  it('restores cached records and removes successful ids from recent deletes', async () => {
    const records = [makeRecord('a'), makeRecord('b')];
    records.forEach((record) => mockExistingUris.add(record.uri));

    const result = await restoreDeletedPhotos(records);

    expect(mockCreateAssetAsync).toHaveBeenCalledWith(records[0].uri);
    expect(mockCreateAssetAsync).toHaveBeenCalledWith(records[1].uri);
    expect(mockRemoveRecentDeletes).toHaveBeenCalledWith(['a', 'b']);
    expect(result).toEqual({
      successCount: 2,
      failedCount: 0,
      restoredIds: ['a', 'b'],
      failedIds: [],
      errors: [],
    });
  });

  it('skips records whose cached files no longer exist', async () => {
    const existing = makeRecord('existing');
    const missing = makeRecord('missing');
    mockExistingUris.add(existing.uri);

    const result = await restoreDeletedPhotos([existing, missing]);

    expect(mockCreateAssetAsync).toHaveBeenCalledTimes(1);
    expect(mockCreateAssetAsync).toHaveBeenCalledWith(existing.uri);
    expect(mockRemoveRecentDeletes).toHaveBeenCalledWith(['existing']);
    expect(result.successCount).toBe(1);
    expect(result.failedCount).toBe(1);
    expect(result.failedIds).toEqual(['missing']);
  });

  it('keeps failed createAssetAsync records in recent deletes', async () => {
    const ok = makeRecord('ok');
    const fail = makeRecord('fail');
    mockExistingUris.add(ok.uri);
    mockExistingUris.add(fail.uri);
    mockCreateAssetAsync
      .mockResolvedValueOnce({ id: 'ok-asset' })
      .mockRejectedValueOnce(new Error('create failed'));

    const result = await restoreDeletedPhotos([ok, fail]);

    expect(mockRemoveRecentDeletes).toHaveBeenCalledWith(['ok']);
    expect(result.successCount).toBe(1);
    expect(result.failedCount).toBe(1);
    expect(result.restoredIds).toEqual(['ok']);
    expect(result.failedIds).toEqual(['fail']);
    expect(result.errors).toEqual(['create failed']);
  });
});
