import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { PhotoProvider } from '../src/contexts/PhotoContext';
import { SessionProvider } from '../src/contexts/SessionContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <PhotoProvider>
        <SessionProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#000000' },
              animation: 'fade',
            }}
          />
        </SessionProvider>
      </PhotoProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
