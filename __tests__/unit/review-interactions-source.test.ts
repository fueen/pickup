import fs from 'fs';
import path from 'path';

describe('review interaction source guards', () => {
  const indexSource = () => fs.readFileSync(path.join(__dirname, '../../app/index.tsx'), 'utf8');
  const zoomSource = () => fs.readFileSync(path.join(__dirname, '../../src/components/delete-review/PhotoZoomModal.tsx'), 'utf8');

  it('keeps the browse sort control icon-only', () => {
    const source = indexSource();

    expect(source).not.toContain('<Text style={styles.pillLabel}>排序</Text>');
  });

  it('keeps review zoom independent from RNGH gesture recognition', () => {
    const source = zoomSource();

    expect(source).not.toContain('GestureDetector');
    expect(source).not.toContain('Gesture.');
  });

  it('uses a JS double-tap fallback for image zoom and does not play live photos from the image tap area', () => {
    const source = zoomSource();

    expect(source).toContain('handleZoomStagePress');
    expect(source).toContain('onPress={handleZoomStagePress}');
    expect(source).not.toContain('liveTapGesture');
    expect(source).not.toContain('Gesture.Exclusive(doubleTapGesture');
  });

  it('loads live photo playback sources explicitly before playing', () => {
    const source = zoomSource();

    expect(source).toContain('await player.replaceAsync({ uri })');
    expect(source).toContain('player.play()');
  });
});
