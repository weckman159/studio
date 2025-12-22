
import { cn } from "@/lib/utils";
import React from "react";

/**
 * Простая обертка для страниц, которая обеспечивает консистентные отступы и максимальную ширину.
 */
export function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("container mx-auto px-4 py-8 lg:py-12", className)}>
      {children}
    </div>
  );
}
