export interface AlbumListInput {
  allPhotos: {
    totalCount: number;
    coverUri: string | null;
    coverUris?: string[];
  };
  albums: Array<{
    id: string;
    title: string;
    assetCount: number;
    coverUri: string | null;
    coverUris?: string[];
  }>;
}

export interface VisibleAlbumItem {
  id: string;
  title: string;
  assetCount: number;
  coverUri: string | null;
  coverUris: string[];
}

function normalizeCoverUris(coverUri: string | null, coverUris?: string[]): string[] {
  if (coverUris) {
    return [...new Set(coverUris.filter(Boolean))];
  }

  const unique = new Set<string>();
  if (coverUri) unique.add(coverUri);
  return [...unique];
}

export function toVisibleAlbumItems(input: AlbumListInput): VisibleAlbumItem[] {
  const items: VisibleAlbumItem[] = [];

  if (input.allPhotos.totalCount > 0) {
    items.push({
      id: '__all__',
      title: '所有照片',
      assetCount: input.allPhotos.totalCount,
      coverUri: input.allPhotos.coverUri,
      coverUris: normalizeCoverUris(input.allPhotos.coverUri, input.allPhotos.coverUris),
    });
  }

  const validAlbums = input.albums
    .filter((album) => album.id && album.title && album.assetCount > 0 && album.coverUri)
    .sort((a, b) => b.assetCount - a.assetCount);

  items.push(...validAlbums.map((album) => ({
    id: album.id,
    title: album.title,
    assetCount: album.assetCount,
    coverUri: album.coverUri,
    coverUris: normalizeCoverUris(album.coverUri, album.coverUris),
  })));

  return items;
}
