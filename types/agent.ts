/**
 * Agent Type Definitions
 * Defines types for AI agents, their configurations, and schemas
 */

/**
 * Agent status enum
 */
export type AgentStatus = 'active' | 'inactive' | 'maintenance';

/**
 * Agent category enum
 */
export type AgentCategory = 'video' | 'image' | 'text' | 'audio' | 'data' | 'other';

/**
 * Input schema type
 */
export type InputSchemaType = 'text' | 'form' | 'file';

/**
 * Form field type
 */
export type FormFieldType = 'text' | 'number' | 'select' | 'checkbox';

/**
 * Output schema type
 */
export type OutputSchemaType = 'video' | 'image' | 'text' | 'json';

/**
 * Form field definition for agent input
 */
export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  defaultValue?: any;
  options?: string[];
  required?: boolean;
}

/**
 * Validation rules for agent input
 */
export interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  custom?: (value: any) => boolean | string;
}

/**
 * Input schema definition
 */
export interface InputSchema {
  type: InputSchemaType;
  fields?: FormField[];
  validation?: ValidationRules;
}

/**
 * Output schema definition
 */
export interface OutputSchema {
  type: OutputSchemaType;
  format?: string;
}

/**
 * Agent settings for execution behavior
 */
export interface AgentSettings {
  maxExecutionTime?: number; // milliseconds
  pollingInterval?: number; // milliseconds
  retryAttempts?: number;
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  webhookUrl: string;
  category?: AgentCategory;
  status: AgentStatus;
  inputSchema: InputSchema;
  outputSchema: OutputSchema;
  settings?: AgentSettings;
}
