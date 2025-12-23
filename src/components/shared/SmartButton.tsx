// src/components/shared/SmartButton.tsx
'use client';

import { useFormStatus } from 'react-dom';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface SmartButtonProps extends ButtonProps {
  loadingText?: string;
  isPending?: boolean; // Для использования вне форм (useTransition)
}

export function SmartButton({ 
  children, 
  loadingText = "Обработка...", 
  isPending: externalPending,
  className,
  disabled,
  ...props 
}: SmartButtonProps) {
  const { pending: formPending } = useFormStatus();
  const isLoading = externalPending || formPending;

  return (
    <Button
      disabled={disabled || isLoading}
      className={cn(
        "relative transition-all active:scale-95",
        isLoading && "opacity-80",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
