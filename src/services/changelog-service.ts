import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_VERSION } from '../constants/app-info';

export const ACKNOWLEDGED_CHANGELOG_VERSION_KEY = 'acknowledgedChangelogVersion';

export async function shouldShowChangelog(version = APP_VERSION): Promise<boolean> {
  const acknowledgedVersion = await AsyncStorage.getItem(ACKNOWLEDGED_CHANGELOG_VERSION_KEY);
  return acknowledgedVersion !== version;
}

export async function acknowledgeChangelog(version = APP_VERSION): Promise<void> {
  await AsyncStorage.setItem(ACKNOWLEDGED_CHANGELOG_VERSION_KEY, version);
}
