import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function GET(request: NextRequest) {
  try {
    // Get the filename from the query string
    const filename = request.nextUrl.searchParams.get('filename');
    
    if (!filename) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 });
    }
    
    // Sanitize the filename to prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    
    // Full path to the OCR text file
    const filePath = path.join(os.tmpdir(), `${sanitizedFilename}_ocr_text.txt`);
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'OCR text file not found' }, { status: 404 });
    }
    
    // Read the file
    const ocrText = fs.readFileSync(filePath, 'utf8');
    
    // Return the OCR text
    return NextResponse.json({ ocrText }, { status: 200 });
  } catch (error) {
    console.error('Error in debug-ocr endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
