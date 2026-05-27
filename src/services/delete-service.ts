import * as MediaLibrary from 'expo-media-library';
import { File, Directory, Paths } from 'expo-file-system';
import { PhotoAsset, DeletedPhotoRecord } from '../types/photo';
import { addRecentDeletes } from './stats-service';

export interface DeleteResult {
  successCount: number;
  failedCount: number;
  freedBytes: number;
  errors: string[];
}

function estimateFileSize(width: number, height: number): number {
  return Math.round(width * height * 3 * 0.4);
}

function getPhotoSize(photo: PhotoAsset): number {
  try {
    const f = new File(photo.uri);
    if (f.size > 0) return f.size;
  } catch {
    // File constructor may throw on Android content:// URIs
  }
  return estimateFileSize(photo.width, photo.height);
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
    await MediaLibrary.deleteAssetsAsync(photos.map((p) => p.id));
    await addRecentDeletes(records);
    return { successCount: photos.length, failedCount: 0, freedBytes: totalFreed, errors: [] };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'delete failed';
    return { successCount: 0, failedCount: photos.length, freedBytes: 0, errors: [message] };
  }
}
