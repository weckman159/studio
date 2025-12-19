
import * as React from "react"
import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'glass' | 'elevated'
  hover?: boolean
  className?: string
}

export function Card({
  children,
  variant = 'default',
  hover = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden transition-all duration-base',
        {
          'bg-surface border border-border': variant === 'default',
          'glass': variant === 'glass',
          'bg-surface-elevated shadow-lg': variant === 'elevated',
          'hover-lift hover:shadow-xl': hover,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div className={cn('p-4 border-b border-border', className)} {...props}>
      {children}
    </div>
  )
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div className={cn('p-4 border-t border-border', className)} {...props}>
      {children}
    </div>
  )
}

// Shadcn compatibility exports
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-text-secondary", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription"

export { CardTitle, CardDescription }
