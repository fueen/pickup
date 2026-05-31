import { PhotoAsset } from '../types/photo';

export function formatDeleteBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const displayValue = unitIndex === 0 || value >= 10
    ? Math.round(value)
    : Math.round(value * 10) / 10;

  return `${displayValue} ${units[unitIndex]}`;
}

export function getDeletePreviewPhotos(photos: PhotoAsset[]): PhotoAsset[] {
  return photos.slice(0, 3);
}

export function getDeleteTotalBytes(photos: PhotoAsset[]): number {
  return photos.reduce((total, photo) => total + Math.max(0, photo.fileSize || 0), 0);
}

export function buildDeleteConfirmCopy(photos: PhotoAsset[]) {
  const count = photos.length;
  const totalBytes = getDeleteTotalBytes(photos);

  return {
    title: '准备收工了吗？',
    subtitle: `删除你刚归档的 ${count} 张照片。`,
    primaryLabel: `Delete ${formatDeleteBytes(totalBytes)}`,
    helper: '删除的照片会被移到系统“最近删除”，你可以在限定时间内恢复。',
  };
}
