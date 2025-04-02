import fs from 'fs';
import path from 'path';
import os from 'os';
import { processBill } from './billProcessor';

// Type definitions
type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface ProcessingJob {
  id: string;
  filePath: string;
  status: ProcessingStatus;
  result?: any;
  error?: string;
  startTime: number;
  completedTime?: number;
}

// Directory to store job status files
const JOBS_DIR = path.join(os.tmpdir(), 'pge-bill-jobs');

// Ensure the jobs directory exists
if (!fs.existsSync(JOBS_DIR)) {
  fs.mkdirSync(JOBS_DIR, { recursive: true });
}

/**
 * Create a new processing job
 */
export function createProcessingJob(fileId: string, filePath: string): string {
  const jobId = fileId; // Use the fileId as the jobId for simplicity
  
  const job: ProcessingJob = {
    id: jobId,
    filePath,
    status: 'pending',
    startTime: Date.now(),
  };
  
  // Save the job to disk
  saveJob(job);
  
  // Start processing in the background
  startProcessing(jobId);
  
  return jobId;
}

/**
 * Start processing a job in the background
 */
async function startProcessing(jobId: string): Promise<void> {
  // Get the job
  const job = getJob(jobId);
  if (!job) {
    console.error(`Job ${jobId} not found`);
    return;
  }
  
  // Update job status
  job.status = 'processing';
  saveJob(job);
  
  try {
    // Check if the file exists
    if (!fs.existsSync(job.filePath)) {
      throw new Error('File no longer exists on disk');
    }
    
    // Process the bill
    console.log(`Starting bill processing for job ${jobId}...`);
    const result = await processBill(job.filePath);
    console.log(`Bill processing complete for job ${jobId}`);
    
    // Update job with result
    job.status = 'completed';
    job.result = result;
    job.completedTime = Date.now();
    saveJob(job);
    
    // Clean up the file
    try {
      fs.unlinkSync(job.filePath);
      console.log(`Temporary file deleted for job ${jobId}`);
    } catch (error) {
      console.error(`Error deleting temporary file for job ${jobId}:`, error);
    }
  } catch (error) {
    console.error(`Error processing bill for job ${jobId}:`, error);
    
    // Update job with error
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : 'An unknown error occurred';
    job.completedTime = Date.now();
    saveJob(job);
  }
}

/**
 * Get the status of a processing job
 */
export function getProcessingStatus(jobId: string): { 
  status: ProcessingStatus; 
  result?: any; 
  error?: string;
  progress?: string;
} {
  const job = getJob(jobId);
  
  if (!job) {
    return { status: 'failed', error: 'Job not found' };
  }
  
  // Calculate progress message based on time elapsed
  let progress;
  if (job.status === 'processing') {
    const elapsedSeconds = Math.floor((Date.now() - job.startTime) / 1000);
    if (elapsedSeconds < 10) {
      progress = 'Extracting PDF pages...';
    } else if (elapsedSeconds < 30) {
      progress = 'Processing OCR on page 1...';
    } else if (elapsedSeconds < 60) {
      progress = 'Processing OCR on additional pages...';
    } else if (elapsedSeconds < 90) {
      progress = 'Analyzing bill data...';
    } else {
      progress = 'Finalizing results...';
    }
  }
  
  return { 
    status: job.status, 
    result: job.result, 
    error: job.error,
    progress
  };
}

/**
 * Clean up old jobs (older than 1 hour)
 */
export function cleanupOldJobs(): void {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
  try {
    const files = fs.readdirSync(JOBS_DIR);
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const jobPath = path.join(JOBS_DIR, file);
      const stats = fs.statSync(jobPath);
      
      if (stats.mtimeMs < oneHourAgo) {
        fs.unlinkSync(jobPath);
        console.log(`Cleaned up old job file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old jobs:', error);
  }
}

// Helper functions

function getJobPath(jobId: string): string {
  return path.join(JOBS_DIR, `${jobId}.json`);
}

function saveJob(job: ProcessingJob): void {
  const jobPath = getJobPath(job.id);
  fs.writeFileSync(jobPath, JSON.stringify(job, null, 2));
}

function getJob(jobId: string): ProcessingJob | null {
  const jobPath = getJobPath(jobId);
  
  if (!fs.existsSync(jobPath)) {
    return null;
  }
  
  try {
    const jobData = fs.readFileSync(jobPath, 'utf8');
    return JSON.parse(jobData) as ProcessingJob;
  } catch (error) {
    console.error(`Error reading job ${jobId}:`, error);
    return null;
  }
}

// Run cleanup every hour
setInterval(cleanupOldJobs, 60 * 60 * 1000);
