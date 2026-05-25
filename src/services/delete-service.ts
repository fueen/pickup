import * as MediaLibrary from 'expo-media-library';
import { File } from 'expo-file-system';
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

export async function deletePhotos(photos: PhotoAsset[]): Promise<DeleteResult> {
  let totalFreed = 0;
  const records: DeletedPhotoRecord[] = [];
  const now = Date.now();

  for (const photo of photos) {
    const size = getPhotoSize(photo);
    totalFreed += size;
    records.push({
      id: photo.id,
      uri: photo.uri,
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
