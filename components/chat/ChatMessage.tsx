'use client';

import { ChatMessage as ChatMessageType, MessageAttachment, ExecutionError } from '@/types';
import { MessageBubble } from './MessageBubble';
import { ErrorMessage } from './ErrorMessage';
import { Button } from '@/components/ui/button';
import { Copy, Check, Video, Image as ImageIcon, File, Download } from 'lucide-react';
import { useState, memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessageType;
  executionStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  executionError?: ExecutionError;
  onRetry?: () => void;
}

export const ChatMessage = memo(function ChatMessage({ message, executionStatus, executionError, onRetry }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  }, [message.content]);

  const formatTimestamp = useCallback((date: Date) => {
    return format(new Date(date), 'HH:mm');
  }, []);

  // Show error message for failed executions
  if (message.type === 'system' && executionError) {
    return (
      <div className="flex justify-center animate-in slide-in-from-bottom-5 duration-300">
        <ErrorMessage error={executionError} onRetry={onRetry} className="max-w-2xl" />
      </div>
    );
  }

  return (
    <div className="group relative">
      <MessageBubble type={message.type} content={message.content}>
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((attachment, index) => (
              <AttachmentPreview key={index} attachment={attachment} />
            ))}
          </div>
        )}

        {/* Metadata footer */}
        <div className="flex items-center gap-2 mt-1.5 px-1">
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </span>

          {/* Execution status indicator */}
          {executionStatus && message.type === 'user' && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span
                className={cn(
                  'text-xs',
                  executionStatus === 'completed' && 'text-green-500',
                  executionStatus === 'failed' && 'text-destructive',
                  (executionStatus === 'pending' || executionStatus === 'processing') &&
                    'text-yellow-500'
                )}
              >
                {executionStatus === 'pending' && 'Pending'}
                {executionStatus === 'processing' && 'Processing'}
                {executionStatus === 'completed' && 'Completed'}
                {executionStatus === 'failed' && 'Failed'}
              </span>
            </>
          )}

          {/* Copy button */}
          {message.type !== 'system' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-6 w-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity ml-auto"
              aria-label={copied ? "Message copied" : "Copy message to clipboard"}
            >
              {copied ? (
                <Check className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Copy className="h-3 w-3" aria-hidden="true" />
              )}
            </Button>
          )}
        </div>
      </MessageBubble>
    </div>
  );
});

interface AttachmentPreviewProps {
  attachment: MessageAttachment;
}

const AttachmentPreview = memo(function AttachmentPreview({ attachment }: AttachmentPreviewProps) {
  const getIcon = () => {
    switch (attachment.type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'file':
        return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
  };

  // Video preview - Responsive sizing
  if (attachment.type === 'video') {
    return (
      <div className="rounded-lg overflow-hidden bg-black">
        <video
          src={attachment.url}
          controls
          className="w-full max-h-[250px] sm:max-h-[350px] md:max-h-[400px]"
          preload="metadata"
          playsInline
          aria-label={`Video: ${attachment.name}`}
        >
          Your browser does not support the video tag.
        </video>
        <div className="flex items-center justify-between gap-2 p-2 bg-muted/50">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground min-w-0">
            {getIcon()}
            <span className="truncate max-w-[120px] sm:max-w-[200px]">
              {attachment.name}
            </span>
            {attachment.size && (
              <span className="hidden sm:inline">• {formatFileSize(attachment.size)}</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-7 sm:h-8 flex-shrink-0"
          >
            <a href={attachment.url} download={attachment.name} aria-label={`Download video ${attachment.name}`}>
              <Download className="h-3 w-3 sm:mr-1" aria-hidden="true" />
              <span className="hidden sm:inline">Download</span>
              <span className="sr-only sm:hidden">Download</span>
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // Image preview - Responsive sizing with Next.js Image optimization
  if (attachment.type === 'image') {
    return (
      <div className="rounded-lg overflow-hidden">
        <img
          src={attachment.url}
          alt={`Generated image: ${attachment.name}`}
          className="w-full max-h-[250px] sm:max-h-[350px] md:max-h-[400px] object-contain bg-black"
          loading="lazy"
        />
        <div className="flex items-center justify-between gap-2 p-2 bg-muted/50">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground min-w-0">
            {getIcon()}
            <span className="truncate max-w-[120px] sm:max-w-[200px]">
              {attachment.name}
            </span>
            {attachment.size && (
              <span className="hidden sm:inline">• {formatFileSize(attachment.size)}</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-7 sm:h-8 flex-shrink-0"
          >
            <a href={attachment.url} download={attachment.name} aria-label={`Download image ${attachment.name}`}>
              <Download className="h-3 w-3 sm:mr-1" aria-hidden="true" />
              <span className="hidden sm:inline">Download</span>
              <span className="sr-only sm:hidden">Download</span>
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // Generic file attachment - Touch-friendly
  return (
    <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 text-sm min-w-0">
        {getIcon()}
        <div className="flex flex-col min-w-0">
          <span className="truncate max-w-[150px] sm:max-w-[200px]">
            {attachment.name}
          </span>
          {attachment.size && (
            <span className="text-xs text-muted-foreground">
              {formatFileSize(attachment.size)}
            </span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
      >
        <a href={attachment.url} download={attachment.name} aria-label={`Download file ${attachment.name}`}>
          <Download className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Download</span>
        </a>
      </Button>
    </div>
  );
});
