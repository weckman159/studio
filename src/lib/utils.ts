
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Strips HTML tags from a string
 */
export function stripHtml(html: string): string {
   if (!html) return "";
   if (typeof document === 'undefined') {
     // Running on the server, return as is or use a server-side library
     return html.replace(/<[^>]*>?/gm, '');
   }
   const tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}
