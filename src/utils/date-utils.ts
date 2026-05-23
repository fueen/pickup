export function getTodayKey(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function isNewDay(storedDate: string): boolean {
  return storedDate !== getTodayKey();
}

export function formatPhotoDate(timestampMs: number): string {
  if (isNaN(timestampMs) || timestampMs <= 0) return '';
  const now = new Date();
  const photoDate = new Date(timestampMs);
  const year = photoDate.getFullYear();
  const month = photoDate.getMonth() + 1;
  const day = photoDate.getDate();
  const datePart = `${year}年${month}月${day}日`;

  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const photoStart = new Date(photoDate.getFullYear(), photoDate.getMonth(), photoDate.getDate());
  const diffDays = Math.floor((nowStart.getTime() - photoStart.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return `${datePart} · 今天`;
  if (diffDays === 1) return `${datePart} · 昨天`;
  return `${datePart} · ${diffDays}天前`;
}
