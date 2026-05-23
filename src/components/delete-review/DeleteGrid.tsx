import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Tokens } from '../../design-tokens';
import { PhotoAsset } from '../../types/photo';

const IMAGE_SIZE = 100;

interface Props {
  photos: PhotoAsset[];
  onTap: (id: string) => void;
  selectedIds: Set<string>;
}

export function DeleteGrid({ photos, onTap, selectedIds }: Props) {
  return (
    <View style={styles.grid}>
      {photos.map((photo) => {
        const isSelected = selectedIds.has(photo.id);
        return (
          <TouchableOpacity
            key={photo.id}
            style={styles.cell}
            onPress={() => onTap(photo.id)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: photo.uri }} style={styles.image} />
            {isSelected && (
              <View style={styles.checkOverlay}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    padding: Tokens.spacing.s,
  },
  cell: {
    width: IMAGE_SIZE, height: IMAGE_SIZE, margin: 4,
    borderRadius: Tokens.radius.card, overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  checkOverlay: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 16,
  },
});
