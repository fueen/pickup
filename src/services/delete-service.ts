import * as MediaLibrary from 'expo-media-library';
import { File } from 'expo-file-system';
import { PhotoAsset } from '../types/photo';

export interface DeleteResult {
  successCount: number;
  failedCount: number;
  freedBytes: number;
  errors: string[];
}

export async function deletePhotos(photos: PhotoAsset[]): Promise<DeleteResult> {
  let totalFreed = 0;
  for (const photo of photos) {
    try {
      const f = new File(photo.uri);
      totalFreed += f.size;
    } catch {
      // ignore individual size failures
    }
  }

  try {
    await MediaLibrary.deleteAssetsAsync(photos.map((p) => p.id));
    return { successCount: photos.length, failedCount: 0, freedBytes: totalFreed, errors: [] };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'delete failed';
    return { successCount: 0, failedCount: photos.length, freedBytes: totalFreed, errors: [message] };
  }
}
