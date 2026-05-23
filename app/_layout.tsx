import React, { useState, useCallback } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SubscriptionProvider } from '../src/contexts/SubscriptionContext';
import { StatsProvider } from '../src/contexts/StatsContext';
import { PhotoProvider } from '../src/contexts/PhotoContext';
import { SessionProvider } from '../src/contexts/SessionContext';
import { Tokens } from '../src/design-tokens';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { SplashScreen } from '../src/components/SplashScreen';

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
                  tabBarStyle: {
                    backgroundColor: '#0D0D0D',
                    borderTopColor: '#1C1C1E',
                  },
                  tabBarActiveTintColor: '#FFCC00',
                  tabBarInactiveTintColor: Tokens.color.textMuted,
                  tabBarShowLabel: false,
                }}
              >
                <Tabs.Screen
                  name="index"
                  options={{
                    tabBarLabel: '浏览',
                    tabBarIcon: ({ color }) => (
                      <MaterialCommunityIcons name="image-multiple-outline" size={24} color={color} />
                    ),
                  }}
                />
                <Tabs.Screen
                  name="settings"
                  options={{
                    tabBarLabel: '设置',
                    tabBarIcon: ({ color }) => (
                      <MaterialCommunityIcons name="account-outline" size={26} color={color} />
                    ),
                  }}
                />
                <Tabs.Screen
                  name="review"
                  options={{ href: null }}
                />
                <Tabs.Screen
                  name="paywall"
                  options={{
                    href: null,
                    tabBarStyle: { display: 'none' },
                  }}
                />
              </Tabs>
            </SessionProvider>
          </PhotoProvider>
        </StatsProvider>
      </SubscriptionProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
