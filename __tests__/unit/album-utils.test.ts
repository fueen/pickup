import { toVisibleAlbumItems } from '../../src/utils/album-utils';

describe('album-utils', () => {
  it('keeps all-photos entry and valid albums with cover photos', () => {
    const items = toVisibleAlbumItems({
      allPhotos: {
        totalCount: 12,
        coverUri: 'file://all.jpg',
        coverUris: ['file://all-1.jpg', 'file://all-2.jpg'],
      },
      albums: [
        {
          id: 'album-1',
          title: 'Camera',
          assetCount: 6,
          coverUri: 'file://camera.jpg',
          coverUris: ['file://camera-1.jpg', 'file://camera-2.jpg'],
        },
      ],
    });

    expect(items).toEqual([
      {
        id: '__all__',
        title: '所有照片',
        assetCount: 12,
        coverUri: 'file://all.jpg',
        coverUris: ['file://all-1.jpg', 'file://all-2.jpg'],
      },
      {
        id: 'album-1',
        title: 'Camera',
        assetCount: 6,
        coverUri: 'file://camera.jpg',
        coverUris: ['file://camera-1.jpg', 'file://camera-2.jpg'],
      },
    ]);
  });

  it('filters empty albums and albums without readable cover photos', () => {
    const items = toVisibleAlbumItems({
      allPhotos: {
        totalCount: 5,
        coverUri: 'file://all.jpg',
        coverUris: ['file://all.jpg'],
      },
      albums: [
        {
          id: 'empty',
          title: 'Empty',
          assetCount: 0,
          coverUri: 'file://empty.jpg',
          coverUris: ['file://empty.jpg'],
        },
        {
          id: 'coverless',
          title: 'Coverless',
          assetCount: 3,
          coverUri: null,
          coverUris: [],
        },
        {
          id: 'valid',
          title: 'Valid',
          assetCount: 2,
          coverUri: 'file://valid.jpg',
          coverUris: ['file://valid.jpg'],
        },
      ],
    });

    expect(items.map((item) => item.id)).toEqual(['__all__', 'valid']);
  });

  it('keeps all-photos entry when it has photos even if the cover is unavailable', () => {
    const items = toVisibleAlbumItems({
      allPhotos: {
        totalCount: 5,
        coverUri: null,
        coverUris: [],
      },
      albums: [],
    });

    expect(items).toEqual([
      {
        id: '__all__',
        title: '所有照片',
        assetCount: 5,
        coverUri: null,
        coverUris: [],
      },
    ]);
  });

  it('sorts valid albums by asset count after all-photos entry', () => {
    const items = toVisibleAlbumItems({
      allPhotos: {
        totalCount: 20,
        coverUri: 'file://all.jpg',
        coverUris: ['file://all.jpg'],
      },
      albums: [
        {
          id: 'small',
          title: 'Small',
          assetCount: 2,
          coverUri: 'file://small.jpg',
          coverUris: ['file://small.jpg'],
        },
        {
          id: 'large',
          title: 'Large',
          assetCount: 9,
          coverUri: 'file://large.jpg',
          coverUris: ['file://large.jpg'],
        },
      ],
    });

    expect(items.map((item) => item.id)).toEqual(['__all__', 'large', 'small']);
  });

  it('preserves multiple cover uris for mosaic cards without introducing month grouping', () => {
    const items = toVisibleAlbumItems({
      allPhotos: {
        totalCount: 40,
        coverUri: 'file://all.jpg',
        coverUris: ['file://all-a.jpg', 'file://all-b.jpg', 'file://all-c.jpg'],
      },
      albums: [
        {
          id: 'screenshots',
          title: 'Screenshots',
          assetCount: 10,
          coverUri: 'file://screenshots.jpg',
          coverUris: ['file://screen-a.jpg', 'file://screen-b.jpg'],
        },
        {
          id: 'camera',
          title: 'Camera',
          assetCount: 30,
          coverUri: 'file://camera.jpg',
          coverUris: ['file://camera-a.jpg', 'file://camera-b.jpg', 'file://camera-c.jpg'],
        },
      ],
    });

    expect(items.map((item) => item.id)).toEqual(['__all__', 'camera', 'screenshots']);
    expect(items[0].coverUris).toEqual(['file://all-a.jpg', 'file://all-b.jpg', 'file://all-c.jpg']);
    expect(items[1].coverUris).toEqual(['file://camera-a.jpg', 'file://camera-b.jpg', 'file://camera-c.jpg']);
  });
});
