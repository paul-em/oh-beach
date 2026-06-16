import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merged Tailwind-Klassen konfliktfrei (shadcn-vue Standard-Helper). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
