import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { SessionProvider, useSessionContext } from '../../src/contexts/SessionContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider>{children}</SessionProvider>
);

describe('SessionContext', () => {
  it('marks delete correctly', () => {
    const { result } = renderHook(() => useSessionContext(), { wrapper });
    act(() => { result.current.dispatch({ type: 'MARK_DELETE', payload: 'photo-123' }); });
    expect(result.current.state.markedDeleteIds).toContain('photo-123');
    expect(result.current.state.interactionLog).toHaveLength(1);
  });

  it('marks keep correctly', () => {
    const { result } = renderHook(() => useSessionContext(), { wrapper });
    act(() => { result.current.dispatch({ type: 'MARK_KEEP', payload: 'photo-456' }); });
    expect(result.current.state.markedKeepIds).toContain('photo-456');
  });

  it('undo removes last action', () => {
    const { result } = renderHook(() => useSessionContext(), { wrapper });
    act(() => { result.current.dispatch({ type: 'MARK_DELETE', payload: 'photo-789' }); });
    act(() => { result.current.dispatch({ type: 'UNDO_LAST' }); });
    expect(result.current.state.markedDeleteIds).not.toContain('photo-789');
    expect(result.current.state.interactionLog).toHaveLength(0);
  });

  it('reset clears all state', () => {
    const { result } = renderHook(() => useSessionContext(), { wrapper });
    act(() => { result.current.dispatch({ type: 'MARK_DELETE', payload: 'photo-1' }); });
    act(() => { result.current.dispatch({ type: 'RESET_SESSION' }); });
    expect(result.current.state.markedDeleteIds).toHaveLength(0);
    expect(result.current.state.interactionLog).toHaveLength(0);
  });
});
