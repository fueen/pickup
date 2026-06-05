import React, { useState, useCallback, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { SubscriptionProvider } from '../src/contexts/SubscriptionContext';
import { StatsProvider } from '../src/contexts/StatsContext';
import { PhotoProvider } from '../src/contexts/PhotoContext';
import { SessionProvider } from '../src/contexts/SessionContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { SplashScreen } from '../src/components/SplashScreen';
import { ChangelogModal } from '../src/components/ui/ChangelogModal';
import { PickupTabGlyph } from '../src/components/ui/PickupGlyphs';
import { CURRENT_CHANGELOG } from '../src/constants/changelog';
import { acknowledgeChangelog, shouldShowChangelog } from '../src/services/changelog-service';
import { Tokens } from '../src/design-tokens';

const TABS = [
  { name: 'index', size: 28 },
  { name: 'hub', size: 27 },
  { name: 'settings', size: 30 },
] as const;

function SimpleTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const currentRoute = pathname === '/' ? 'index' : pathname.replace(/^\//, '');
  const isImmersiveRoute = currentRoute === 'recent-deletes'
    || currentRoute === 'review'
    || currentRoute === 'about'
    || currentRoute === 'albums';

  if (isImmersiveRoute) {
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
                  <PickupTabGlyph name={tab.name} active={isFocused} size={tab.size} />
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
    minWidth: 208,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 34,
    backgroundColor: 'rgba(18,18,19,0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.42,
    shadowRadius: 22,
    elevation: 10,
    overflow: 'hidden',
  },
  materialLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 34,
    backgroundColor: Tokens.color.surface,
  },
  innerStroke: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 34,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.13)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.7)',
  },
  itemsLayer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    elevation: 2,
  },
  item: {
    width: 62,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    elevation: 3,
  },
  iconSlot: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);
  const [changelogVisible, setChangelogVisible] = useState(false);

  const handleSplashFinish = useCallback(() => {
    setSplashDone(true);
  }, []);

  useEffect(() => {
    if (!splashDone) return;

    let isActive = true;
    shouldShowChangelog()
      .then((shouldShow) => {
        if (isActive) setChangelogVisible(shouldShow);
      })
      .catch(() => {
        if (isActive) setChangelogVisible(false);
      });

    return () => {
      isActive = false;
    };
  }, [splashDone]);

  const handleChangelogAcknowledge = useCallback(() => {
    setChangelogVisible(false);
    acknowledgeChangelog().catch(() => {
      // The modal is intentionally closed even if persistence fails.
    });
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
                  <Tabs.Screen name="about" options={{ href: null }} />
                </Tabs>
                <SimpleTabBar />
                <ChangelogModal
                  visible={changelogVisible}
                  entry={CURRENT_CHANGELOG}
                  onAcknowledge={handleChangelogAcknowledge}
                />
              </SessionProvider>
            </PhotoProvider>
          </StatsProvider>
        </SubscriptionProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
