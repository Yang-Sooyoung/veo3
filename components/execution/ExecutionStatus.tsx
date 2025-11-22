/**
 * ExecutionStatus Component
 * Displays the current status of an execution with visual indicators
 */

import React from 'react';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { ExecutionStatus as ExecutionStatusType } from '@/types';
import { cn } from '@/lib/utils';

/**
 * ExecutionStatus component props
 */
interface ExecutionStatusProps {
  status: ExecutionStatusType;
  message?: string;
  progress?: number;
  className?: string;
}

/**
 * ExecutionStatus component
 * Displays status indicator with icon, text, and optional progress bar
 */
export function ExecutionStatus({
  status,
  message,
  progress,
  className,
}: ExecutionStatusProps) {
  // Get status configuration
  const statusConfig = getStatusConfig(status);

  return (
    <div className={cn('flex items-center gap-1.5 sm:gap-2', className)} role="status" aria-live="polite" aria-atomic="true">
      {/* Status Icon - Responsive sizing */}
      <div className={cn('flex items-center justify-center flex-shrink-0', statusConfig.iconColor)} aria-hidden="true">
        {statusConfig.icon}
      </div>

      {/* Status Text and Message - Responsive */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className={cn('text-xs sm:text-sm font-medium whitespace-nowrap', statusConfig.textColor)}>
            {statusConfig.label}
          </span>
          {message && (
            <span className="text-xs sm:text-sm text-muted-foreground truncate">
              {message}
            </span>
          )}
        </div>

        {/* Progress Bar for long-running executions - Touch-friendly */}
        {(status === 'processing' || status === 'pending') && progress !== undefined && (
          <div className="mt-1 w-full bg-secondary rounded-full h-1.5 sm:h-2 overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Execution progress">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Get status configuration (icon, colors, label)
 */
function getStatusConfig(status: ExecutionStatusType) {
  switch (status) {
    case 'pending':
      return {
        icon: <Clock className="h-4 w-4 animate-pulse" />,
        iconColor: 'text-yellow-500',
        textColor: 'text-yellow-500',
        label: 'Pending',
      };
    case 'processing':
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        iconColor: 'text-blue-500',
        textColor: 'text-blue-500',
        label: 'Processing',
      };
    case 'completed':
      return {
        icon: <CheckCircle2 className="h-4 w-4" />,
        iconColor: 'text-green-500',
        textColor: 'text-green-500',
        label: 'Completed',
      };
    case 'failed':
      return {
        icon: <XCircle className="h-4 w-4" />,
        iconColor: 'text-red-500',
        textColor: 'text-red-500',
        label: 'Failed',
      };
    default:
      return {
        icon: <Clock className="h-4 w-4" />,
        iconColor: 'text-muted-foreground',
        textColor: 'text-muted-foreground',
        label: 'Unknown',
      };
  }
}
