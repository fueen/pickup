import { PhotoAsset } from '../types/photo';

interface MediaLibraryLikeAsset {
  id: string;
  uri: string;
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
) => Promise<{ pairedVideoAsset?: { uri?: string | null } | null } | null | undefined>;

export function toPhotoAsset(asset: MediaLibraryLikeAsset, livePhotoInfo?: LivePhotoInfo | null): PhotoAsset {
  const mediaSubtypes = livePhotoInfo?.mediaSubtypes ?? asset.mediaSubtypes;
  const pairedVideoAsset = livePhotoInfo?.pairedVideoAsset ?? asset.pairedVideoAsset;
  const isLivePhoto =
    asset.mediaType === 'livePhoto'
    || mediaSubtypes?.includes('livePhoto')
    || Boolean(pairedVideoAsset?.uri);

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

  try {
    const info = await getAssetInfo(photo.id, { shouldDownloadFromNetwork: true });
    return info?.pairedVideoAsset?.uri ?? null;
  } catch {
    return null;
  }
}
