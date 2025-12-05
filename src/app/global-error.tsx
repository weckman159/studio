'use client';

import { useEffect } from 'react';

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
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '32rem',
            width: '100%',
            textAlign: 'center'
          }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Критическая ошибка
            </h1>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Произошла критическая ошибка приложения. Попробуйте обновить страницу.
            </p>
            {process.env.NODE_ENV === 'development' && error.message && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#f5f5f5',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                textAlign: 'left',
                overflow: 'auto'
              }}>
                <pre style={{ fontSize: '0.875rem', color: '#dc2626', margin: 0 }}>
                  {error.message}
                </pre>
              </div>
            )}
            <button
              onClick={reset}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
