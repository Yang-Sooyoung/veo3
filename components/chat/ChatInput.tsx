'use client';

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent, memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export const ChatInput = memo(function ChatInput({
  onSubmit,
  disabled = false,
  placeholder = 'Type your message...',
  maxLength = 2000,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set height based on scrollHeight, with min and max constraints
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), 200);
    textarea.style.height = `${newHeight}px`;
  }, [value]);

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setValue(newValue);
    }
  }, [maxLength]);

  const handleSubmit = useCallback(() => {
    const trimmedValue = value.trim();
    if (trimmedValue && !disabled) {
      onSubmit(trimmedValue);
      setValue('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [value, disabled, onSubmit]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  }, [isComposing, handleSubmit]);

  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.9;
  const isOverLimit = characterCount > maxLength;

  return (
    <div className={cn(
      "border-t border-border bg-card",
      "p-3 sm:p-4"
    )}>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} aria-label="Send message form">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <label htmlFor="message-input" className="sr-only">
              Type your message
            </label>
            <textarea
              id="message-input"
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={cn(
                'w-full resize-none rounded-md border border-input bg-background',
                'px-3 py-2.5 sm:py-2',
                'text-sm sm:text-base shadow-sm transition-colors',
                'placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                // Touch-friendly minimum height
                'min-h-[48px] sm:min-h-[44px] max-h-[200px]',
                // Better touch target on mobile
                'touch-manipulation'
              )}
              aria-label="Message input"
              aria-describedby={isNearLimit || isOverLimit ? "char-count" : "input-help"}
              aria-invalid={isOverLimit}
              maxLength={maxLength}
            />
          
            {/* Character counter */}
            {(isNearLimit || isOverLimit) && (
              <div
                id="char-count"
                className={cn(
                  'absolute bottom-2 right-2 text-xs pointer-events-none',
                  isOverLimit ? 'text-destructive' : 'text-muted-foreground'
                )}
                role="status"
                aria-live="polite"
              >
                {characterCount}/{maxLength}
              </div>
            )}
          </div>

          {/* Touch-friendly send button */}
          <Button
            type="submit"
            disabled={disabled || !value.trim() || isOverLimit}
            size="icon"
            className={cn(
              "shrink-0",
              "h-[48px] w-[48px] sm:h-[44px] sm:w-[44px]",
              "touch-manipulation"
            )}
            aria-label={disabled ? "Sending message..." : "Send message"}
          >
            {disabled ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
        </div>

        {/* Helper text - Hidden on small mobile screens */}
        <div id="input-help" className="mt-2 text-xs text-muted-foreground hidden sm:block">
          Press <kbd className="px-1 py-0.5 rounded bg-muted">Enter</kbd> to send,{' '}
          <kbd className="px-1 py-0.5 rounded bg-muted">Shift + Enter</kbd> for new line
        </div>
      </form>
    </div>
  );
});
