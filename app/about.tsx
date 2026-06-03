import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  APP_AUTHOR,
  APP_CONTACT_EMAIL,
  APP_NAME,
  APP_SLOGAN,
  APP_VERSION,
} from '../src/constants/app-info';
import { Tokens } from '../src/design-tokens';

export default function AboutScreen() {
  const router = useRouter();

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${APP_CONTACT_EMAIL}`).catch(() => undefined);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/settings')}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="chevron-left" size={30} color={Tokens.color.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>关于</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoMark}>
          <View style={[styles.logoCard, styles.logoCardBack]} />
          <View style={[styles.logoCard, styles.logoCardMiddle]} />
          <View style={[styles.logoCard, styles.logoCardFront]} />
        </View>

        <Text style={styles.appName}>{APP_NAME}</Text>
        <Text style={styles.slogan}>{APP_SLOGAN}</Text>

        <View style={styles.section}>
          <InfoRow label="当前版本" value={`v${APP_VERSION}`} />
          <InfoRow label="作者" value={APP_AUTHOR} />
          <Pressable onPress={handleEmailPress}>
            <InfoRow label="联系方式" value={APP_CONTACT_EMAIL} accent />
          </Pressable>
        </View>

        <Text style={styles.note}>
          一款为手机相册减负的小工具。照片整理在本地完成，记忆由你选择。
        </Text>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, accent ? styles.infoValueAccent : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.color.background,
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: Tokens.spacing.l,
    paddingBottom: Tokens.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Tokens.typography.title,
    color: Tokens.color.textPrimary,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    paddingHorizontal: Tokens.spacing.xl,
    paddingBottom: 80,
    alignItems: 'center',
  },
  logoMark: {
    width: 112,
    height: 104,
    marginTop: Tokens.spacing.xl,
    marginBottom: Tokens.spacing.xl,
  },
  logoCard: {
    position: 'absolute',
    width: 76,
    height: 92,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Tokens.color.accent,
    backgroundColor: Tokens.color.surface,
  },
  logoCardBack: {
    left: 10,
    top: 8,
    transform: [{ rotate: '-12deg' }],
    opacity: 0.5,
  },
  logoCardMiddle: {
    left: 26,
    top: 2,
    transform: [{ rotate: '7deg' }],
    opacity: 0.75,
  },
  logoCardFront: {
    left: 42,
    top: 14,
    transform: [{ rotate: '-2deg' }],
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
    letterSpacing: 4,
  },
  slogan: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
    marginTop: Tokens.spacing.s,
  },
  section: {
    width: '100%',
    marginTop: Tokens.spacing.xxl,
    borderRadius: 18,
    backgroundColor: Tokens.color.surface,
    overflow: 'hidden',
  },
  infoRow: {
    minHeight: 56,
    paddingHorizontal: Tokens.spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Tokens.color.textMuted,
    gap: Tokens.spacing.m,
  },
  infoLabel: {
    ...Tokens.typography.body,
    color: Tokens.color.textPrimary,
  },
  infoValue: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
    flexShrink: 1,
    textAlign: 'right',
  },
  infoValueAccent: {
    color: Tokens.color.accent,
    fontWeight: '700',
  },
  note: {
    ...Tokens.typography.caption,
    color: Tokens.color.textSecondary,
    lineHeight: 20,
    marginTop: Tokens.spacing.xl,
    textAlign: 'center',
  },
});
