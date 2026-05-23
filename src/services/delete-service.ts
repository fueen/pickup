import * as MediaLibrary from 'expo-media-library';
import { PhotoAsset } from '../types/photo';

export interface DeleteResult {
  successCount: number;
  failedCount: number;
  freedBytes: number;
  errors: string[];
}

export async function deletePhotos(photos: PhotoAsset[]): Promise<DeleteResult> {
  try {
    await MediaLibrary.deleteAssetsAsync(photos.map((p) => p.id));
    return { successCount: photos.length, failedCount: 0, freedBytes: 0, errors: [] };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'delete failed';
    return { successCount: 0, failedCount: photos.length, freedBytes: 0, errors: [message] };
  }
}
