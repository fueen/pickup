import { toVisibleAlbumItems } from '../../src/utils/album-utils';

describe('album-utils', () => {
  it('keeps all-photos entry and valid albums with cover photos', () => {
    const items = toVisibleAlbumItems({
      allPhotos: {
        totalCount: 12,
        coverUri: 'file://all.jpg',
      },
      albums: [
        {
          id: 'album-1',
          title: 'Camera',
          assetCount: 6,
          coverUri: 'file://camera.jpg',
        },
      ],
    });

    expect(items).toEqual([
      {
        id: '__all__',
        title: '所有照片',
        assetCount: 12,
        coverUri: 'file://all.jpg',
      },
      {
        id: 'album-1',
        title: 'Camera',
        assetCount: 6,
        coverUri: 'file://camera.jpg',
      },
    ]);
  });

  it('filters empty albums and albums without readable cover photos', () => {
    const items = toVisibleAlbumItems({
      allPhotos: {
        totalCount: 5,
        coverUri: 'file://all.jpg',
      },
      albums: [
        {
          id: 'empty',
          title: 'Empty',
          assetCount: 0,
          coverUri: 'file://empty.jpg',
        },
        {
          id: 'coverless',
          title: 'Coverless',
          assetCount: 3,
          coverUri: null,
        },
        {
          id: 'valid',
          title: 'Valid',
          assetCount: 2,
          coverUri: 'file://valid.jpg',
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
      },
      albums: [],
    });

    expect(items).toEqual([
      {
        id: '__all__',
        title: '所有照片',
        assetCount: 5,
        coverUri: null,
      },
    ]);
  });

  it('sorts valid albums by asset count after all-photos entry', () => {
    const items = toVisibleAlbumItems({
      allPhotos: {
        totalCount: 20,
        coverUri: 'file://all.jpg',
      },
      albums: [
        {
          id: 'small',
          title: 'Small',
          assetCount: 2,
          coverUri: 'file://small.jpg',
        },
        {
          id: 'large',
          title: 'Large',
          assetCount: 9,
          coverUri: 'file://large.jpg',
        },
      ],
    });

    expect(items.map((item) => item.id)).toEqual(['__all__', 'large', 'small']);
  });
});
