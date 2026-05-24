import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tokens } from '../../design-tokens';
import { formatPhotoDate } from '../../utils/date-utils';

interface PhotoDetail {
  creationTime: number;
  width: number;
  height: number;
  fileSize?: number;
  filename?: string;
}

interface Props {
  visible: boolean;
  photo: PhotoDetail | null;
  onClose: () => void;
}

function formatBytes(bytes: number | undefined): string {
  if (bytes == null) return '未知';
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function PhotoDetailSheet({ visible, photo, onClose }: Props) {
  if (!photo) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>照片详情</Text>
          <ScrollView style={styles.body}>
            <DetailRow icon="clock-outline" label="拍摄时间" value={formatPhotoDate(photo.creationTime)} />
            <DetailRow icon="expand-all" label="尺寸" value={`${photo.width} × ${photo.height}`} />
            <DetailRow icon="harddisk" label="文件大小" value={formatBytes(photo.fileSize)} />
            {photo.filename && (
              <DetailRow icon="file-outline" label="文件名" value={photo.filename} />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <MaterialCommunityIcons name={icon as any} size={20} color={Tokens.color.textSecondary} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: 'rgba(28,28,30,0.95)',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Tokens.color.textMuted, alignSelf: 'center', marginBottom: 16 },
  title: { ...Tokens.typography.title, color: Tokens.color.textPrimary, marginBottom: 16 },
  body: { flexGrow: 0 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.08)', gap: 12,
  },
  label: { ...Tokens.typography.body, color: Tokens.color.textSecondary },
  value: { ...Tokens.typography.body, color: Tokens.color.textPrimary, flex: 1, textAlign: 'right' },
});
