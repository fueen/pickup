import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Tokens } from '../../design-tokens';
import { PhotoAsset } from '../../types/photo';

const IMAGE_SIZE = 100;

interface Props {
  photos: PhotoAsset[];
  onTap: (id: string) => void;
  markedIds: Set<string>;
}

export function DeleteGrid({ photos, onTap, markedIds }: Props) {
  return (
    <View style={styles.grid}>
      {photos.map((photo) => {
        const isMarked = markedIds.has(photo.id);
        return (
          <TouchableOpacity
            key={photo.id}
            style={[styles.cell, isMarked && styles.cellMarked]}
            onPress={() => onTap(photo.id)}
          >
            <Image source={{ uri: photo.uri }} style={styles.image} />
            {isMarked && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: Tokens.spacing.s },
  cell: { width: IMAGE_SIZE, height: IMAGE_SIZE, margin: 4, borderRadius: Tokens.radius.card, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  cellMarked: { borderColor: Tokens.color.danger },
  image: { width: '100%', height: '100%' },
  checkmark: { position: 'absolute', top: 4, right: 4, color: Tokens.color.danger, fontWeight: '700', fontSize: 16 },
});
