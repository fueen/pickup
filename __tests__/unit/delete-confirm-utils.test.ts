import {
  buildDeleteConfirmCopy,
  formatDeleteBytes,
  getDeletePreviewPhotos,
} from '../../src/utils/delete-confirm-utils';
import { PhotoAsset } from '../../src/types/photo';

function makePhoto(id: string, fileSize: number): PhotoAsset {
  return {
    id,
    uri: `file://${id}.jpg`,
    width: 1000,
    height: 800,
    mediaType: 'photo',
    creationTime: 0,
    fileSize,
    albumIds: [],
  };
}

describe('delete confirm utils', () => {
  it('formats total delete size for the primary button', () => {
    expect(formatDeleteBytes(21 * 1024 * 1024)).toBe('21 MB');
    expect(formatDeleteBytes(512 * 1024)).toBe('512 KB');
  });

  it('uses selected photos to build count and delete button copy', () => {
    const copy = buildDeleteConfirmCopy([makePhoto('a', 10), makePhoto('b', 20)]);

    expect(copy.title).toBe('准备收工了吗？');
    expect(copy.subtitle).toBe('删除你刚归档的 2 张照片。');
    expect(copy.primaryLabel).toBe('Delete 30 B');
  });

  it('keeps only the first three preview photos for the stack', () => {
    const photos = ['a', 'b', 'c', 'd'].map((id) => makePhoto(id, 1));

    expect(getDeletePreviewPhotos(photos).map((photo) => photo.id)).toEqual(['a', 'b', 'c']);
  });
});
