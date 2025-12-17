import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePollingOptions {
  interval?: number; // Polling interval in milliseconds
  maxAttempts?: number; // Maximum number of polling attempts
  enabled?: boolean; // Whether polling is enabled
}

interface UsePollingResult<T> {
  data: T | null;
  isPolling: boolean;
  error: Error | null;
  attempts: number;
  startPolling: () => void;
  stopPolling: () => void;
  reset: () => void;
}

/**
 * Custom hook for polling an async function
 * Useful for checking status of long-running operations like document analysis or code generation
 */
export function usePolling<T>(
  pollFn: () => Promise<T>,
  shouldStopPolling: (data: T) => boolean,
  options: UsePollingOptions = {}
): UsePollingResult<T> {
  const {
    interval = 2000,
    maxAttempts = 60,
    enabled = false,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isPolling, setIsPolling] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [attempts, setAttempts] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = useCallback(() => {
    setIsPolling(true);
    setError(null);
    setAttempts(0);
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setData(null);
    setError(null);
    setAttempts(0);
  }, [stopPolling]);

  useEffect(() => {
    if (!isPolling) {
      return;
    }

    const poll = async () => {
      try {
        setAttempts((prev) => prev + 1);
        const result = await pollFn();
        setData(result);

        // Check if we should stop polling
        if (shouldStopPolling(result)) {
          stopPolling();
          return;
        }

        // Check if we've exceeded max attempts
        if (attempts + 1 >= maxAttempts) {
          stopPolling();
          setError(new Error('Polling timeout: Maximum attempts reached'));
          return;
        }
      } catch (err) {
        stopPolling();
        setError(err instanceof Error ? err : new Error('Polling failed'));
      }
    };

    // Run immediately
    poll();

    // Set up interval
    intervalRef.current = setInterval(poll, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPolling, pollFn, shouldStopPolling, interval, maxAttempts, attempts, stopPolling]);

  return {
    data,
    isPolling,
    error,
    attempts,
    startPolling,
    stopPolling,
    reset,
  };
}
