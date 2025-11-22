'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle2, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConnectionErrorProps {
  onRetry: () => Promise<boolean>;
  onCheckStatus: () => Promise<boolean>;
  autoRetry?: boolean;
  autoRetryInterval?: number;
  maxRetries?: number;
}

export function ConnectionError({
  onRetry,
  onCheckStatus,
  autoRetry = true,
  autoRetryInterval = 5000,
  maxRetries = 3,
}: ConnectionErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [nextRetryIn, setNextRetryIn] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Auto-retry logic
  useEffect(() => {
    if (!autoRetry || retryCount >= maxRetries || isConnected) {
      return;
    }

    const handleAutoRetry = async () => {
      setIsRetrying(true);
      try {
        const success = await onRetry();
        if (success) {
          setIsConnected(true);
          setRetryCount(0);
        } else {
          setRetryCount((prev) => prev + 1);
        }
      } catch (error) {
        setRetryCount((prev) => prev + 1);
      } finally {
        setIsRetrying(false);
      }
    };

    const timer = setTimeout(() => {
      handleAutoRetry();
    }, autoRetryInterval);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setNextRetryIn((prev) => {
        if (prev === null || prev <= 0) return null;
        return prev - 1;
      });
    }, 1000);

    setNextRetryIn(Math.floor(autoRetryInterval / 1000));

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [autoRetry, autoRetryInterval, maxRetries, retryCount, isConnected, onRetry]);

  const handleAutoRetry = async () => {
    setIsRetrying(true);
    try {
      const success = await onRetry();
      if (success) {
        setIsConnected(true);
        setRetryCount(0);
      } else {
        setRetryCount((prev) => prev + 1);
      }
    } catch (error) {
      setRetryCount((prev) => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleManualRetry = async () => {
    setIsRetrying(true);
    setRetryCount(0);
    setNextRetryIn(null);
    try {
      const success = await onRetry();
      if (success) {
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Manual retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const success = await onCheckStatus();
      if (success) {
        setIsConnected(true);
        setRetryCount(0);
      }
    } catch (error) {
      console.error('Status check failed:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // If connected, show success message briefly
  if (isConnected) {
    return (
      <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
              Connection Restored
            </p>
            <p className="text-xs text-muted-foreground">
              Successfully reconnected to the service.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-orange-500/50 bg-orange-500/10 p-3 sm:p-4 space-y-2.5 sm:space-y-3">
      {/* Error header - Responsive */}
      <div className="flex items-start gap-2 sm:gap-3">
        <WifiOff className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="font-semibold text-orange-600 dark:text-orange-400 text-sm sm:text-base">
              Connection Error
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">
              SERVICE_UNAVAILABLE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-foreground break-words">
            Unable to connect to the n8n service. The service may be temporarily unavailable.
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground italic break-words">
            Please check if the service is running and accessible.
          </p>
        </div>
      </div>

      {/* Retry status - Responsive */}
      {autoRetry && retryCount < maxRetries && (
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span>
            Retry attempt {retryCount + 1} of {maxRetries}
            {nextRetryIn !== null && nextRetryIn > 0 && (
              <> in {nextRetryIn}s</>
            )}
          </span>
        </div>
      )}

      {retryCount >= maxRetries && (
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-orange-600 dark:text-orange-400">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span className="break-words">Maximum retry attempts reached. Please try manually.</span>
        </div>
      )}

      {/* Action buttons - Touch-friendly */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualRetry}
          disabled={isRetrying}
          className="h-9 sm:h-8 text-xs touch-manipulation"
        >
          <RefreshCw
            className={cn('h-3 w-3 mr-1.5', isRetrying && 'animate-spin')}
          />
          {isRetrying ? 'Retrying...' : 'Retry Now'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCheckStatus}
          disabled={isCheckingStatus}
          className="h-9 sm:h-8 text-xs touch-manipulation"
        >
          <CheckCircle2
            className={cn('h-3 w-3 mr-1.5', isCheckingStatus && 'animate-spin')}
          />
          {isCheckingStatus ? 'Checking...' : 'Check Status'}
        </Button>
      </div>
    </div>
  );
}
