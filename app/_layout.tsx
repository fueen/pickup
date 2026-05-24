import React, { useState, useCallback } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigationState } from '@react-navigation/native';
import { useRouter } from 'expo-router';
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
  const currentRoute = useNavigationState((state: any) => {
    if (!state?.routes) return 'index';
    const tabState = state.routes.find((r: any) => r.name === '(tabs)')?.state ?? state;
    const idx = tabState.index ?? 0;
    return tabState.routes?.[idx]?.name ?? 'index';
  });

  return (
    <View style={[tabStyles.bar, { paddingBottom: insets.bottom + 6 }]}>
      {TABS.map((tab) => {
        const isFocused = currentRoute === tab.name;

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => {
              router.navigate(`/${tab.name === 'index' ? '' : tab.name}`);
            }}
            style={tabStyles.item}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={tab.icon as any}
              size={tab.size}
              color={isFocused ? Tokens.color.accent : Tokens.color.textMuted}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingTop: 8,
    gap: 4,
  },
  item: {
    width: 52,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
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
