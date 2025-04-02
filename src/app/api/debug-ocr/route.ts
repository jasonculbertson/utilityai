import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function GET(request: NextRequest) {
  try {
    const action = request.nextUrl.searchParams.get('action') || 'list';
    const jobId = request.nextUrl.searchParams.get('jobId');
    
    // List all OCR text files in the tmp directory
    if (action === 'list') {
      const tmpDir = os.tmpdir();
      const files = fs.readdirSync(tmpDir)
        .filter(file => file.endsWith('_ocr_text.txt'));
      
      return NextResponse.json({ files }, { status: 200 });
    }
    
    // Get OCR text for a specific job ID
    if (action === 'view' && jobId) {
      // Get all files in tmp directory
      const tmpDir = os.tmpdir();
      const files = fs.readdirSync(tmpDir)
        .filter(file => file.endsWith('_ocr_text.txt'));
      
      let ocrTextFile = null;
      
      // Try to find a file containing the job ID
      for (const file of files) {
        if (file.includes(jobId)) {
          ocrTextFile = file;
          break;
        }
      }
      
      if (!ocrTextFile) {
        return NextResponse.json({ error: 'OCR text file not found for job ID' }, { status: 404 });
      }
      
      // Read the file
      const filePath = path.join(tmpDir, ocrTextFile);
      const ocrText = fs.readFileSync(filePath, 'utf8');
      
      // Return the OCR text
      return NextResponse.json({ ocrText, filename: ocrTextFile }, { status: 200 });
    }
    
    // Get OCR text for a specific filename
    if (action === 'view' && request.nextUrl.searchParams.get('filename')) {
      const filename = request.nextUrl.searchParams.get('filename')!;
      // Sanitize the filename to prevent directory traversal
      const sanitizedFilename = path.basename(filename);
      
      // Full path to the OCR text file
      const filePath = path.join(os.tmpdir(), sanitizedFilename);
      
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'OCR text file not found' }, { status: 404 });
      }
      
      // Read the file
      const ocrText = fs.readFileSync(filePath, 'utf8');
      
      // Return the OCR text
      return NextResponse.json({ ocrText, filename: sanitizedFilename }, { status: 200 });
    }
    
    return NextResponse.json({ error: 'Invalid action or missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error in debug-ocr endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
