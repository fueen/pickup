import React from 'react';
import { Modal as RNModal, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Tokens } from '../../design-tokens';

interface Props {
  visible: boolean;
  transparent?: boolean;
  animationType?: 'none' | 'slide' | 'fade';
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({
  visible,
  transparent = true,
  animationType = 'slide',
  onClose,
  children,
}: Props) {
  return (
    <RNModal visible={visible} transparent={transparent} animationType={animationType}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.inner}>{children}</View>
      </TouchableOpacity>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Tokens.color.overlay,
    justifyContent: 'flex-end',
  },
  inner: {
    backgroundColor: Tokens.color.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Tokens.spacing.xl,
    paddingBottom: Tokens.spacing.xxl + 20,
  },
});
