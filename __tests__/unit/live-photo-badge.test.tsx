import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { LivePhotoBadge } from '../../src/components/ui/LivePhotoBadge';

describe('LivePhotoBadge', () => {
  it('renders an iOS-style live photo control and handles press', () => {
    const onPress = jest.fn();
    const screen = render(<LivePhotoBadge onPress={onPress} />);

    fireEvent.press(screen.getByTestId('live-photo-badge'));

    expect(screen.getByText('LIVE')).toBeTruthy();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const screen = render(<LivePhotoBadge onPress={onPress} disabled />);
    const badge = screen.getByTestId('live-photo-badge');

    expect(badge.props.disabled).toBe(true);
    expect(badge.props.onPress).toBeUndefined();
    expect(screen.getByText('LIVE')).toBeTruthy();
  });
});
