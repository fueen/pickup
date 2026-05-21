import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

export function useHaptics() {
  const impactMedium = useCallback(() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }, []);
  const notifySuccess = useCallback(() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }, []);
  const notifyWarning = useCallback(() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); }, []);
  const impactLight = useCallback(() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }, []);
  return { impactMedium, notifySuccess, notifyWarning, impactLight };
}
