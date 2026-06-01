import * as MediaLibrary from 'expo-media-library';
import { File, Directory, Paths } from 'expo-file-system';
import { PhotoAsset, DeletedPhotoRecord } from '../types/photo';
import { addRecentDeletes, removeRecentDeletes } from './stats-service';
import { estimateDeleteBytes } from '../utils/delete-confirm-utils';

export interface DeleteResult {
  successCount: number;
  failedCount: number;
  freedBytes: number;
  errors: string[];
}

export interface RestoreResult {
  successCount: number;
  failedCount: number;
  restoredIds: string[];
  failedIds: string[];
  errors: string[];
}

function getPhotoSize(photo: PhotoAsset): number {
  if (photo.fileSize > 0) {
    return photo.fileSize;
  }

  try {
    const f = new File(photo.uri);
    if (f.size > 0) return f.size;
  } catch {
    // File constructor may throw on Android content:// URIs
  }
  return estimateDeleteBytes(photo);
}

/**
 * Copy a photo to the app cache directory before deletion,
 * so the thumbnail remains viewable on the recent-deletes page.
 * Returns the cache path, or null if caching fails (non-blocking).
 */
function ensureCacheDir(): Directory {
  const cacheDir = new Directory(Paths.cache, 'deleted-thumbnails');
  if (!cacheDir.exists) {
    cacheDir.create({ idempotent: true });
  }
  return cacheDir;
}

function cachePhotoBeforeDelete(photo: PhotoAsset, cacheDir: Directory): string | null {
  try {
    const dest = new File(cacheDir, `${photo.id}.jpg`);
    new File(photo.uri).copy(dest);
    return dest.uri;
  } catch {
    // Cache failure is non-blocking — fall back to original URI
    return null;
  }
}

export async function deletePhotos(photos: PhotoAsset[]): Promise<DeleteResult> {
  let totalFreed = 0;
  const records: DeletedPhotoRecord[] = [];
  const now = Date.now();

  // Cache photos before deletion so thumbnails remain viewable
  const cacheDir = ensureCacheDir();
  const cacheResults = photos.map((photo) => cachePhotoBeforeDelete(photo, cacheDir));

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const size = getPhotoSize(photo);
    totalFreed += size;
    records.push({
      id: photo.id,
      uri: cacheResults[i] ?? photo.uri,
      width: photo.width,
      height: photo.height,
      creationTime: photo.creationTime,
      fileSize: size,
      deletedAt: now,
      mediaType: photo.mediaType,
    });
  }

  try {
    const deleted = await MediaLibrary.deleteAssetsAsync(photos.map((p) => p.id));
    if (deleted === false) {
      throw new Error('delete was cancelled or rejected');
    }
    await addRecentDeletes(records);
    return { successCount: photos.length, failedCount: 0, freedBytes: totalFreed, errors: [] };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'delete failed';
    return { successCount: 0, failedCount: photos.length, freedBytes: 0, errors: [message] };
  }
}

function canRestoreRecord(record: DeletedPhotoRecord): boolean {
  try {
    return new File(record.uri).exists;
  } catch {
    return false;
  }
}

export async function restoreDeletedPhotos(records: DeletedPhotoRecord[]): Promise<RestoreResult> {
  const restoredIds: string[] = [];
  const failedIds: string[] = [];
  const errors: string[] = [];

  for (const record of records) {
    if (!canRestoreRecord(record)) {
      failedIds.push(record.id);
      errors.push(`missing cached file: ${record.id}`);
      continue;
    }

    try {
      await MediaLibrary.createAssetAsync(record.uri);
      restoredIds.push(record.id);
    } catch (e) {
      failedIds.push(record.id);
      errors.push(e instanceof Error ? e.message : `restore failed: ${record.id}`);
    }
  }

  if (restoredIds.length > 0) {
    await removeRecentDeletes(restoredIds);
  }

  return {
    successCount: restoredIds.length,
    failedCount: failedIds.length,
    restoredIds,
    failedIds,
    errors,
  };
}
