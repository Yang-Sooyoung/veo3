/**
 * Error Handling Utilities
 * Custom error classes and error parsing utilities
 */

import { ExecutionError } from '@/types';

/**
 * Base error class for execution-related errors
 */
export class ExecutionBaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  /**
   * Convert to ExecutionError format
   */
  toExecutionError(): ExecutionError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Error thrown when execution times out
 */
export class ExecutionTimeoutError extends ExecutionBaseError {
  constructor(
    public executionId: string,
    public timeoutMs: number
  ) {
    super(
      `Execution ${executionId} timed out after ${timeoutMs}ms`,
      'EXECUTION_TIMEOUT',
      { executionId, timeoutMs }
    );
  }
}

/**
 * Error thrown when input validation fails
 */
export class ValidationError extends ExecutionBaseError {
  constructor(
    public field: string,
    public constraint: string,
    public value?: any
  ) {
    super(
      `Validation failed for ${field}: ${constraint}`,
      'VALIDATION_ERROR',
      { field, constraint, value }
    );
  }
}

/**
 * Error thrown when webhook request fails
 */
export class WebhookError extends ExecutionBaseError {
  constructor(
    public statusCode: number,
    public responseBody: string
  ) {
    super(
      `Webhook request failed with status ${statusCode}`,
      'WEBHOOK_ERROR',
      { statusCode, responseBody }
    );
  }
}

/**
 * Error thrown when network connection fails
 */
export class NetworkError extends ExecutionBaseError {
  constructor(message: string, public originalError?: Error) {
    super(
      `Network error: ${message}`,
      'NETWORK_ERROR',
      { originalError: originalError?.message }
    );
  }
}

/**
 * Error thrown when agent is not found
 */
export class AgentNotFoundError extends ExecutionBaseError {
  constructor(public agentId: string) {
    super(
      `Agent not found: ${agentId}`,
      'AGENT_NOT_FOUND',
      { agentId }
    );
  }
}

/**
 * Error thrown when agent is not available
 */
export class AgentUnavailableError extends ExecutionBaseError {
  constructor(
    public agentId: string,
    public reason: string
  ) {
    super(
      `Agent ${agentId} is unavailable: ${reason}`,
      'AGENT_UNAVAILABLE',
      { agentId, reason }
    );
  }
}

/**
 * Parse any error into a user-friendly ExecutionError
 */
export function parseError(error: unknown): ExecutionError {
  // Handle our custom errors
  if (error instanceof ExecutionBaseError) {
    return error.toExecutionError();
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      details: { name: error.name, stack: error.stack },
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      code: 'UNKNOWN_ERROR',
      message: error,
    };
  }

  // Handle unknown error types
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    details: error,
  };
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: ExecutionError): string {
  const messages: Record<string, string> = {
    EXECUTION_TIMEOUT: 'The request took too long to complete. Please try again.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    WEBHOOK_ERROR: 'Failed to connect to the service. Please try again later.',
    NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
    AGENT_NOT_FOUND: 'The selected agent could not be found.',
    AGENT_UNAVAILABLE: 'The agent is currently unavailable. Please try again later.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  };

  return messages[error.code] || error.message || messages.UNKNOWN_ERROR;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  retryableErrors: ['NETWORK_ERROR', 'WEBHOOK_ERROR'],
};

/**
 * Check if an error is retryable
 */
export function isRetryableError(
  error: ExecutionError,
  retryableErrors: string[] = DEFAULT_RETRY_CONFIG.retryableErrors!
): boolean {
  return retryableErrors.includes(error.code);
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const {
    maxAttempts = DEFAULT_RETRY_CONFIG.maxAttempts,
    delayMs = DEFAULT_RETRY_CONFIG.delayMs,
    backoffMultiplier = DEFAULT_RETRY_CONFIG.backoffMultiplier!,
    retryableErrors = DEFAULT_RETRY_CONFIG.retryableErrors!,
  } = config;

  let lastError: ExecutionError | null = null;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = parseError(error);

      // Don't retry if error is not retryable
      if (!isRetryableError(lastError, retryableErrors)) {
        throw error;
      }

      // Don't retry if this was the last attempt
      if (attempt === maxAttempts) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, currentDelay));

      // Increase delay for next attempt (exponential backoff)
      currentDelay *= backoffMultiplier;
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Validate input against validation rules
 */
export function validateInput(
  value: any,
  field: string,
  rules?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: (value: any) => boolean | string;
  }
): void {
  if (!rules) return;

  // Required validation
  if (rules.required && (value === undefined || value === null || value === '')) {
    throw new ValidationError(field, 'This field is required');
  }

  // Skip other validations if value is empty and not required
  if (!value && !rules.required) return;

  // String length validations
  if (typeof value === 'string') {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      throw new ValidationError(
        field,
        `Must be at least ${rules.minLength} characters`,
        value
      );
    }

    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      throw new ValidationError(
        field,
        `Must be at most ${rules.maxLength} characters`,
        value
      );
    }

    // Pattern validation
    if (rules.pattern) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        throw new ValidationError(field, 'Invalid format', value);
      }
    }
  }

  // Custom validation
  if (rules.custom) {
    const result = rules.custom(value);
    if (result === false) {
      throw new ValidationError(field, 'Custom validation failed', value);
    }
    if (typeof result === 'string') {
      throw new ValidationError(field, result, value);
    }
  }
}
