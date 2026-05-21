import React, { createContext, useContext, useReducer } from 'react';
import { GestureState, InteractionLogEntry } from '../types/photo';

interface SessionState {
  gestureState: GestureState;
  markProgress: number;
  markedDeleteIds: string[];
  markedKeepIds: string[];
  skippedIds: string[];
  interactionLog: InteractionLogEntry[];
}

type SessionAction =
  | { type: 'SET_GESTURE_STATE'; payload: GestureState }
  | { type: 'SET_MARK_PROGRESS'; payload: number }
  | { type: 'MARK_DELETE'; payload: { photoId: string; timestamp: number } }
  | { type: 'MARK_KEEP'; payload: { photoId: string; timestamp: number } }
  | { type: 'SKIP'; payload: { photoId: string; timestamp: number } }
  | { type: 'UNDO_LAST' }
  | { type: 'RESET_SESSION' };

const initialState: SessionState = {
  gestureState: 'idle', markProgress: 0,
  markedDeleteIds: [], markedKeepIds: [], skippedIds: [], interactionLog: [],
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_GESTURE_STATE': return { ...state, gestureState: action.payload };
    case 'SET_MARK_PROGRESS': return { ...state, markProgress: action.payload };
    case 'MARK_DELETE':
      return {
        ...state,
        markedDeleteIds: [...state.markedDeleteIds, action.payload.photoId],
        interactionLog: [...state.interactionLog, { photoId: action.payload.photoId, action: 'delete', timestamp: action.payload.timestamp }],
      };
    case 'MARK_KEEP':
      return {
        ...state,
        markedKeepIds: [...state.markedKeepIds, action.payload.photoId],
        interactionLog: [...state.interactionLog, { photoId: action.payload.photoId, action: 'keep', timestamp: action.payload.timestamp }],
      };
    case 'SKIP':
      return {
        ...state,
        skippedIds: [...state.skippedIds, action.payload.photoId],
        interactionLog: [...state.interactionLog, { photoId: action.payload.photoId, action: 'skip', timestamp: action.payload.timestamp }],
      };
    case 'UNDO_LAST': {
      if (state.interactionLog.length === 0) return state;
      const last = state.interactionLog[state.interactionLog.length - 1];
      return {
        ...state,
        interactionLog: state.interactionLog.slice(0, -1),
        markedDeleteIds: last.action === 'delete' ? state.markedDeleteIds.filter((id) => id !== last.photoId) : state.markedDeleteIds,
        markedKeepIds: last.action === 'keep' ? state.markedKeepIds.filter((id) => id !== last.photoId) : state.markedKeepIds,
        skippedIds: last.action === 'skip' ? state.skippedIds.filter((id) => id !== last.photoId) : state.skippedIds,
      };
    }
    case 'RESET_SESSION': return initialState;
    default: return state;
  }
}

type SessionContextValue = { state: SessionState; dispatch: React.Dispatch<SessionAction> };

const SessionCtx = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  return <SessionCtx.Provider value={{ state, dispatch }}>{children}</SessionCtx.Provider>;
}

export function useSessionContext(): SessionContextValue {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error('useSessionContext must be inside SessionProvider');
  return ctx;
}
