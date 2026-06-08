// Reusable custom React hooks

import { useState, useEffect, useRef, useCallback } from 'react';

// useStopwatch
// Manage stopwatch state with start/pause/reset and formatted output

export const useStopwatch = () => {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const start  = useCallback(() => setRunning(true), []);
  const pause  = useCallback(() => setRunning(false), []);
  const toggle = useCallback(() => setRunning((r) => !r), []);
  const reset  = useCallback(() => { setRunning(false); setSeconds(0); }, []);

  // Format as MM:SS or HH:MM:SS
  const formatted = (() => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  })();

  return { seconds, running, formatted, start, pause, toggle, reset };
};

// useCountdown
// Countdown timer with configurable duration

export const useCountdown = (onComplete) => {
  const [seconds, setSeconds]   = useState(0);
  const [running, setRunning]   = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setFinished(true);
            onComplete?.();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, onComplete]);

  const start = useCallback((totalSeconds) => {
    setSeconds(totalSeconds);
    setFinished(false);
    setRunning(true);
  }, []);

  const pause  = useCallback(() => setRunning(false), []);
  const toggle = useCallback(() => setRunning((r) => !r), []);
  const reset  = useCallback(() => { setRunning(false); setSeconds(0); setFinished(false); }, []);

  const formatted = (() => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  })();

  return { seconds, running, finished, formatted, start, pause, toggle, reset };
};

// useAsyncData
// Generic hook for loading async data with loading/error states

export const useAsyncData = (fetchFn, deps = []) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (e) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
};

// useDebounce
// Debounce a rapidly changing value (e.g. search input)

export const useDebounce = (value, delayMs = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};

// usePrevious
// Get the previous value of a prop or state

export const usePrevious = (value) => {
  const ref = useRef(undefined);
  useEffect(() => { ref.current = value; });
  return ref.current;
};

// useToggle

export const useToggle = (initial = false) => {
  const [state, setState] = useState(initial);
  const toggle = useCallback(() => setState((s) => !s), []);
  const setTrue  = useCallback(() => setState(true), []);
  const setFalse = useCallback(() => setState(false), []);
  return [state, toggle, setTrue, setFalse];
};

export default {
  useStopwatch,
  useCountdown,
  useAsyncData,
  useDebounce,
  usePrevious,
  useToggle,
};
