/**
 * Execution Type Definitions
 * Defines types for agent executions, their status, and results
 */

/**
 * Execution status enum
 */
export type ExecutionStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Execution input data
 */
export interface ExecutionInput {
  prompt?: string;
  parameters?: Record<string, any>;
}

/**
 * Execution output data
 */
export interface ExecutionOutput {
  type: 'video' | 'image' | 'text' | 'json';
  data: string | Blob | object; // URL, binary data, or JSON
  metadata?: Record<string, any>;
}

/**
 * Execution error information
 */
export interface ExecutionError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Execution model
 */
export interface Execution {
  id: string;
  agentId: string;
  status: ExecutionStatus;
  input: ExecutionInput;
  output?: ExecutionOutput;
  createdAt: Date;
  completedAt?: Date;
  error?: ExecutionError;
}

/**
 * Webhook response from n8n
 */
export interface WebhookResponse {
  executionId?: string;
  status: string;
  data?: any;
}

/**
 * Execution result from polling
 */
export interface ExecutionResult {
  status: ExecutionStatus;
  output?: ExecutionOutput;
  error?: ExecutionError;
}
