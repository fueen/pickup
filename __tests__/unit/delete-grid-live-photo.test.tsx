import React from 'react';
import { render } from '@testing-library/react-native';
import { DeleteGrid } from '../../src/components/delete-review/DeleteGrid';
import { PhotoAsset } from '../../src/types/photo';

function makePhoto(overrides: Partial<PhotoAsset> = {}): PhotoAsset {
  return {
    id: 'photo-1',
    uri: 'file://photo.jpg',
    width: 1000,
    height: 1000,
    mediaType: 'photo',
    creationTime: 1_800_000_000_000,
    fileSize: 0,
    albumIds: [],
    pairedVideoUri: null,
    ...overrides,
  };
}

describe('DeleteGrid live photo badge', () => {
  it('shows a live badge on live photo thumbnails', () => {
    const screen = render(
      <DeleteGrid
        photos={[makePhoto({ mediaType: 'livePhoto', pairedVideoUri: 'ph://motion' })]}
        selectedIds={new Set()}
        onTap={jest.fn()}
      />,
    );

    expect(screen.getByText('LIVE')).toBeTruthy();
  });
});
