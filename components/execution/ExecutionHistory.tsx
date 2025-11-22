/**
 * ExecutionHistory Component
 * Displays a list of past executions with timestamps and status
 */

'use client';

import React, { useState } from 'react';
import { Trash2, Clock, Video, Image as ImageIcon, FileText, File } from 'lucide-react';
import { Execution } from '@/types';
import { ExecutionStatus } from './ExecutionStatus';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

/**
 * ExecutionHistory component props
 */
interface ExecutionHistoryProps {
  executions: Execution[];
  onClearHistory: () => void;
  onSelectExecution?: (execution: Execution) => void;
  className?: string;
}

/**
 * ExecutionHistory component
 * Renders list of past executions with timestamps, status, and preview
 */
export function ExecutionHistory({
  executions,
  onClearHistory,
  onSelectExecution,
  className,
}: ExecutionHistoryProps) {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);

  // Handle execution click
  const handleExecutionClick = (execution: Execution) => {
    setSelectedExecutionId(execution.id);
    onSelectExecution?.(execution);
  };

  // Handle clear history confirmation
  const handleClearConfirm = () => {
    onClearHistory();
    setShowClearDialog(false);
  };

  // Empty state - Responsive
  if (executions.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-6 sm:p-8 text-center', className)}>
        <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
        <p className="text-xs sm:text-sm text-muted-foreground">No execution history</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
          Your past executions will appear here
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header with clear button - Responsive */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b">
        <h3 className="text-xs sm:text-sm font-semibold truncate">Execution History</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowClearDialog(true)}
          className="h-8 sm:h-9 text-xs touch-manipulation flex-shrink-0"
        >
          <Trash2 className="h-3 w-3 sm:mr-1" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
      </div>

      {/* Execution list with virtual scrolling for performance */}
      <div className="flex-1 overflow-y-auto">
        {executions.length > 20 ? (
          <VirtualizedExecutionList
            executions={executions}
            selectedExecutionId={selectedExecutionId}
            onExecutionClick={handleExecutionClick}
          />
        ) : (
          <div className="divide-y">
            {executions.map((execution) => (
              <ExecutionHistoryItem
                key={execution.id}
                execution={execution}
                isSelected={selectedExecutionId === execution.id}
                onClick={() => handleExecutionClick(execution)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Clear history confirmation dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Execution History</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all execution history? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearConfirm}
            >
              Clear History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * ExecutionHistoryItem component props
 */
interface ExecutionHistoryItemProps {
  execution: Execution;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * ExecutionHistoryItem component
 * Renders a single execution item in the history list
 * Memoized to prevent unnecessary re-renders
 */
const ExecutionHistoryItem = React.memo(function ExecutionHistoryItem({
  execution,
  isSelected,
  onClick,
}: ExecutionHistoryItemProps) {
  // Format timestamp
  const timestamp = format(new Date(execution.createdAt), 'MMM d, h:mm a');

  // Get output type icon
  const outputIcon = getOutputIcon(execution.output?.type);

  // Get preview text
  const previewText = getPreviewText(execution);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-3 sm:p-4 text-left transition-colors hover:bg-accent touch-manipulation',
        'min-h-[72px] sm:min-h-[80px]',
        isSelected && 'bg-accent'
      )}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Output type icon - Responsive sizing */}
        <div className="flex-shrink-0 mt-0.5 sm:mt-1">
          {outputIcon}
        </div>

        {/* Execution details - Responsive */}
        <div className="flex-1 min-w-0">
          {/* Preview text - Responsive */}
          <p className="text-xs sm:text-sm font-medium truncate mb-1">
            {previewText}
          </p>

          {/* Status */}
          <ExecutionStatus
            status={execution.status}
            message={execution.error?.message}
            className="mb-1.5 sm:mb-2"
          />

          {/* Timestamp - Responsive */}
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {timestamp}
          </p>
        </div>
      </div>
    </button>
  );
});

/**
 * VirtualizedExecutionList component
 * Uses simple virtualization for large lists (>20 items)
 */
interface VirtualizedExecutionListProps {
  executions: Execution[];
  selectedExecutionId: string | null;
  onExecutionClick: (execution: Execution) => void;
}

function VirtualizedExecutionList({
  executions,
  selectedExecutionId,
  onExecutionClick,
}: VirtualizedExecutionListProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 30 });
  
  const ITEM_HEIGHT = 100; // Approximate height of each item
  const BUFFER = 10; // Number of items to render outside viewport

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;
      
      const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER);
      const end = Math.min(
        executions.length,
        Math.ceil((scrollTop + viewportHeight) / ITEM_HEIGHT) + BUFFER
      );
      
      setVisibleRange({ start, end });
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation
    
    return () => container.removeEventListener('scroll', handleScroll);
  }, [executions.length]);

  const visibleExecutions = executions.slice(visibleRange.start, visibleRange.end);
  const offsetTop = visibleRange.start * ITEM_HEIGHT;
  const totalHeight = executions.length * ITEM_HEIGHT;

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetTop}px)` }}>
          <div className="divide-y">
            {visibleExecutions.map((execution) => (
              <ExecutionHistoryItem
                key={execution.id}
                execution={execution}
                isSelected={selectedExecutionId === execution.id}
                onClick={() => onExecutionClick(execution)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Get icon for output type
 */
function getOutputIcon(outputType?: string) {
  switch (outputType) {
    case 'video':
      return <Video className="h-5 w-5 text-muted-foreground" />;
    case 'image':
      return <ImageIcon className="h-5 w-5 text-muted-foreground" />;
    case 'text':
      return <FileText className="h-5 w-5 text-muted-foreground" />;
    case 'json':
      return <File className="h-5 w-5 text-muted-foreground" />;
    default:
      return <Clock className="h-5 w-5 text-muted-foreground" />;
  }
}

/**
 * Get preview text for execution
 */
function getPreviewText(execution: Execution): string {
  // Use prompt if available
  if (execution.input.prompt) {
    return execution.input.prompt.length > 50
      ? `${execution.input.prompt.substring(0, 50)}...`
      : execution.input.prompt;
  }

  // Use status-based text
  switch (execution.status) {
    case 'completed':
      return 'Execution completed';
    case 'failed':
      return 'Execution failed';
    case 'processing':
      return 'Processing...';
    case 'pending':
      return 'Pending...';
    default:
      return 'Execution';
  }
}
