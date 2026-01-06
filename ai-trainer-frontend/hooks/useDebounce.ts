/**
 * useDebounce Hook
 * 
 * Delays updating a value until after a specified delay
 * Useful for search inputs, API calls, etc.
 */

'use client';

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useDebounceCallback Hook
 * 
 * Debounces a callback function
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  }) as T;
}







