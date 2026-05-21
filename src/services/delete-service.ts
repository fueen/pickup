import * as MediaLibrary from 'expo-media-library';

export interface DeleteResult {
  successCount: number;
  failedCount: number;
  freedBytes: number;
  errors: string[];
}

export async function deletePhotos(photoIds: string[]): Promise<DeleteResult> {
  try {
    await MediaLibrary.deleteAssetsAsync(photoIds);
    return { successCount: photoIds.length, failedCount: 0, freedBytes: 0, errors: [] };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'delete failed';
    return { successCount: 0, failedCount: photoIds.length, freedBytes: 0, errors: [message] };
  }
}
