import React, { createContext, useContext, useState } from 'react';
import { usePhotoEngine } from '../hooks/usePhotoEngine';

type PhotoContextValue = ReturnType<typeof usePhotoEngine> & {
  selectedAlbum: { id: string; title: string } | null;
  setSelectedAlbum: (album: { id: string; title: string } | null) => void;
};

const PhotoCtx = createContext<PhotoContextValue | null>(null);

export function PhotoProvider({ children }: { children: React.ReactNode }) {
  const engine = usePhotoEngine();
  const [selectedAlbum, setSelectedAlbum] = useState<{ id: string; title: string } | null>(null);
  return (
    <PhotoCtx.Provider value={{ ...engine, selectedAlbum, setSelectedAlbum }}>
      {children}
    </PhotoCtx.Provider>
  );
}

export function usePhotoContext(): PhotoContextValue {
  const ctx = useContext(PhotoCtx);
  if (!ctx) throw new Error('usePhotoContext must be used inside PhotoProvider');
  return ctx;
}
