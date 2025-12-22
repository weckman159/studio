
import { cn } from "@/lib/utils";
import React from "react";

/**
 * A simple layout wrapper that provides consistent padding and max-width.
 */
export function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("container mx-auto px-4 py-8 lg:py-12", className)}>
      {children}
    </div>
  );
}
