import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'prime.stats.v1';

const initialState = {
  totalFiles: 0,
  infographicsCount: 0,
  recentActivity: [],
};

const StatsContext = createContext(undefined);

export function StatsProvider({ children }) {
  const [stats, setStats] = useState(initialState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!saved) {
          return;
        }
        const parsed = JSON.parse(saved);
        if (!mounted || !parsed || typeof parsed !== 'object') {
          return;
        }
        setStats({
          totalFiles: Number(parsed.totalFiles) || 0,
          infographicsCount: Number(parsed.infographicsCount) || 0,
          recentActivity: Array.isArray(parsed.recentActivity)
            ? parsed.recentActivity.map((item) => ({
                id: item?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                fileName: item?.fileName || 'Untitled.pdf',
                createdAt: item?.createdAt || new Date().toISOString(),
                resultUrl: item?.resultUrl || '',
              }))
            : [],
        });
      } catch (error) {
        console.warn('Failed to load stats from storage:', error);
      } finally {
        if (mounted) {
          setLoaded(true);
        }
      }
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats)).catch((error) => {
      console.warn('Failed to persist stats:', error);
    });
  }, [stats, loaded]);

  const recordGeneratedInfographic = useCallback((fileName, resultUrl) => {
    const safeName = fileName && typeof fileName === 'string' ? fileName : 'Untitled.pdf';
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fileName: safeName,
      createdAt: new Date().toISOString(),
      resultUrl: typeof resultUrl === 'string' ? resultUrl : '',
    };

    setStats((prev) => ({
      totalFiles: prev.totalFiles + 1,
      infographicsCount: prev.infographicsCount + 1,
      recentActivity: [entry, ...prev.recentActivity].slice(0, 20),
    }));
  }, []);

  const value = useMemo(
    () => ({
      totalFiles: stats.totalFiles,
      infographicsCount: stats.infographicsCount,
      recentActivity: stats.recentActivity,
      generatedCharts: stats.recentActivity,
      loaded,
      recordGeneratedInfographic,
    }),
    [stats, loaded, recordGeneratedInfographic],
  );

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
}

export function useStats() {
  const ctx = useContext(StatsContext);
  if (ctx === undefined) {
    throw new Error('useStats must be used within StatsProvider');
  }
  return ctx;
}
