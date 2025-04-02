import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

// Create a map to store file paths with unique IDs (for in-memory reference)
export const fileMap = new Map<string, string>();

// Define the temporary directory for storing the uploaded files
export const tempDir = path.join(os.tmpdir(), 'pge-bill-uploads');

// Ensure the temp directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Create a directory for storing file mappings
const mappingsDir = path.join(tempDir, 'mappings');
if (!fs.existsSync(mappingsDir)) {
  fs.mkdirSync(mappingsDir, { recursive: true });
}

// Function to save a file mapping to disk
export function saveFileMapping(fileId: string, filePath: string): void {
  const mappingPath = path.join(mappingsDir, `${fileId}.json`);
  fs.writeFileSync(mappingPath, JSON.stringify({ filePath, timestamp: Date.now() }));
  // Also keep in memory for quick access
  fileMap.set(fileId, filePath);
}

// Function to get a file mapping from disk
export function getFileMapping(fileId: string): string | null {
  const mappingPath = path.join(mappingsDir, `${fileId}.json`);
  
  if (!fs.existsSync(mappingPath)) {
    return null;
  }
  
  try {
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    // Check if the mapping is expired (older than 10 minutes)
    if (Date.now() - mapping.timestamp > 10 * 60 * 1000) {
      // Delete the mapping file
      fs.unlinkSync(mappingPath);
      return null;
    }
    return mapping.filePath;
  } catch (error) {
    console.error('Error reading file mapping:', error);
    return null;
  }
}

// Function to delete a file mapping
export function deleteFileMapping(fileId: string): void {
  const mappingPath = path.join(mappingsDir, `${fileId}.json`);
  if (fs.existsSync(mappingPath)) {
    fs.unlinkSync(mappingPath);
  }
  // Also remove from memory
  fileMap.delete(fileId);
}

export async function POST(request: NextRequest) {
  let filePath = '';
  
  try {
    console.log('Starting file upload process...');

    // Get the form data from the request
    console.log('Extracting form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('No file uploaded');
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check if the file is a PDF
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      console.error('Invalid file type uploaded:', file.name);
      return NextResponse.json(
        { success: false, error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Save the file to the temporary directory
    console.log('Saving uploaded file to temporary directory...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    filePath = path.join(tempDir, `${Date.now()}-${file.name}`);
    fs.writeFileSync(filePath, buffer);
    console.log('File saved successfully:', filePath);

    // Generate a unique ID for this file
    const fileId = crypto.randomUUID();
    
    // Store the file path in our persistent storage
    saveFileMapping(fileId, filePath);
    
    // Set a timeout to automatically clean up the file after 10 minutes
    setTimeout(() => {
      try {
        const pathToDelete = getFileMapping(fileId);
        if (pathToDelete && fs.existsSync(pathToDelete)) {
          fs.unlinkSync(pathToDelete);
          console.log(`Automatically cleaned up file: ${pathToDelete}`);
        }
        deleteFileMapping(fileId);
      } catch (error) {
        console.error('Error in automatic file cleanup:', error);
      }
    }, 10 * 60 * 1000); // 10 minutes

    // Return the file ID for the client to use in the next step
    return NextResponse.json({
      success: true,
      fileId: fileId,
      message: 'File uploaded successfully. Use the fileId to process the bill.'
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    
    // Clean up the temporary file if it exists
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error('Error cleaning up after processing failure:', cleanupError);
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// Increase the request body size limit for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
