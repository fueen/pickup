import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { PhotoAsset } from '../types/photo';

export interface DeleteResult {
  successCount: number;
  failedCount: number;
  freedBytes: number;
  errors: string[];
}

export async function deletePhotos(photos: PhotoAsset[]): Promise<DeleteResult> {
  const ids = photos.map((p) => p.id);

  let totalBytes = 0;
  try {
    const infos = await Promise.all(
      photos.map((p) => FileSystem.getInfoAsync(p.uri)),
    );
    totalBytes = infos.reduce(
      (sum, info) => sum + (info.exists ? info.size ?? 0 : 0),
      0,
    );
  } catch {
    // If file info fails, proceed with 0 bytes
  }

  try {
    await MediaLibrary.deleteAssetsAsync(ids);
    return { successCount: ids.length, failedCount: 0, freedBytes: totalBytes, errors: [] };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'delete failed';
    return { successCount: 0, failedCount: ids.length, freedBytes: 0, errors: [message] };
  }
}
