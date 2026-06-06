import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

type TabName = 'index' | 'hub' | 'settings';

interface GlyphProps {
  active?: boolean;
  size?: number;
}

interface TabGlyphProps extends GlyphProps {
  name: TabName;
}

export function PickupTabGlyph({ name, active = false, size = 28 }: TabGlyphProps) {
  if (name === 'settings') return <ProfileGlyph active={active} size={size} />;
  if (name === 'hub') return <HubGlyph active={active} size={size} />;
  return <AlbumStackGlyph active={active} size={size} />;
}

export function AlbumStackGlyph({ active = false, size = 28 }: GlyphProps) {
  const scale = size / 28;
  const frontColor = active ? '#FFFFFF' : 'rgba(255,255,255,0.86)';
  const accentColor = active ? Tokens.color.accent : 'rgba(255,255,255,0.36)';
  const mutedColor = active ? 'rgba(168,212,111,0.28)' : 'rgba(255,255,255,0.14)';

  return (
    <View style={[styles.glyphBox, { width: size, height: size }]}>
      <View
        style={[
          styles.albumBack,
          {
            width: 18 * scale,
            height: 21 * scale,
            borderRadius: 7 * scale,
            left: 2 * scale,
            top: 6 * scale,
            backgroundColor: mutedColor,
            borderColor: active ? 'rgba(168,212,111,0.38)' : 'rgba(255,255,255,0.12)',
          },
        ]}
      />
      <View
        style={[
          styles.albumMid,
          {
            width: 19 * scale,
            height: 22 * scale,
            borderRadius: 8 * scale,
            left: 6 * scale,
            top: 3 * scale,
            backgroundColor: accentColor,
          },
        ]}
      />
      <View
        style={[
          styles.albumFront,
          {
            width: 20 * scale,
            height: 22 * scale,
            borderRadius: 8 * scale,
            right: 1 * scale,
            bottom: 1 * scale,
            backgroundColor: frontColor,
          },
        ]}
      >
        <View
          style={[
            styles.albumSun,
            {
              width: 5 * scale,
              height: 5 * scale,
              borderRadius: 2.5 * scale,
              backgroundColor: active ? Tokens.color.accent : 'rgba(0,0,0,0.38)',
              right: 4 * scale,
              top: 4 * scale,
            },
          ]}
        />
        <View
          style={[
            styles.albumHill,
            {
              height: 7 * scale,
              borderTopLeftRadius: 8 * scale,
              borderTopRightRadius: 8 * scale,
              backgroundColor: active ? '#111111' : 'rgba(0,0,0,0.52)',
            },
          ]}
        />
      </View>
    </View>
  );
}

export function ProfileGlyph({ active = false, size = 30 }: GlyphProps) {
  const scale = size / 30;
  const color = active ? Tokens.color.accent : 'rgba(255,255,255,0.88)';
  const fill = active ? 'rgba(168,212,111,0.16)' : 'rgba(255,255,255,0.08)';

  return (
    <View style={[styles.glyphBox, { width: size, height: size }]}>
      <View
        style={[
          styles.profileShell,
          {
            width: 27 * scale,
            height: 27 * scale,
            borderRadius: 13.5 * scale,
            borderColor: color,
            backgroundColor: fill,
          },
        ]}
      >
        <View
          style={[
            styles.profileHead,
            {
              width: 9 * scale,
              height: 9 * scale,
              borderRadius: 4.5 * scale,
              backgroundColor: color,
              top: 5 * scale,
            },
          ]}
        />
        <View
          style={[
            styles.profileShoulders,
            {
              width: 17 * scale,
              height: 8 * scale,
              borderTopLeftRadius: 10 * scale,
              borderTopRightRadius: 10 * scale,
              borderBottomLeftRadius: 5 * scale,
              borderBottomRightRadius: 5 * scale,
              backgroundColor: color,
              bottom: 4 * scale,
            },
          ]}
        />
      </View>
      {active ? (
        <View
          style={[
            styles.profileDot,
            {
              width: 6 * scale,
              height: 6 * scale,
              borderRadius: 3 * scale,
              right: 2 * scale,
              bottom: 3 * scale,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

function HubGlyph({ active = false, size = 28 }: GlyphProps) {
  const scale = size / 28;
  const color = active ? Tokens.color.accent : 'rgba(255,255,255,0.86)';
  const faint = active ? 'rgba(168,212,111,0.20)' : 'rgba(255,255,255,0.10)';

  return (
    <View style={[styles.hubBox, { width: size, height: size, gap: 4 * scale }]}>
      {[0, 1, 2, 3].map((item) => (
        <View
          key={item}
          style={{
            width: 10 * scale,
            height: 10 * scale,
            borderRadius: 5 * scale,
            backgroundColor: item === 0 || active ? color : faint,
            borderWidth: active ? 0 : StyleSheet.hairlineWidth,
            borderColor: 'rgba(255,255,255,0.18)',
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  glyphBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumBack: {
    position: 'absolute',
    borderWidth: StyleSheet.hairlineWidth,
    transform: [{ rotate: '-12deg' }],
  },
  albumMid: {
    position: 'absolute',
    transform: [{ rotate: '7deg' }],
  },
  albumFront: {
    position: 'absolute',
    overflow: 'hidden',
  },
  albumSun: {
    position: 'absolute',
    zIndex: 2,
  },
  albumHill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  profileShell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  profileHead: {
    position: 'absolute',
  },
  profileShoulders: {
    position: 'absolute',
  },
  profileDot: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#080808',
  },
  hubBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
