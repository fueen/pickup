import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { PhotoProvider, usePhotoContext } from '../../src/contexts/PhotoContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PhotoProvider>{children}</PhotoProvider>
);

describe('PhotoContext', () => {
  it('initializes with loading state', () => {
    const { result } = renderHook(() => usePhotoContext(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.currentGroup).toEqual([]);
    expect(result.current.groupIndex).toBe(0);
  });

  it('initializes with undetermined permission status', () => {
    const { result } = renderHook(() => usePhotoContext(), { wrapper });
    expect(result.current.permissionStatus).toBe('undetermined');
  });

  it('has empty marked sets initially', () => {
    const { result } = renderHook(() => usePhotoContext(), { wrapper });
    expect(result.current.markedForDelete.size).toBe(0);
    expect(result.current.markedForKeep.size).toBe(0);
  });

  it('has requestPermissions and loadPhotos functions', () => {
    const { result } = renderHook(() => usePhotoContext(), { wrapper });
    expect(typeof result.current.requestPermissions).toBe('function');
    expect(typeof result.current.loadPhotos).toBe('function');
  });
});
