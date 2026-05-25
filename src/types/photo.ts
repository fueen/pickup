export interface PhotoAsset {
  id: string;
  uri: string;
  width: number;
  height: number;
  mediaType: 'photo' | 'video' | 'livePhoto';
  creationTime: number;
  fileSize: number;
  albumIds: string[];
}

export type PermissionStatus =
  | 'undetermined'
  | 'granted'
  | 'denied'
  | 'limited';

export type GestureState = 'idle' | 'dragging' | 'animating' | 'confirmed';

export interface InteractionLogEntry {
  photoId: string;
  action: 'delete' | 'keep' | 'skip';
  timestamp: number;
}

export interface DeletedPhotoRecord {
  id: string;
  uri: string;
  width: number;
  height: number;
  creationTime: number;
  fileSize: number;
  deletedAt: number;
  mediaType: 'photo' | 'video' | 'livePhoto';
}

export type SortMode = 'random' | 'sizeDesc' | 'timeNewest' | 'timeOldest';
