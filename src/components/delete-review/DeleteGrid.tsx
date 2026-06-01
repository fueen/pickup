import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Tokens } from '../../design-tokens';
import { PhotoAsset } from '../../types/photo';

const GRID_PADDING = 18;
const GAP = 9;
const COLUMNS = 3;
const IMAGE_SIZE = (Dimensions.get('window').width - GRID_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

interface Props {
  photos: PhotoAsset[];
  onTap: (id: string) => void;
  selectedIds: Set<string>;
  onPhotoPreview?: (photo: PhotoAsset) => void;
}

export function DeleteGrid({ photos, onTap, selectedIds, onPhotoPreview }: Props) {
  return (
    <View style={styles.grid}>
      {photos.map((photo) => {
        const isSelected = selectedIds.has(photo.id);
        return (
          <TouchableOpacity
            key={photo.id}
            style={styles.cell}
            onPress={() => onTap(photo.id)}
            onLongPress={() => onPhotoPreview?.(photo)}
            delayLongPress={300}
            activeOpacity={0.8}
          >
            <Image source={{ uri: photo.uri }} style={styles.image} />
            {isSelected && (
              <>
                <View style={styles.selectedWash} />
                <View style={styles.selectedRing} />
                <View style={styles.checkOverlay}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: GRID_PADDING,
    gap: GAP,
  },
  cell: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 16,
    overflow: 'visible',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: Tokens.color.surface,
  },
  selectedWash: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.24)',
  },
  selectedRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Tokens.color.accent,
  },
  checkOverlay: {
    position: 'absolute',
    right: 7,
    bottom: 7,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Tokens.color.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#111111',
  },
  checkIcon: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
});
