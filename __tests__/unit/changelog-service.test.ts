import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  acknowledgeChangelog,
  shouldShowChangelog,
} from '../../src/services/changelog-service';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetItem.mockResolvedValue(null);
  mockSetItem.mockResolvedValue(undefined);
});

describe('changelog-service', () => {
  it('shows changelog when no version has been acknowledged', async () => {
    mockGetItem.mockResolvedValue(null);

    await expect(shouldShowChangelog('1.3.4')).resolves.toBe(true);

    expect(mockGetItem).toHaveBeenCalledWith('acknowledgedChangelogVersion');
  });

  it('does not show changelog when current version was acknowledged', async () => {
    mockGetItem.mockResolvedValue('1.3.4');

    await expect(shouldShowChangelog('1.3.4')).resolves.toBe(false);
  });

  it('shows changelog again when acknowledged version is older', async () => {
    mockGetItem.mockResolvedValue('1.3.0');

    await expect(shouldShowChangelog('1.3.4')).resolves.toBe(true);
  });

  it('persists the acknowledged version', async () => {
    await acknowledgeChangelog('1.3.4');

    expect(mockSetItem).toHaveBeenCalledWith('acknowledgedChangelogVersion', '1.3.4');
  });
});
