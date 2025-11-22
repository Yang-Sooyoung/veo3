import { NextRequest, NextResponse } from 'next/server';

/**
 * Get n8n execution result by execution ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { executionId: string } }
) {
  try {
    const n8nBaseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    const executionId = params.executionId;
    
    // Get execution result from n8n API
    const url = `${n8nBaseUrl}/api/v1/executions/${executionId}`;
    
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
        { error: 'Failed to get execution result', status: response.status },
        { status: response.status }
      );
    }

    const executionData = await response.json();
    
    // Extract video data from the last node (Convert to File)
    const nodes = executionData.data?.resultData?.runData;
    if (nodes) {
      // Look for Convert to File node output
      const convertToFileNode = nodes['Convert to File'];
      if (convertToFileNode && convertToFileNode[0]?.data?.main?.[0]) {
        const nodeData = convertToFileNode[0].data.main[0];
        
        // Check if it has binary data
        if (nodeData.binary) {
          return NextResponse.json({
            status: 'completed',
            type: 'video',
            data: nodeData.binary,
            metadata: {
              description: 'Video generated successfully',
              executionId: executionId,
              nodeData: nodeData.json || {}
            }
          });
        }
        
        // Check if it has JSON data with video URL
        if (nodeData.json) {
          return NextResponse.json({
            status: 'completed',
            type: 'video',
            data: nodeData.json,
            metadata: {
              description: 'Video generated successfully',
              executionId: executionId
            }
          });
        }
      }
    }

    // Return raw execution data if no specific video data found
    return NextResponse.json({
      status: 'completed',
      executionData: executionData,
      message: 'Execution completed but no video data found'
    });

  } catch (error) {
    console.error('Failed to get n8n execution result:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get execution result',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}