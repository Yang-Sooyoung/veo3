import { NextRequest, NextResponse } from 'next/server';

/**
 * Get recent n8n executions
 */
export async function GET(request: NextRequest) {
  try {
    const n8nBaseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    
    // Get recent executions from n8n API
    const url = `${n8nBaseUrl}/api/v1/executions?limit=10`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Skip SSL verification for self-signed certificates in development
      ...(process.env.NODE_ENV === 'development' && url.startsWith('https://localhost') && {
        // @ts-ignore - Node.js specific option
        agent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      })
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to get executions', status: response.status },
        { status: response.status }
      );
    }

    const executions = await response.json();
    
    // Find the most recent execution for veo3-video-generate workflow
    const recentExecution = executions.data?.find((exec: any) => 
      exec.workflowData?.name?.includes('veo3') || 
      exec.workflowData?.name?.includes('동영상')
    );

    if (recentExecution) {
      return NextResponse.json({
        executionId: recentExecution.id,
        status: recentExecution.finished ? 'completed' : 'processing',
        startedAt: recentExecution.startedAt,
        stoppedAt: recentExecution.stoppedAt,
        workflowName: recentExecution.workflowData?.name
      });
    }

    return NextResponse.json({
      message: 'No recent executions found',
      executions: executions.data?.slice(0, 5) // Return first 5 for debugging
    });

  } catch (error) {
    console.error('Failed to get n8n executions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get executions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}