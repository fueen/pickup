import React, { useState, useCallback } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { Tokens } from '../src/design-tokens';
import { SubscriptionProvider } from '../src/contexts/SubscriptionContext';
import { StatsProvider } from '../src/contexts/StatsContext';
import { PhotoProvider } from '../src/contexts/PhotoContext';
import { SessionProvider } from '../src/contexts/SessionContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { SplashScreen } from '../src/components/SplashScreen';

const TABS = [
  { name: 'index', icon: 'image-multiple-outline', size: 24 },
  { name: 'hub', icon: 'apps', size: 24 },
  { name: 'settings', icon: 'account-outline', size: 26 },
] as const;

function SimpleTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const currentRoute = pathname === '/' ? 'index' : pathname.replace(/^\//, '');
  const isRecentDeletes = currentRoute === 'recent-deletes';

  if (isRecentDeletes) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={[tabStyles.bar, { paddingBottom: insets.bottom + 8 }]}>
      <View style={tabStyles.capsule}>
        <View pointerEvents="none" style={tabStyles.materialLayer} />
        <View pointerEvents="none" style={tabStyles.innerStroke} />
        <View style={tabStyles.itemsLayer}>
          {TABS.map((tab) => {
            const isFocused = currentRoute === tab.name;

            return (
              <Pressable
                key={tab.name}
                onPress={() => {
                  router.navigate(`/${tab.name === 'index' ? '' : tab.name}`);
                }}
                style={tabStyles.item}
              >
                <View style={tabStyles.iconSlot}>
                  <MaterialCommunityIcons
                    name={tab.icon as any}
                    size={tab.size}
                    color="#FFFFFF"
                  />
                  {isFocused && (
                    <MaterialCommunityIcons
                      pointerEvents="none"
                      name={tab.icon as any}
                      size={tab.size}
                      color={Tokens.color.accent}
                      style={tabStyles.activeIcon}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  capsule: {
    minWidth: 196,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 28,
    backgroundColor: 'rgba(10,10,10,0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.34,
    shadowRadius: 18,
    elevation: 10,
    overflow: 'hidden',
  },
  materialLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    backgroundColor: 'rgba(10,10,10,0.78)',
  },
  innerStroke: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.25)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.55)',
  },
  itemsLayer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    elevation: 2,
  },
  item: {
    width: 58,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    elevation: 3,
  },
  iconSlot: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIcon: {
    position: 'absolute',
  },
});

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashFinish = useCallback(() => {
    setSplashDone(true);
  }, []);

  if (!splashDone) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        <SplashScreen onFinish={handleSplashFinish} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <ErrorBoundary>
        <SubscriptionProvider>
          <StatsProvider>
            <PhotoProvider>
              <SessionProvider>
                <StatusBar style="light" />
                <Tabs
                  screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarStyle: { display: 'none' },
                  }}
                >
                  <Tabs.Screen name="index" />
                  <Tabs.Screen name="hub" />
                  <Tabs.Screen name="settings" />
                  <Tabs.Screen name="review" options={{ href: null }} />
                  <Tabs.Screen name="paywall" options={{ href: null }} />
                  <Tabs.Screen name="albums" options={{ href: null }} />
                </Tabs>
                <SimpleTabBar />
              </SessionProvider>
            </PhotoProvider>
          </StatsProvider>
        </SubscriptionProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
