import { NextResponse } from 'next/server';

/**
 * Health check endpoint for n8n connectivity
 */
export async function GET() {
  try {
    const n8nBaseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    
    const response = await fetch(n8nBaseUrl, {
      method: 'HEAD',
      cache: 'no-store',
      // Skip SSL verification for self-signed certificates in development
      ...(process.env.NODE_ENV === 'development' && n8nBaseUrl.startsWith('https://localhost') && {
        // @ts-ignore - Node.js specific option
        agent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      })
    });

    return NextResponse.json({
      status: 'ok',
      n8nAvailable: response.ok || response.status === 404,
      n8nStatus: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        n8nAvailable: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

export async function HEAD() {
  return GET();
}
