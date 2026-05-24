import AsyncStorage from '@react-native-async-storage/async-storage';

const SWIPE_EFFECT_KEY = 'swipeEffect';

export type SwipeEffect = 'default' | 'momentum' | 'pageFlip' | 'rubberBand' | 'smooth';

export async function getSwipeEffect(): Promise<SwipeEffect> {
  try {
    const val = await AsyncStorage.getItem(SWIPE_EFFECT_KEY);
    return (val as SwipeEffect) || 'default';
  } catch {
    return 'default';
  }
}

export async function setSwipeEffect(effect: SwipeEffect): Promise<void> {
  await AsyncStorage.setItem(SWIPE_EFFECT_KEY, effect);
}
