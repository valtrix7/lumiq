import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and resolve Tailwind conflicts.
 *
 * Canonical class-name helper for the Lumiq web app. shadcn primitives import
 * `cn` from `@/lib/utils`, which re-exports this implementation, so both
 * `@/lib/cn` and `@/lib/utils` resolve to the same function.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
