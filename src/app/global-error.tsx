'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="ru">
      <body>
        <div style={{
          fontFamily: 'sans-serif',
          height: '100vh',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111827', // dark background
          color: '#F9FAFB' // light text
        }}>
          <div className="p-8 max-w-md w-full">
            <h1 style={{fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem'}}>
              Критическая ошибка
            </h1>
            <p style={{color: '#9CA3AF', marginBottom: '1.5rem'}}>
              Произошла непредвиденная ошибка, которая затронула всё приложение. 
              Наша команда уже уведомлена. Пожалуйста, попробуйте перезагрузить.
            </p>
            <Button
              onClick={() => reset()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Перезагрузить приложение
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
