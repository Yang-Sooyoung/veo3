'use client';

import { useState } from 'react';
import { ExecutionError } from '@/types';
import { AlertCircle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getUserFriendlyErrorMessage } from '@/lib/api/errors';

interface ErrorMessageProps {
  error: ExecutionError;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ error, onRetry, className }: ErrorMessageProps) {
  const [expanded, setExpanded] = useState(false);

  const userFriendlyMessage = getUserFriendlyErrorMessage(error);
  const hasDetails = error.details !== undefined;

  // Get actionable suggestions based on error code
  const getSuggestion = (code: string): string | null => {
    const suggestions: Record<string, string> = {
      EXECUTION_TIMEOUT: 'Try simplifying your request or check if the service is responding.',
      VALIDATION_ERROR: 'Please review your input and ensure all required fields are filled correctly.',
      WEBHOOK_ERROR: 'The service may be temporarily unavailable. Please try again in a few moments.',
      NETWORK_ERROR: 'Check your internet connection and ensure the service is accessible.',
      AGENT_NOT_FOUND: 'The agent configuration may have been removed or renamed.',
      AGENT_UNAVAILABLE: 'The agent is currently under maintenance. Please try again later.',
    };

    return suggestions[code] || null;
  };

  const suggestion = getSuggestion(error.code);

  return (
    <div
      className={cn(
        'rounded-lg border border-destructive/50 bg-destructive/10 p-3 sm:p-4 space-y-2.5 sm:space-y-3',
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Error header - Responsive spacing */}
      <div className="flex items-start gap-2 sm:gap-3">
        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="font-semibold text-destructive text-sm sm:text-base">Error</span>
            <span className="text-[10px] sm:text-xs font-mono text-muted-foreground truncate" aria-label={`Error code ${error.code}`}>
              {error.code}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-foreground break-words">{userFriendlyMessage}</p>
          {suggestion && (
            <p className="text-[10px] sm:text-xs text-muted-foreground italic break-words" role="note">
              {suggestion}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons - Touch-friendly */}
      <div className="flex items-center gap-2 flex-wrap">
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-9 sm:h-8 text-xs touch-manipulation"
            aria-label="Retry failed operation"
          >
            <RefreshCw className="h-3 w-3 mr-1.5" aria-hidden="true" />
            Retry
          </Button>
        )}
        {hasDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-9 sm:h-8 text-xs touch-manipulation"
            aria-expanded={expanded}
            aria-controls="error-details"
            aria-label={expanded ? "Hide error details" : "Show error details"}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1.5" aria-hidden="true" />
                <span className="hidden sm:inline">Hide Details</span>
                <span className="sm:hidden">Hide</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1.5" aria-hidden="true" />
                <span className="hidden sm:inline">Show Details</span>
                <span className="sm:hidden">Details</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Expandable error details - Responsive */}
      {expanded && hasDetails && (
        <div id="error-details" className="pt-2 border-t border-destructive/20" role="region" aria-label="Technical error details">
          <div className="text-xs space-y-2">
            <div>
              <span className="font-semibold text-muted-foreground">
                Technical Details:
              </span>
            </div>
            <pre className="bg-muted/50 p-2 rounded text-[10px] sm:text-xs overflow-x-auto max-w-full" aria-label="Error details JSON">
              {JSON.stringify(error.details, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
