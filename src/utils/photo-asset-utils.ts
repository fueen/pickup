import { Directory, File, Paths } from 'expo-file-system';
import { PhotoAsset } from '../types/photo';

interface MediaLibraryLikeAsset {
  id: string;
  uri: string;
  filename?: string;
  width: number;
  height: number;
  mediaType?: string;
  mediaSubtypes?: string[];
  creationTime: number;
  albumId?: string;
  pairedVideoAsset?: { uri?: string | null } | null;
}

type LivePhotoInfo = Pick<MediaLibraryLikeAsset, 'mediaSubtypes' | 'pairedVideoAsset'>;
type GetAssetInfo = (
  asset: string,
  options?: { shouldDownloadFromNetwork?: boolean },
) => Promise<{
  pairedVideoAsset?: { uri?: string | null } | null;
  localUri?: string | null;
  uri?: string | null;
} | null | undefined>;

interface MotionPhotoVideoRange {
  offset: number;
  length: number;
}

const MOTION_PHOTO_CACHE_DIR = 'motion-photos';
const XMP_SCAN_LIMIT = 256 * 1024;

function asciiDecode(bytes: Uint8Array): string {
  const chunkSize = 8192;
  let result = '';
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    result += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return result;
}

function getAttribute(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`${name}="([^"]+)"`));
  return match?.[1] ?? null;
}

function isMotionPhotoName(value?: string | null): boolean {
  if (!value) return false;
  const name = value.split(/[\\/]/).pop() ?? value;
  return /^MVIMG_.+\.jpe?g$/i.test(name);
}

function sanitizeCacheName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function getEmbeddedMotionPhotoVideoRange(bytes: Uint8Array): MotionPhotoVideoRange | null {
  const header = asciiDecode(bytes.subarray(0, Math.min(bytes.length, XMP_SCAN_LIMIT)));
  if (!/GCamera:MotionPhoto="1"/.test(header)) return null;

  const itemTags = header.match(/<Container:Item\b[^>]*>/g) ?? [];
  for (const tag of itemTags) {
    if (getAttribute(tag, 'Item:Mime') !== 'video/mp4') continue;

    const rawLength = getAttribute(tag, 'Item:Length');
    const rawPadding = getAttribute(tag, 'Item:Padding');
    const length = rawLength ? Number(rawLength) : NaN;
    const padding = rawPadding ? Number(rawPadding) : 0;
    if (!Number.isFinite(length) || length <= 0 || !Number.isFinite(padding) || padding < 0) {
      continue;
    }

    const offset = bytes.length - padding - length;
    if (offset < 0 || offset + length > bytes.length) continue;
    if (bytes[offset + 4] !== 0x66 || bytes[offset + 5] !== 0x74 || bytes[offset + 6] !== 0x79 || bytes[offset + 7] !== 0x70) {
      continue;
    }

    return { offset, length };
  }

  return null;
}

async function resolveEmbeddedMotionPhotoVideoUri(photo: PhotoAsset, sourceUri = photo.uri): Promise<string | null> {
  try {
    const source = new File(sourceUri);
    const bytes = await source.bytes();
    const range = getEmbeddedMotionPhotoVideoRange(bytes);
    if (!range) return null;

    const cacheDir = new Directory(Paths.cache, MOTION_PHOTO_CACHE_DIR);
    if (!cacheDir.exists) {
      cacheDir.create({ idempotent: true });
    }

    const output = new File(cacheDir, `${sanitizeCacheName(photo.id)}.mp4`);
    if (output.exists && output.size === range.length) {
      return output.uri;
    }
    if (output.exists) {
      output.delete();
    }

    output.write(bytes.subarray(range.offset, range.offset + range.length));
    return output.uri;
  } catch {
    return null;
  }
}

export function toPhotoAsset(asset: MediaLibraryLikeAsset, livePhotoInfo?: LivePhotoInfo | null): PhotoAsset {
  const mediaSubtypes = livePhotoInfo?.mediaSubtypes ?? asset.mediaSubtypes;
  const pairedVideoAsset = livePhotoInfo?.pairedVideoAsset ?? asset.pairedVideoAsset;
  const isLivePhoto =
    asset.mediaType === 'livePhoto'
    || mediaSubtypes?.includes('livePhoto')
    || Boolean(pairedVideoAsset?.uri)
    || isMotionPhotoName(asset.filename)
    || isMotionPhotoName(asset.uri);

  return {
    id: asset.id,
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    mediaType: isLivePhoto ? 'livePhoto' : ((asset.mediaType as PhotoAsset['mediaType']) || 'photo'),
    creationTime: asset.creationTime,
    fileSize: 0,
    albumIds: asset.albumId ? [asset.albumId] : [],
    pairedVideoUri: pairedVideoAsset?.uri ?? null,
  };
}

export async function resolvePlayableLivePhotoUri(
  photo: PhotoAsset,
  getAssetInfo: GetAssetInfo,
): Promise<string | null> {
  if (photo.mediaType !== 'livePhoto') return null;
  if (photo.pairedVideoUri) return photo.pairedVideoUri;

  if (isMotionPhotoName(photo.uri)) {
    const embeddedUri = await resolveEmbeddedMotionPhotoVideoUri(photo);
    if (embeddedUri) return embeddedUri;
  }

  let info: Awaited<ReturnType<GetAssetInfo>> = null;
  try {
    info = await getAssetInfo(photo.id, { shouldDownloadFromNetwork: true });
    const pairedUri = info?.pairedVideoAsset?.uri ?? null;
    if (pairedUri) return pairedUri;
  } catch {
    // Fall back to embedded Android Motion Photo extraction below.
  }

  const sourceUris = [info?.localUri, info?.uri].filter(
    (uri): uri is string => Boolean(uri) && uri !== photo.uri,
  );
  for (const sourceUri of sourceUris) {
    const embeddedUri = await resolveEmbeddedMotionPhotoVideoUri(photo, sourceUri);
    if (embeddedUri) return embeddedUri;
  }

  return resolveEmbeddedMotionPhotoVideoUri(photo);
}
