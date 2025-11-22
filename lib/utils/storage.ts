/**
 * Storage Service
 * Centralized service for managing localStorage operations
 * Handles execution history, user preferences, and quota management
 */

import { Execution } from '@/types';

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  EXECUTION_PREFIX: 'ai-agent-platform:executions:',
  PREFERENCES: 'ai-agent-platform:preferences',
  SELECTED_AGENT: 'ai-agent-platform:selectedAgentId',
} as const;

/**
 * Maximum number of executions to store per agent
 */
const MAX_EXECUTIONS_PER_AGENT = 50;

/**
 * User preferences interface
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  sidebarCollapsed?: boolean;
  rightPanelVisible?: boolean;
  selectedAgentId?: string;
  [key: string]: any; // Allow additional preferences
}

/**
 * Storage error types
 */
export class StorageError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export class QuotaExceededError extends StorageError {
  constructor() {
    super('Storage quota exceeded', 'QUOTA_EXCEEDED');
  }
}

export class StorageUnavailableError extends StorageError {
  constructor() {
    super('localStorage is not available', 'STORAGE_UNAVAILABLE');
  }
}

/**
 * Storage Service class
 */
export class StorageService {
  /**
   * Check if localStorage is available
   */
  private static isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage key for agent executions
   */
  private static getExecutionKey(agentId: string): string {
    return `${STORAGE_KEYS.EXECUTION_PREFIX}${agentId}`;
  }

  /**
   * Save executions for a specific agent
   */
  static saveExecutions(agentId: string, executions: Execution[]): void {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available');
      return;
    }

    const key = this.getExecutionKey(agentId);

