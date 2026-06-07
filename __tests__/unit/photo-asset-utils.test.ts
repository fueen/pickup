import { resolvePlayableLivePhotoUri, toPhotoAsset } from '../../src/utils/photo-asset-utils';

describe('photo-asset-utils', () => {
  it('maps iOS live photo metadata and paired video into PhotoAsset', () => {
    const result = toPhotoAsset({
      id: 'live-1',
      uri: 'ph://live-photo',
      width: 3024,
      height: 4032,
      mediaType: 'photo',
      mediaSubtypes: ['livePhoto'],
      creationTime: 1_800_000_000_000,
      albumId: 'camera',
      pairedVideoAsset: {
        id: 'paired-video-1',
        uri: 'ph://paired-video',
        width: 3024,
        height: 4032,
        mediaType: 'pairedVideo',
        creationTime: 1_800_000_000_000,
      },
    } as any);

    expect(result).toEqual({
      id: 'live-1',
      uri: 'ph://live-photo',
      width: 3024,
      height: 4032,
      mediaType: 'livePhoto',
      creationTime: 1_800_000_000_000,
      fileSize: 0,
      albumIds: ['camera'],
      pairedVideoUri: 'ph://paired-video',
    });
  });

  it('keeps regular photos as still photos without paired video uri', () => {
    const result = toPhotoAsset({
      id: 'still-1',
      uri: 'file://still.jpg',
      width: 1200,
      height: 900,
      mediaType: 'photo',
      creationTime: 1_800_000_000_000,
    } as any);

    expect(result.mediaType).toBe('photo');
    expect(result.pairedVideoUri).toBeNull();
  });

  it('maps live photo from separately loaded asset info when list asset lacks subtype', () => {
    const result = toPhotoAsset(
      {
        id: 'live-2',
        uri: 'ph://live-still',
        width: 3000,
        height: 4000,
        mediaType: 'photo',
        creationTime: 1_800_000_000_000,
      } as any,
      {
        mediaSubtypes: ['livePhoto'],
        pairedVideoAsset: { uri: 'ph://live-motion' },
      },
    );

    expect(result.mediaType).toBe('livePhoto');
    expect(result.pairedVideoUri).toBe('ph://live-motion');
  });

  it('uses an existing paired video uri for Live Photo playback', async () => {
    const getAssetInfo = jest.fn();

    await expect(resolvePlayableLivePhotoUri({
      id: 'live-3',
      uri: 'ph://live-still',
      width: 3000,
      height: 4000,
      mediaType: 'livePhoto',
      creationTime: 1_800_000_000_000,
      fileSize: 0,
      albumIds: [],
      pairedVideoUri: 'file:///tmp/live.mov',
    }, getAssetInfo)).resolves.toBe('file:///tmp/live.mov');

    expect(getAssetInfo).not.toHaveBeenCalled();
  });

  it('fetches paired video uri on demand when a Live Photo lacks playback uri', async () => {
    const getAssetInfo = jest.fn(() => Promise.resolve({
      pairedVideoAsset: { uri: 'file:///tmp/fetched-live.mov' },
    }));

    await expect(resolvePlayableLivePhotoUri({
      id: 'live-4',
      uri: 'ph://live-still',
      width: 3000,
      height: 4000,
      mediaType: 'livePhoto',
      creationTime: 1_800_000_000_000,
      fileSize: 0,
      albumIds: [],
      pairedVideoUri: null,
    }, getAssetInfo)).resolves.toBe('file:///tmp/fetched-live.mov');

    expect(getAssetInfo).toHaveBeenCalledWith('live-4', { shouldDownloadFromNetwork: true });
  });
});
