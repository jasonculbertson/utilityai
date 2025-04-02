import { NextRequest, NextResponse } from 'next/server';
import { getProcessingStatus } from '@/lib/processingQueue';

export async function POST(request: NextRequest) {
  try {
    // Get the job ID from the request
    const body = await request.json();
    const { jobId } = body;
    
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'No jobId provided' },
        { status: 400 }
      );
    }
    
    // Get the job status
    const status = getProcessingStatus(jobId);
    
    if (status.status === 'failed') {
      return NextResponse.json(
        { 
          success: false, 
          status: status.status,
          error: status.error || 'Processing failed' 
        },
        { status: 500 }
      );
    }
    
    if (status.status === 'completed' && status.result) {
      return NextResponse.json({
        success: true,
        status: status.status,
        data: status.result.data,
        completed: true
      });
    }
    
    // Still processing
    return NextResponse.json({
      success: true,
      status: status.status,
      progress: status.progress || 'Processing...',
      completed: false
    });
  } catch (error) {
    console.error('Error checking processing status:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
