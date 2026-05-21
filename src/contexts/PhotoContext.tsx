import React, { createContext, useContext } from 'react';
import { usePhotoEngine } from '../hooks/usePhotoEngine';

type PhotoContextValue = ReturnType<typeof usePhotoEngine>;

const PhotoCtx = createContext<PhotoContextValue | null>(null);

export function PhotoProvider({ children }: { children: React.ReactNode }) {
  const engine = usePhotoEngine();
  return <PhotoCtx.Provider value={engine}>{children}</PhotoCtx.Provider>;
}

export function usePhotoContext(): PhotoContextValue {
  const ctx = useContext(PhotoCtx);
  if (!ctx) throw new Error('usePhotoContext must be used inside PhotoProvider');
  return ctx;
}
