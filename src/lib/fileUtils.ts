import fs from 'fs';
import path from 'path';
import os from 'os';

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
  fileMap.delete(fileId);
}
