/**
 * Message Type Definitions
 * Defines types for chat messages and attachments
 */

/**
 * Message type enum
 */
export type MessageType = 'user' | 'agent' | 'system';

/**
 * Message attachment type
 */
export type AttachmentType = 'video' | 'image' | 'file';

/**
 * Message attachment
 */
export interface MessageAttachment {
  type: AttachmentType;
  url: string;
  name: string;
  size?: number;
  metadata?: Record<string, any>;
}

/**
 * Chat message
 */
export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  executionId?: string;
  attachments?: MessageAttachment[];
}
