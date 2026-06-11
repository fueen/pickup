jest.mock('react-native');

jest.mock('expo-media-library', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'undetermined', canAskAgain: true })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getAssetsAsync: jest.fn(() => Promise.resolve({ assets: [] })),
  getAssetInfoAsync: jest.fn((asset) => Promise.resolve(asset)),
  deleteAssetsAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-video', () => ({
  VideoView: 'VideoView',
  useVideoPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    replay: jest.fn(),
    duration: 3,
    muted: false,
    loop: false,
  })),
}));

jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation((...parts) => {
    const uri = parts.map((part) => (typeof part === 'string' ? part : part?.uri ?? '')).join('');
    return {
      uri,
      exists: false,
      size: 0,
      bytes: jest.fn(() => Promise.resolve(new Uint8Array())),
      write: jest.fn(),
      delete: jest.fn(),
      copy: jest.fn(),
    };
  }),
  Directory: jest.fn().mockImplementation((base, name) => ({
    uri: `${base}${name}/`,
    exists: true,
    create: jest.fn(),
  })),
  Paths: { cache: 'file:///cache/' },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));
