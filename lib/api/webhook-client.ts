import { WebhookError, NetworkError } from './errors';

/**
 * Response interface for webhook calls
 */
export interface WebhookResponse {
  executionId?: string;
  status: string;
  data?: any;
}

// Re-export errors for convenience
export { WebhookError, NetworkError };

/**
 * Client for triggering n8n webhooks
 */
export class WebhookClient {
  private baseUrl: string;
  private useProxy: boolean;

  constructor(baseUrl?: string, useProxy: boolean = true) {
    // Use Next.js API proxy by default to avoid CORS issues
    this.useProxy = useProxy;
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_N8N_BASE_URL || 'http://localhost:5678';
  }

  /**
   * Trigger an n8n workflow via webhook
   * @param webhookPath - The webhook path (e.g., 'veo3-video-generate')
   * @param payload - The data to send to the webhook
   * @returns Promise with webhook response
   * @throws WebhookError if the request fails
   * @throws NetworkError if connection fails
   */
  async triggerWorkflow(
    webhookPath: string,
    payload: any
  ): Promise<WebhookResponse> {
    // If webhookPath already starts with /api/, use it directly (already a proxy path)
    // Otherwise, use Next.js API proxy to avoid CORS issues
    const url = webhookPath.startsWith('/api/') 
      ? webhookPath
      : this.useProxy 
        ? `/api/webhook/${webhookPath}`
        : `${this.baseUrl}/webhook/${webhookPath}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseBody = await response.text();
        
        // Check if it's a connection error (service unavailable)
        if (response.status === 503 || response.status === 502) {
          throw new NetworkError('Service temporarily unavailable. Please check if n8n is running.');
        }
        
        // Check if webhook is not found
        if (response.status === 404) {
          throw new WebhookError(
            response.status, 
            'Webhook not found. Make sure your n8n workflow is activated and the webhook path is correct.'
          );
        }
        
        throw new WebhookError(response.status, responseBody);
      }

      return await response.json();
    } catch (error) {
      // Re-throw our custom errors as-is
      if (error instanceof WebhookError || error instanceof NetworkError) {
        throw error;
      }

      // Handle network errors (connection refused, timeout, etc.)
      if (error instanceof TypeError || (error as any).name === 'FetchError') {
        throw new NetworkError(
          'Unable to connect to the service. Please check if n8n is running.',
          error instanceof Error ? error : undefined
        );
      }

      // Handle other errors
      throw new WebhookError(500, `Unexpected error: ${error}`);
    }
  }

  /**
   * Check if the service is available
   * @returns Promise with boolean indicating availability
   */
  async checkServiceAvailability(): Promise<boolean> {
    try {
      // Use proxy endpoint for health check
      const url = this.useProxy ? '/api/health' : this.baseUrl;
      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-store',
      });
      
      // Service is available if we get any response (even 404)
      return response.ok || response.status === 404;
    } catch (error) {
      return false;
    }
  }
}
