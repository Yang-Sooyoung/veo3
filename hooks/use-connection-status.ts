'use client';

import { useState, useCallback, useEffect } from 'react';
import { WebhookClient } from '@/lib/api/webhook-client';

interface ConnectionStatusOptions {
  checkInterval?: number;
  enabled?: boolean;
}

export function useConnectionStatus(options: ConnectionStatusOptions = {}) {
  const { checkInterval = 30000, enabled = true } = options;
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const webhookClient = new WebhookClient();
      const baseUrl = process.env.NEXT_PUBLIC_N8N_BASE_URL || 'http://localhost:5678';
      
      // Try to fetch the base URL to check if service is available
      const response = await fetch(baseUrl, {
        method: 'HEAD',
        cache: 'no-store',
      });

      const connected = response.ok || response.status === 404; // 404 is ok, means service is running
      setIsConnected(connected);
      
      if (connected) {
        setLastError(null);
      }
      
      return connected;
    } catch (error) {
      setIsConnected(false);
      setLastError(error instanceof Error ? error : new Error('Connection check failed'));
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const retry = useCallback(async (): Promise<boolean> => {
    return checkConnection();
  }, [checkConnection]);

  // Periodic connection check
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      checkConnection();
    }, checkInterval);

    return () => clearInterval(interval);
  }, [enabled, checkInterval, checkConnection]);

  // Initial check
  useEffect(() => {
    if (enabled) {
      checkConnection();
    }
  }, [enabled, checkConnection]);

  return {
    isConnected,
    isChecking,
    lastError,
    checkConnection,
    retry,
  };
}
