import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { DailyStats } from '../types/subscription';
import {
  loadStats,
  recordViewed as saveViewed,
  recordDeleted as saveDeleted,
} from '../services/stats-service';

interface StatsContextValue {
  totalViewed: number;
  totalDeleted: number;
  totalFreedBytes: number;
  streakDays: number;
  weeklyHistory: DailyStats[];
  recordViewed: (count: number) => void;
  recordDeleted: (count: number, bytes: number) => void;
}

const StatsCtx = createContext<StatsContextValue | null>(null);

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [totalViewed, setTotalViewed] = useState(0);
  const [totalDeleted, setTotalDeleted] = useState(0);
  const [totalFreedBytes, setTotalFreedBytes] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [weeklyHistory, setWeeklyHistory] = useState<DailyStats[]>([]);

  useEffect(() => {
    loadStats().then((s) => {
      setTotalViewed(s.totalViewed);
      setTotalDeleted(s.totalDeleted);
      setTotalFreedBytes(s.totalFreedBytes);
      setStreakDays(s.streakDays);
      setWeeklyHistory(s.weeklyHistory);
    });
  }, []);

  const recordViewed = useCallback(async (count: number) => {
    const s = await saveViewed(count);
    setTotalViewed(s.totalViewed);
    setStreakDays(s.streakDays);
    setWeeklyHistory(s.weeklyHistory);
  }, []);

  const recordDeleted = useCallback(
    async (count: number, bytes: number) => {
      const s = await saveDeleted(count, bytes);
      setTotalDeleted(s.totalDeleted);
      setTotalFreedBytes(s.totalFreedBytes);
    },
    [],
  );

  return (
    <StatsCtx.Provider
      value={{
        totalViewed,
        totalDeleted,
        totalFreedBytes,
        streakDays,
        weeklyHistory,
        recordViewed,
        recordDeleted,
      }}
    >
      {children}
    </StatsCtx.Provider>
  );
}

export function useStatsContext(): StatsContextValue {
  const ctx = useContext(StatsCtx);
  if (!ctx)
    throw new Error('useStatsContext must be inside StatsProvider');
  return ctx;
}
