// Improved test script to verify OCR functionality with error handling
require('dotenv').config({ path: './.env.test' });
const fs = require('fs');
const path = require('path');
// Import using dynamic import for ESM modules
async function importPdfProcessor() {
  // For CommonJS compatibility
  const pdfProcessor = await import('./src/lib/pdfProcessor.js');
  return pdfProcessor;
}

// Test configuration
const testPdfPath = './test-files/2035custbill12112024.pdf'; // Path to a test PDF file
const ocrApiKey = process.env.OCR_SPACE_API_KEY;

// Function to test the improved OCR processing
async function testImprovedOcrProcessing() {
  console.log('\n===== TESTING IMPROVED OCR PROCESSING =====');
  console.log(`Using OCR API key starting with: ${ocrApiKey?.substring(0, 5)}...`);
  console.log(`Testing with PDF: ${testPdfPath}`);
  
  try {
    // Check if the test PDF file exists
    if (!fs.existsSync(testPdfPath)) {
      console.error(`PDF file not found: ${testPdfPath}`);
      return;
    }
    
    console.log('Starting OCR processing with improved error handling...');
    
    // Import the PDF processor module
    const pdfProcessor = await importPdfProcessor();
    
    // Process the PDF with OCR using our improved function
    const extractedText = await pdfProcessor.processPdfWithOCR(testPdfPath, ocrApiKey);
    
    console.log('\n===== OCR PROCESSING RESULTS =====');
    console.log(`Extracted ${extractedText.length} characters of text`);
    console.log('Text preview:', extractedText.substring(0, 500) + '...');
    console.log('\n===== OCR TEST COMPLETED =====');
  } catch (error) {
    console.error('\n===== OCR TEST FAILED =====');
    console.error(`Error: ${error.message}`);
  }
}

// Run the test
testImprovedOcrProcessing();