    try {
      // Limit to MAX_EXECUTIONS_PER_AGENT most recent executions
      const limitedExecutions = executions.slice(0, MAX_EXECUTIONS_PER_AGENT);
      
      // Serialize executions
      const serialized = JSON.stringify(limitedExecutions);
      
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Failed to save executions for agent ${agentId}:`, error);

      // Handle quota exceeded error
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.handleQuotaExceeded(agentId, executions);
      }
    }
  }

  /**
   * Load executions for a specific agent
   */
  static loadExecutions(agentId: string): Execution[] {
    if (!this.isAvailable()) {
      return [];
    }

    const key = this.getExecutionKey(agentId);

    try {
      const data = localStorage.getItem(key);
      
      if (!data) return [];

      const parsed = JSON.parse(data);

      // Convert date strings back to Date objects
      return parsed.map((execution: any) => ({
        ...execution,
        createdAt: new Date(execution.createdAt),
        completedAt: execution.completedAt ? new Date(execution.completedAt) : undefined,
      }));
    } catch (error) {
      console.error(`Failed to load executions for agent ${agentId}:`, error);
      return [];
    }
  }

  /**
   * Clear executions for a specific agent
   */
  static clearExecutions(agentId: string): void {
    if (!this.isAvailable()) {
      return;
    }

    const key = this.getExecutionKey(agentId);

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to clear executions for agent ${agentId}:`, error);
    }
  }

  /**
   * Clear all executions for all agents
   */
  static clearAllExecutions(): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const keys = Object.keys(localStorage);
      const executionKeys = keys.filter((key) =>
        key.startsWith(STORAGE_KEYS.EXECUTION_PREFIX)
      );

      executionKeys.forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear all executions:', error);
    }
  }

  /**
   * Get all agent IDs that have stored executions
   */
  static getAgentIdsWithExecutions(): string[] {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const keys = Object.keys(localStorage);
      const executionKeys = keys.filter((key) =>
        key.startsWith(STORAGE_KEYS.EXECUTION_PREFIX)
      );

      return executionKeys.map((key) =>
        key.replace(STORAGE_KEYS.EXECUTION_PREFIX, '')
      );
    } catch (error) {
      console.error('Failed to get agent IDs with executions:', error);
      return [];
    }
  }

  /**
   * Save user preferences
   */
  static savePreferences(preferences: UserPreferences): void {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available');
      return;
    }

    try {
      const serialized = JSON.stringify(preferences);
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, serialized);
    } catch (error) {
      console.error('Failed to save preferences:', error);

      // Handle quota exceeded error
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        // Try to clear some space by removing old executions
        this.freeUpSpace();
        
        // Retry saving preferences
        try {
          const serialized = JSON.stringify(preferences);
          localStorage.setItem(STORAGE_KEYS.PREFERENCES, serialized);
        } catch (retryError) {
          console.error('Failed to save preferences after freeing space:', retryError);
          throw new QuotaExceededError();
        }
      }
    }
  }

  /**
   * Load user preferences
   */
  static loadPreferences(): UserPreferences {
    if (!this.isAvailable()) {
      return {};
    }

    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      
      if (!data) return {};

      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return {};
    }
  }

  /**
   * Clear user preferences
   */
  static clearPreferences(): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    } catch (error) {
      console.error('Failed to clear preferences:', error);
    }
  }

  /**
   * Update a specific preference
   */
  static updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): void {
    const preferences = this.loadPreferences();
    preferences[key] = value;
    this.savePreferences(preferences);
  }

  /**
   * Get a specific preference
   */
  static getPreference<K extends keyof UserPreferences>(
    key: K
  ): UserPreferences[K] | undefined {
    const preferences = this.loadPreferences();
    return preferences[key];
  }

  /**
   * Handle quota exceeded error by reducing stored data
   */
  private static handleQuotaExceeded(agentId: string, executions: Execution[]): void {
    console.warn('Storage quota exceeded, attempting to reduce stored data');

    try {
      // Keep only the 10 most recent executions for this agent
      const reducedExecutions = executions.slice(0, 10);
      const serialized = JSON.stringify(reducedExecutions);
      const key = this.getExecutionKey(agentId);
      
      localStorage.setItem(key, serialized);
      
      console.log(`Reduced executions for agent ${agentId} to 10 most recent`);
    } catch (retryError) {
      console.error('Failed to save even after reducing executions:', retryError);
      
      // Last resort: try to free up space by clearing old executions
      this.freeUpSpace();
      
      // Final attempt
      try {
        const reducedExecutions = executions.slice(0, 5);
        const serialized = JSON.stringify(reducedExecutions);
        const key = this.getExecutionKey(agentId);
        
        localStorage.setItem(key, serialized);
        
        console.log(`Reduced executions for agent ${agentId} to 5 most recent`);
      } catch (finalError) {
        console.error('Failed to save executions after all attempts:', finalError);
        throw new QuotaExceededError();
      }
    }
  }

  /**
   * Free up storage space by removing old executions
   */
  private static freeUpSpace(): void {
    console.log('Attempting to free up storage space');

    try {
      const agentIds = this.getAgentIdsWithExecutions();
      
      // For each agent, reduce executions to 10 most recent
      agentIds.forEach((agentId) => {
        const executions = this.loadExecutions(agentId);
        if (executions.length > 10) {
          const reducedExecutions = executions.slice(0, 10);
          const key = this.getExecutionKey(agentId);
          localStorage.setItem(key, JSON.stringify(reducedExecutions));
        }
      });
      
      console.log('Successfully freed up storage space');
    } catch (error) {
      console.error('Failed to free up storage space:', error);
    }
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): {
    used: number;
    available: number;
    percentage: number;
  } {
    if (!this.isAvailable()) {
      return { used: 0, available: 0, percentage: 0 };
    }

    try {
      let totalSize = 0;
      
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const value = localStorage.getItem(key);
          if (value) {
            // Approximate size in bytes (UTF-16 encoding)
            totalSize += key.length + value.length;
          }
        }
      }

      // Most browsers have a 5-10MB limit for localStorage
      // We'll assume 5MB as a conservative estimate
      const estimatedLimit = 5 * 1024 * 1024; // 5MB in bytes
      const percentage = (totalSize / estimatedLimit) * 100;

      return {
        used: totalSize,
        available: estimatedLimit - totalSize,
        percentage: Math.min(percentage, 100),
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * Clear all application data from localStorage
   */
  static clearAll(): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const keys = Object.keys(localStorage);
      const appKeys = keys.filter((key) =>
        key.startsWith('ai-agent-platform:')
      );

      appKeys.forEach((key) => {
        localStorage.removeItem(key);
      });
      
      console.log('Cleared all application data from localStorage');
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  /**
   * Export all data as JSON (for backup/migration)
   */
  static exportData(): string {
    if (!this.isAvailable()) {
      return '{}';
    }

    try {
      const data: Record<string, any> = {};
      
      const keys = Object.keys(localStorage);
      const appKeys = keys.filter((key) =>
        key.startsWith('ai-agent-platform:')
      );

      appKeys.forEach((key) => {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      });

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '{}';
    }
  }

  /**
   * Import data from JSON (for backup/migration)
   */
  static importData(jsonData: string): void {
    if (!this.isAvailable()) {
      throw new StorageUnavailableError();
    }

    try {
      const data = JSON.parse(jsonData);

      Object.entries(data).forEach(([key, value]) => {
        if (key.startsWith('ai-agent-platform:')) {
          const serialized = typeof value === 'string' ? value : JSON.stringify(value);
          localStorage.setItem(key, serialized);
        }
      });
      
      console.log('Successfully imported data');
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new StorageError('Failed to import data', 'IMPORT_ERROR');
    }
  }
}
