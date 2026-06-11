const mockFileBytes = new Map<string, Uint8Array>();
const mockWrittenFiles = new Map<string, Uint8Array>();

jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation((...parts: any[]) => {
    const uri = parts.map((part) => (typeof part === 'string' ? part : part.uri)).join('');
    return {
      uri,
      get exists() {
        return mockFileBytes.has(uri) || mockWrittenFiles.has(uri);
      },
      get size() {
        return mockFileBytes.get(uri)?.length ?? mockWrittenFiles.get(uri)?.length ?? 0;
      },
      bytes: jest.fn(() => Promise.resolve(mockFileBytes.get(uri) ?? new Uint8Array())),
      write: jest.fn((content: Uint8Array) => {
        mockWrittenFiles.set(uri, content);
      }),
      delete: jest.fn(() => {
        mockWrittenFiles.delete(uri);
      }),
    };
  }),
  Directory: jest.fn().mockImplementation((base: string, name: string) => ({
    uri: `${base}${name}/`,
    exists: true,
    create: jest.fn(),
  })),
  Paths: { cache: 'file:///cache/' },
}));

import {
  getEmbeddedMotionPhotoVideoRange,
  resolvePlayableLivePhotoUri,
  toPhotoAsset,
} from '../../src/utils/photo-asset-utils';

describe('photo-asset-utils', () => {
  beforeEach(() => {
    mockFileBytes.clear();
    mockWrittenFiles.clear();
    jest.clearAllMocks();
  });

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

  it('marks Xiaomi MVIMG files as Live Photo playback candidates', () => {
    const result = toPhotoAsset({
      id: 'motion-1',
      uri: 'file:///photos/MVIMG_20260607_143936.jpg',
      filename: 'MVIMG_20260607_143936.jpg',
      width: 1296,
      height: 1728,
      mediaType: 'photo',
      creationTime: 1_800_000_000_000,
    } as any);

    expect(result.mediaType).toBe('livePhoto');
    expect(result.pairedVideoUri).toBeNull();
  });

  it('reads the embedded MP4 range from Google Motion Photo XMP metadata', () => {
    const mp4 = new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112, 109, 112, 52, 50]);
    const jpegPrefix = new TextEncoder().encode(`
      <x:xmpmeta>
        <rdf:Description
          GCamera:MotionPhoto="1"
          GCamera:MotionPhotoVersion="1">
          <Container:Directory>
            <rdf:Seq>
              <rdf:li rdf:parseType="Resource">
                <Container:Item Item:Mime="image/jpeg" Item:Semantic="Primary"/>
              </rdf:li>
              <rdf:li rdf:parseType="Resource">
                <Container:Item Item:Mime="video/mp4" Item:Semantic="MotionPhoto" Item:Length="${mp4.length}" Item:Padding="0"/>
              </rdf:li>
            </rdf:Seq>
          </Container:Directory>
        </rdf:Description>
      </x:xmpmeta>
    `);
    const bytes = new Uint8Array(jpegPrefix.length + mp4.length);
    bytes.set(jpegPrefix, 0);
    bytes.set(mp4, jpegPrefix.length);

    expect(getEmbeddedMotionPhotoVideoRange(bytes)).toEqual({
      offset: jpegPrefix.length,
      length: mp4.length,
    });
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

  it('extracts an embedded Xiaomi Motion Photo video to cache for playback', async () => {
    const getAssetInfo = jest.fn();
    const mp4 = new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112, 109, 112, 52, 50]);
    const jpegPrefix = new TextEncoder().encode(`
      <x:xmpmeta>
        <rdf:Description GCamera:MotionPhoto="1">
          <Container:Item Item:Mime="video/mp4" Item:Semantic="MotionPhoto" Item:Length="${mp4.length}" Item:Padding="0"/>
        </rdf:Description>
      </x:xmpmeta>
    `);
    const bytes = new Uint8Array(jpegPrefix.length + mp4.length);
    bytes.set(jpegPrefix, 0);
    bytes.set(mp4, jpegPrefix.length);
    mockFileBytes.set('file:///photos/MVIMG_20260607_143936.jpg', bytes);

    await expect(resolvePlayableLivePhotoUri({
      id: 'motion-asset',
      uri: 'file:///photos/MVIMG_20260607_143936.jpg',
      width: 1296,
      height: 1728,
      mediaType: 'livePhoto',
      creationTime: 1_800_000_000_000,
      fileSize: 0,
      albumIds: [],
      pairedVideoUri: null,
    }, getAssetInfo)).resolves.toBe('file:///cache/motion-photos/motion-asset.mp4');

    expect(getAssetInfo).not.toHaveBeenCalled();
    expect(mockWrittenFiles.get('file:///cache/motion-photos/motion-asset.mp4')).toEqual(mp4);
  });

  it('uses asset info localUri when the listed Android asset URI is not directly readable', async () => {
    const mp4 = new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112, 109, 112, 52, 50]);
    const jpegPrefix = new TextEncoder().encode(`
      <x:xmpmeta>
        <rdf:Description GCamera:MotionPhoto="1">
          <Container:Item Item:Mime="video/mp4" Item:Length="${mp4.length}"/>
        </rdf:Description>
      </x:xmpmeta>
    `);
    const bytes = new Uint8Array(jpegPrefix.length + mp4.length);
    bytes.set(jpegPrefix, 0);
    bytes.set(mp4, jpegPrefix.length);
    mockFileBytes.set('file:///storage/DCIM/Camera/MVIMG_20260607_143936.jpg', bytes);

    const getAssetInfo = jest.fn(() => Promise.resolve({
      localUri: 'file:///storage/DCIM/Camera/MVIMG_20260607_143936.jpg',
    }));

    await expect(resolvePlayableLivePhotoUri({
      id: 'motion-content-uri',
      uri: 'content://media/external/images/media/12345',
      width: 1296,
      height: 1728,
      mediaType: 'livePhoto',
      creationTime: 1_800_000_000_000,
      fileSize: 0,
      albumIds: [],
      pairedVideoUri: null,
    }, getAssetInfo)).resolves.toBe('file:///cache/motion-photos/motion-content-uri.mp4');

    expect(getAssetInfo).toHaveBeenCalledWith('motion-content-uri', { shouldDownloadFromNetwork: true });
    expect(mockWrittenFiles.get('file:///cache/motion-photos/motion-content-uri.mp4')).toEqual(mp4);
  });
});
