'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useExecutionStore } from '@/lib/store/execution-store';
import { ChatMessage as ChatMessageType, Execution } from '@/types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ConnectionError } from './ConnectionError';
import { SettingsPanel, VEO3Parameters } from '@/components/agents/SettingsPanel';
import { Sparkles } from 'lucide-react';
import { ExecutionService } from '@/lib/api/execution-service';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { getUserFriendlyErrorMessage, NetworkError } from '@/lib/api/errors';
import { WebhookClient } from '@/lib/api/webhook-client';

interface ChatContainerProps {
  agentId: string;
}

export function ChatContainer({ agentId }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [veo3Parameters, setVeo3Parameters] = useState<VEO3Parameters | null>(null);
  const executionServiceRef = useRef<ExecutionService>(new ExecutionService());
  const webhookClientRef = useRef<WebhookClient>(new WebhookClient());
  const { success, error: showError } = useToast();
  const lastFailedInputRef = useRef<{ prompt: string; parameters?: VEO3Parameters }>();
  const [showConnectionError, setShowConnectionError] = useState(false);

  const {
    getExecutionsByAgent,
    loadHistory,
    isExecuting,
    addExecution,
    updateExecution,
  } = useExecutionStore();

  // Load execution history on mount
  useEffect(() => {
    loadHistory(agentId);
  }, [agentId, loadHistory]);

  const executions = getExecutionsByAgent(agentId);

  // Convert executions to chat messages - Memoized for performance
  const messages = useMemo(() => {
    const messageList: ChatMessageType[] = [];
    
    executions.forEach((execution) => {
      // Add user message (prompt)
      if (execution.input.prompt) {
        messageList.push({
          id: `${execution.id}-user`,
          type: 'user',
          content: execution.input.prompt,
          timestamp: execution.createdAt,
          executionId: execution.id,
        });
      }

      // Add agent response if completed
      if (execution.status === 'completed' && execution.output) {
        const content = getOutputContent(execution);
        const attachments = getOutputAttachments(execution);

        messageList.push({
          id: `${execution.id}-agent`,
          type: 'agent',
          content,
          timestamp: execution.completedAt || execution.createdAt,
          executionId: execution.id,
          attachments,
        });
      }

      // Add system message for errors
      if (execution.status === 'failed' && execution.error) {
        messageList.push({
          id: `${execution.id}-error`,
          type: 'system',
          content: `Error: ${execution.error.message}`,
          timestamp: execution.completedAt || execution.createdAt,
          executionId: execution.id,
        });
      }
    });

    // Reverse to show oldest first
    return messageList.reverse();
  }, [executions]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, shouldAutoScroll]);

  // Detect if user has scrolled up - Memoized
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setShouldAutoScroll(isAtBottom);
  }, []);

  const handleSubmit = useCallback(async (message: string) => {
    const executionService = executionServiceRef.current;

    // Prepare execution input
    const input = {
      prompt: message,
      parameters: veo3Parameters || undefined,
    };

    // Store for retry functionality
    lastFailedInputRef.current = input;

    // Create initial execution with pending status
    const initialExecution: Execution = {
      id: crypto.randomUUID(),
      agentId,
      status: 'pending',
      input,
      createdAt: new Date(),
    };

    // Add to store immediately to show in UI
    addExecution(initialExecution);

    try {
      // Update status to processing
      updateExecution(initialExecution.id, { status: 'processing' });

      // Execute the agent
      const execution = await executionService.executeAgent(agentId, input);

      // If execution is processing, start polling for results
      if (execution.status === 'processing' && execution.output?.metadata?.pollUrl) {
        console.log('Starting polling for execution results...');
        
        // Start polling every 10 seconds
        const pollInterval = setInterval(async () => {
          try {
            const response = await fetch(execution.output.metadata.pollUrl);
            const pollResult = await response.json();
            
            if (pollResult.status === 'completed') {
              // Video generation completed!
              clearInterval(pollInterval);
              
              updateExecution(initialExecution.id, {
                status: 'completed',
                output: {
                  type: 'video',
                  data: pollResult.data,
                  metadata: pollResult.metadata
                },
                completedAt: new Date(),
              });
              
              toast({
                title: "Video Generated!",
                description: "Your video has been successfully generated.",
              });
              
            } else if (pollResult.status === 'failed') {
              // Generation failed
              clearInterval(pollInterval);
              
              updateExecution(initialExecution.id, {
                status: 'failed',
                error: {
                  code: 'GENERATION_FAILED',
                  message: pollResult.message || 'Video generation failed'
                },
                completedAt: new Date(),
              });
              
              toast({
                title: "Generation Failed",
                description: pollResult.message || "Video generation failed. Please try again.",
                variant: "destructive",
              });
            }
            // If still processing, continue polling
            
          } catch (pollError) {
            console.error('Polling error:', pollError);
            // Continue polling on error
          }
        }, 10000); // Poll every 10 seconds
        
        // Stop polling after 10 minutes (max timeout)
        setTimeout(() => {
          clearInterval(pollInterval);
          updateExecution(initialExecution.id, {
            status: 'failed',
            error: {
              code: 'TIMEOUT',
              message: 'Video generation timed out after 10 minutes'
            },
            completedAt: new Date(),
          });
        }, 600000); // 10 minutes
        
      } else {
        // Update execution with final result (immediate response)
        updateExecution(initialExecution.id, {
          status: execution.status,
          output: execution.output,
          completedAt: execution.completedAt,
          error: execution.error,
        });
      }

      // Show success toast if completed immediately
      if (execution.status === 'completed') {
        success('Success', 'Execution completed successfully');
      } else if (execution.status === 'failed') {
        const errorMessage = execution.error 
          ? getUserFriendlyErrorMessage(execution.error)
          : 'An unknown error occurred';
        
        showError(
          'Execution Failed',
          errorMessage,
          <ToastAction 
            altText="Retry" 
            onClick={() => handleRetry()}
          >
            Retry
          </ToastAction>
        );
      }
    } catch (error) {
      // Check if it's a network/connection error
      if (error instanceof NetworkError) {
        setShowConnectionError(true);
        
        // Update execution with error status
        updateExecution(initialExecution.id, {
          status: 'failed',
          error: {
            code: 'NETWORK_ERROR',
            message: error.message,
            details: error,
          },
          completedAt: new Date(),
        });

        // Show connection error toast
        showError(
          'Connection Error',
          'Unable to connect to the service. Please check if n8n is running.',
          <ToastAction 
            altText="Retry" 
            onClick={() => handleRetry()}
          >
            Retry
          </ToastAction>
        );
      } else {
        // Parse error for user-friendly message
        const errorObj = {
          code: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          details: error,
        };

        // Update execution with error status
        updateExecution(initialExecution.id, {
          status: 'failed',
          error: errorObj,
          completedAt: new Date(),
        });

        // Show error toast with retry action
        const errorMessage = getUserFriendlyErrorMessage(errorObj);
        showError(
          'Execution Failed',
          errorMessage,
          <ToastAction 
            altText="Retry" 
            onClick={() => handleRetry()}
          >
            Retry
          </ToastAction>
        );
      }

      console.error('Execution error:', error);
    }
  }, [agentId, addExecution, updateExecution, veo3Parameters, success, showError]);

  const handleRetry = useCallback(() => {
    setShowConnectionError(false);
    if (lastFailedInputRef.current) {
      handleSubmit(lastFailedInputRef.current.prompt);
    }
  }, [handleSubmit]);

  const handleConnectionRetry = useCallback(async (): Promise<boolean> => {
    const webhookClient = webhookClientRef.current;
    const isAvailable = await webhookClient.checkServiceAvailability();
    
    if (isAvailable) {
      setShowConnectionError(false);
      // Retry the last failed execution
      if (lastFailedInputRef.current) {
        handleRetry();
      }
    }
    
    return isAvailable;
  }, [handleRetry]);

  const handleCheckStatus = useCallback(async (): Promise<boolean> => {
    const webhookClient = webhookClientRef.current;
    return await webhookClient.checkServiceAvailability();
  }, []);

  const handleParametersChange = useCallback((parameters: VEO3Parameters) => {
    setVeo3Parameters(parameters);
  }, []);

  // Empty state
  if (messages.length === 0 && !isExecuting) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="text-center space-y-3 sm:space-y-4 max-w-md px-4">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <h3 className="text-base sm:text-lg font-semibold">
                Start a Conversation
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Send a message to begin interacting with this agent. Your conversation
                history will be saved automatically.
              </p>
            </div>
          </div>
        </div>
        <ChatInput
          onSubmit={handleSubmit}
          disabled={isExecuting}
          placeholder="Type your message to get started..."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Settings Panel - Only show for VEO3 agent */}
      {agentId === 'veo3-video-generator' && (
        <div className="border-b bg-card">
          <SettingsPanel onParametersChange={handleParametersChange} />
        </div>
      )}

      {/* Messages area - Responsive padding */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3 sm:space-y-4"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-atomic="false"
      >
        {/* Connection error banner */}
        {showConnectionError && (
          <ConnectionError
            onRetry={handleConnectionRetry}
            onCheckStatus={handleCheckStatus}
            autoRetry={true}
            autoRetryInterval={5000}
            maxRetries={3}
          />
        )}

        {messages.map((message) => {
          // Find the execution for this message to get status
          const execution = executions.find((e) => e.id === message.executionId);
          const executionStatus = execution?.status;
          const executionError = execution?.error;

          return (
            <ChatMessage
              key={message.id}
              message={message}
              executionStatus={executionStatus}
              executionError={executionError}
              onRetry={executionError ? handleRetry : undefined}
            />
          );
        })}

        {/* Processing indicator */}
        {isExecuting && (
          <div className="flex justify-start animate-in slide-in-from-left-5 duration-300" role="status" aria-live="polite">
            <div className="rounded-2xl rounded-tl-sm bg-muted text-foreground px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1" aria-hidden="true">
                  <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" />
                </div>
                <span className="text-sm text-muted-foreground">Processing...</span>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <ChatInput
        onSubmit={handleSubmit}
        disabled={isExecuting}
        placeholder="Type your message..."
      />
    </div>
  );
}

/**
 * Extract content text from execution output
 */
function getOutputContent(execution: Execution): string {
  if (!execution.output) return 'No output';

  const { type, data, metadata } = execution.output;

  switch (type) {
    case 'video':
      return metadata?.description || 'Video generated successfully';
    case 'image':
      return metadata?.description || 'Image generated successfully';
    case 'text':
      return typeof data === 'string' ? data : 'Text output';
    case 'json':
      return JSON.stringify(data, null, 2);
    default:
      return 'Output generated successfully';
  }
}

/**
 * Extract attachments from execution output
 */
function getOutputAttachments(execution: Execution) {
  if (!execution.output) return undefined;

  const { type, data, metadata } = execution.output;

  // For video and image outputs, create attachment
  if ((type === 'video' || type === 'image') && typeof data === 'string') {
    return [
      {
        type,
        url: data,
        name: metadata?.filename || `${type}-${execution.id}`,
        size: metadata?.fileSize,
        metadata,
      },
    ];
  }

  return undefined;
}
