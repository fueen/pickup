export interface AlbumListInput {
  allPhotos: {
    totalCount: number;
    coverUri: string | null;
  };
  albums: Array<{
    id: string;
    title: string;
    assetCount: number;
    coverUri: string | null;
  }>;
}

export interface VisibleAlbumItem {
  id: string;
  title: string;
  assetCount: number;
  coverUri: string | null;
}

export function toVisibleAlbumItems(input: AlbumListInput): VisibleAlbumItem[] {
  const items: VisibleAlbumItem[] = [];

  if (input.allPhotos.totalCount > 0) {
    items.push({
      id: '__all__',
      title: '所有照片',
      assetCount: input.allPhotos.totalCount,
      coverUri: input.allPhotos.coverUri,
    });
  }

  const validAlbums = input.albums
    .filter((album) => album.id && album.title && album.assetCount > 0 && album.coverUri)
    .sort((a, b) => b.assetCount - a.assetCount);

  items.push(...validAlbums);
  return items;
}
