import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { SessionProvider, useSessionContext } from '../../src/contexts/SessionContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider>{children}</SessionProvider>
);

describe('Full E2E flow (SessionContext)', () => {
  it('completes browse → mark → undo → delete flow', () => {
    const { result } = renderHook(() => useSessionContext(), { wrapper });

    // Browse: mark photo 1 as delete
    act(() => {
      result.current.dispatch({
        type: 'MARK_DELETE',
        payload: { photoId: 'photo-1', timestamp: 1000 },
      });
    });
    expect(result.current.state.markedDeleteIds).toContain('photo-1');

    // Browse: mark photo 2 as keep
    act(() => {
      result.current.dispatch({
        type: 'MARK_KEEP',
        payload: { photoId: 'photo-2', timestamp: 2000 },
      });
    });
    expect(result.current.state.markedKeepIds).toContain('photo-2');

    // Browse: skip photo 3
    act(() => {
      result.current.dispatch({
        type: 'SKIP',
        payload: { photoId: 'photo-3', timestamp: 3000 },
      });
    });
    expect(result.current.state.skippedIds).toContain('photo-3');

    // Undo the skip
    act(() => {
      result.current.dispatch({ type: 'UNDO_LAST' });
    });
    expect(result.current.state.skippedIds).not.toContain('photo-3');

    // Undo the keep
    act(() => {
      result.current.dispatch({ type: 'UNDO_LAST' });
    });
    expect(result.current.state.markedKeepIds).not.toContain('photo-2');

    // Re-mark photo 2 as delete
    act(() => {
      result.current.dispatch({
        type: 'MARK_DELETE',
        payload: { photoId: 'photo-2', timestamp: 4000 },
      });
    });
    expect(result.current.state.markedDeleteIds).toContain('photo-2');

    // Log should have 3 entries: delete(photo-1), keep undo(from log position 1), delete(photo-2)
    // Actually: action log is [DELETE photo-1, KEEP photo-2, SKIP photo-3]
    // After UNDO x2: [DELETE photo-1]
    // After re-mark DELETE photo-2: [DELETE photo-1, DELETE photo-2]
    expect(result.current.state.interactionLog).toHaveLength(2);
    expect(result.current.state.interactionLog[0].action).toBe('delete');
    expect(result.current.state.interactionLog[1].action).toBe('delete');

    // Reset session (simulating review → confirm delete)
    act(() => {
      result.current.dispatch({ type: 'RESET_SESSION' });
    });
    expect(result.current.state.markedDeleteIds).toHaveLength(0);
    expect(result.current.state.markedKeepIds).toHaveLength(0);
    expect(result.current.state.skippedIds).toHaveLength(0);
    expect(result.current.state.interactionLog).toHaveLength(0);
  });

  it('undo on empty log is a no-op', () => {
    const { result } = renderHook(() => useSessionContext(), { wrapper });

    const before = { ...result.current.state };
    act(() => {
      result.current.dispatch({ type: 'UNDO_LAST' });
    });
    expect(result.current.state).toEqual(before);
  });

  it('handles rapid mixed actions without data loss', () => {
    const { result } = renderHook(() => useSessionContext(), { wrapper });

    act(() => {
      for (let i = 0; i < 15; i++) {
        const types = ['MARK_DELETE', 'MARK_KEEP', 'SKIP'] as const;
        result.current.dispatch({
          type: types[i % 3],
          payload: { photoId: `photo-${i}`, timestamp: i * 1000 },
        });
      }
    });

    expect(result.current.state.interactionLog).toHaveLength(15);
    expect(result.current.state.markedDeleteIds).toHaveLength(5);
    expect(result.current.state.markedKeepIds).toHaveLength(5);
    expect(result.current.state.skippedIds).toHaveLength(5);
  });
});
