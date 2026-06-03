import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ChangelogEntry } from '../../constants/changelog';
import { Tokens } from '../../design-tokens';

interface Props {
  visible: boolean;
  entry: ChangelogEntry;
  onAcknowledge: () => void;
}

export function ChangelogModal({ visible, entry, onAcknowledge }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onAcknowledge}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons name={'sparkles' as any} size={22} color="#000000" />
          </View>

          <Text style={styles.title}>{entry.title}</Text>
          <Text style={styles.subtitle}>{entry.subtitle}</Text>
          <Text style={styles.version}>v{entry.version}</Text>

          <View style={styles.list}>
            {entry.highlights.map((item) => (
              <View key={item} style={styles.item}>
                <View style={styles.dot} />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onAcknowledge}
              style={({ pressed }) => [
                styles.button,
                pressed ? styles.buttonPressed : null,
              ]}
            >
              <Text style={styles.buttonText}>我已知晓</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Tokens.spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    backgroundColor: Tokens.color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.16)',
    padding: Tokens.spacing.xl,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Tokens.color.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Tokens.spacing.l,
  },
  title: {
    ...Tokens.typography.headline,
    color: Tokens.color.textPrimary,
  },
  subtitle: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
    marginTop: Tokens.spacing.s,
  },
  version: {
    ...Tokens.typography.caption,
    color: Tokens.color.accent,
    fontWeight: '700',
    marginTop: Tokens.spacing.m,
  },
  list: {
    gap: Tokens.spacing.m,
    marginTop: Tokens.spacing.xl,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Tokens.spacing.m,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Tokens.color.accent,
    marginTop: 8,
  },
  itemText: {
    ...Tokens.typography.body,
    color: Tokens.color.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Tokens.spacing.xl,
  },
  button: {
    minHeight: 44,
    paddingHorizontal: Tokens.spacing.xl,
    borderRadius: Tokens.radius.pill,
    backgroundColor: Tokens.color.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
});
