// src/hooks/use-debounce.ts
'use client';

import { useState, useEffect } from 'react';

/**
 * Хук для "дебаунсинга" значения. Задерживает обновление значения до тех пор,
 * пока не пройдет указанное время с момента последнего изменения.
 * @param value Значение для дебаунсинга.
 * @param delay Задержка в миллисекундах.
 * @returns Дебаунсированное значение.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Очищаем таймер при каждом изменении значения или при размонтировании компонента
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
