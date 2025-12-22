import { cn } from "@/lib/utils";
import React from "react";

/**
 * Простой компонент-обертка для создания "стеклянного" эффекта.
 */
export function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-white/10 bg-black/20 backdrop-blur-md", className)}>
      {children}
    </div>
  );
}
