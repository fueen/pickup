# v2 Live Photo, Album Mosaic, and Logo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the v2.0 addendum requirements for Live Photo review playback, mosaic-style album selection, and the Picked Cards app icon.

**Architecture:** Keep media normalization in small pure helpers, keep album item shaping in `album-utils`, and keep UI changes in focused components. Live Photo playback uses Expo SDK 54 media metadata: `pairedVideoAsset` from `expo-media-library` on iOS and `expo-video` for inline playback, with graceful fallback when no paired video exists.

**Tech Stack:** Expo SDK 54, React Native 0.81.5, expo-router, expo-media-library, expo-video, Jest + ts-jest + @testing-library/react-native.

---

### Task 1: Live Photo Metadata and Badge

**Files:**
- Modify: `src/types/photo.ts`
- Create: `src/utils/photo-asset-utils.ts`
- Create: `src/components/ui/LivePhotoBadge.tsx`
- Test: `__tests__/unit/photo-asset-utils.test.ts`
- Test: `__tests__/unit/live-photo-badge.test.tsx`

- [ ] Add failing tests for mapping `mediaSubtypes: ['livePhoto']` and `pairedVideoAsset.uri` into a `PhotoAsset` with `mediaType: 'livePhoto'` and `pairedVideoUri`.
- [ ] Run the focused tests and verify they fail because the helper/component does not exist.
- [ ] Add `pairedVideoUri?: string | null` to `PhotoAsset` and `DeletedPhotoRecord`.
- [ ] Implement `toPhotoAsset(asset)` in `src/utils/photo-asset-utils.ts`.
- [ ] Implement `LivePhotoBadge` as a pressable iOS-style icon pill with 44x44 touch target, disabled fallback state, and `testID="live-photo-badge"`.
- [ ] Run the focused tests and verify they pass.

### Task 2: Live Photo Playback in Review

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/hooks/usePhotoEngine.ts`
- Modify: `src/components/photo-card/PhotoCard.tsx`
- Modify: `src/components/delete-review/PhotoZoomModal.tsx`
- Modify: `src/components/delete-review/PhotoDetailSheet.tsx`
- Test: `__tests__/unit/photo-asset-utils.test.ts`

- [ ] Install SDK-matched `expo-video` with `npx.cmd expo install expo-video`.
- [ ] Replace inline asset mapping in `usePhotoEngine` with `toPhotoAsset`.
- [ ] Update `PhotoCard` to use `LivePhotoBadge` instead of the old text-only `LIVE` badge.
- [ ] Update `PhotoZoomModal` to show `LivePhotoBadge` for Live Photos, overlay `VideoView` when `pairedVideoUri` exists, and show a fallback hint when it does not.
- [ ] Update `PhotoDetailSheet` to display `Live Photo` as the media type when available.
- [ ] Run `npx.cmd jest __tests__/unit/photo-asset-utils.test.ts --runInBand`.

### Task 3: Album Mosaic Data and UI

**Files:**
- Modify: `src/utils/album-utils.ts`
- Modify: `app/albums.tsx`
- Create: `src/components/albums/AlbumMosaicCard.tsx`
- Test: `__tests__/unit/album-utils.test.ts`

- [ ] Add failing tests proving `toVisibleAlbumItems` preserves `coverUris`, keeps `__all__` first, and does not introduce month grouping.
- [ ] Run the focused album util tests and verify they fail because `coverUris` is not preserved.
- [ ] Extend `VisibleAlbumItem` and `AlbumListInput` to support `coverUris`.
- [ ] Update `app/albums.tsx` to fetch up to 6 thumbnails per album and all-photos entry.
- [ ] Implement `AlbumMosaicCard` with bento tile layout, count badge, title, and fallback placeholders.
- [ ] Replace the 2-column card grid with a vertical mosaic list while preserving `handlePickAlbum`.
- [ ] Run `npx.cmd jest __tests__/unit/album-utils.test.ts --runInBand`.

### Task 4: Picked Cards App Icon Assets

**Files:**
- Create: `designs/generated/picked-cards-icon.svg`
- Modify: `assets/icon.png`
- Modify: `assets/adaptive-icon.png`
- Modify: `assets/favicon.png`
- Modify: `assets/splash-icon.png`

- [ ] Generate a 1024x1024 Picked Cards SVG with deep background, three stacked cards, `#A8D46F` main card, and completion dot.
- [ ] Render PNG outputs for icon, adaptive icon, favicon, and splash icon.
- [ ] Verify file dimensions with a local image metadata command.
- [ ] Keep `app.config.js` paths unchanged if they already point at these asset files.

### Task 5: Verification and Review

**Files:**
- All changed files

- [ ] Run `npx.cmd tsc --noEmit`.
- [ ] Run `npx.cmd jest --runInBand`.
- [ ] Inspect `git diff` for unrelated changes.
- [ ] Perform self code review against REQ-11, REQ-12, and REQ-13.
- [ ] Fix any issues found during self review.
