import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { getFileMapping, deleteFileMapping } from '@/lib/fileUtils';
import { createProcessingJob } from '@/lib/processingQueue';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting bill processing API...');
    
    // Get the file ID from the request
    const body = await request.json();
    const { fileId } = body;
    
    if (!fileId) {
      console.error('No fileId provided');
      return NextResponse.json(
        { success: false, error: 'No fileId provided' },
        { status: 400 }
      );
    }
    
    // Get the file path from our persistent storage
    const filePath = getFileMapping(fileId);
    
    if (!filePath) {
      console.error('File not found or expired');
      return NextResponse.json(
        { success: false, error: 'File not found or expired. Please upload the file again.' },
        { status: 404 }
      );
    }
    
    // Check if the file still exists
    if (!fs.existsSync(filePath)) {
      console.error('File no longer exists on disk');
      deleteFileMapping(fileId);
      return NextResponse.json(
        { success: false, error: 'File no longer exists. Please upload the file again.' },
        { status: 404 }
      );
    }
    
    // Create a background processing job
    console.log('Creating background processing job...');
    const jobId = createProcessingJob(fileId, filePath);
    
    // Return a response immediately with the job ID
    return NextResponse.json({
      success: true,
      message: 'Processing started',
      jobId,
      status: 'processing'
    });
  } catch (error) {
    console.error('Error processing bill:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
