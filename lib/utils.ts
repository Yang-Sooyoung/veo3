import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Export storage utilities
export { StorageService, StorageError, QuotaExceededError, StorageUnavailableError } from './utils/storage';
export type { UserPreferences } from './utils/storage';
