import React from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Text } from 'react-native';
import { SubscriptionProvider } from '../src/contexts/SubscriptionContext';
import { StatsProvider } from '../src/contexts/StatsContext';
import { PhotoProvider } from '../src/contexts/PhotoContext';
import { SessionProvider } from '../src/contexts/SessionContext';
import { Tokens } from '../src/design-tokens';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SubscriptionProvider>
        <StatsProvider>
          <PhotoProvider>
            <SessionProvider>
              <StatusBar style="light" />
              <Tabs
                screenOptions={{
                  headerShown: false,
                  tabBarStyle: {
                    backgroundColor: Tokens.color.surface,
                    borderTopColor: Tokens.color.textMuted,
                  },
                  tabBarActiveTintColor: Tokens.color.textPrimary,
                  tabBarInactiveTintColor: Tokens.color.textMuted,
                  tabBarLabelStyle: { fontSize: 12 },
                }}
              >
                <Tabs.Screen
                  name="index"
                  options={{
                    tabBarLabel: '浏览',
                    tabBarIcon: ({ color }) => (
                      <Text style={{ color, fontSize: 20 }}>{'📸'}</Text>
                    ),
                  }}
                />
                <Tabs.Screen
                  name="settings"
                  options={{
                    tabBarLabel: '设置',
                    tabBarIcon: ({ color }) => (
                      <Text style={{ color, fontSize: 20 }}>{'⚙️'}</Text>
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
