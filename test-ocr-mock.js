// Mock test script to verify improved error handling
require('dotenv').config({ path: './.env.test' });
const fs = require('fs');
const path = require('path');

// Mock the axios module to simulate API failures
jest.mock('axios', () => ({
  post: jest.fn()
    // First call fails with 500 error
    .mockRejectedValueOnce({
      response: { status: 500, data: { error: 'Server error' } }
    })
    // Second call succeeds for page 1
    .mockResolvedValueOnce({
      status: 200,
      data: {
        ParsedResults: [{ ParsedText: 'Successfully processed page 1' }]
      }
    })
    // Third call fails with 403 error
    .mockRejectedValueOnce({
      response: { status: 403, data: { error: 'Rate limit exceeded' } }
    })
    // Fourth call succeeds for page 3
    .mockResolvedValueOnce({
      status: 200,
      data: {
        ParsedResults: [{ ParsedText: 'Successfully processed page 3' }]
      }
    })
}));

// Import the module to test
const { processPdfWithOCR } = require('./src/lib/pdfProcessor');

// Mock the file system operations
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(true),
  readdirSync: jest.fn().mockReturnValue(['page_1.pdf', 'page_2.pdf', 'page_3.pdf']),
  unlinkSync: jest.fn(),
  rmdirSync: jest.fn()
}));

// Mock the PDF extraction function
jest.mock('./src/lib/pdfProcessor', () => ({
  ...jest.requireActual('./src/lib/pdfProcessor'),
  extractPdfPages: jest.fn().mockResolvedValue([
    '/tmp/page_1.pdf',
    '/tmp/page_2.pdf',
    '/tmp/page_3.pdf'
  ])
}));

// Test function
async function testErrorHandling() {
  console.log('\n===== TESTING IMPROVED ERROR HANDLING =====');
  
  try {
    // Process a PDF with our improved error handling
    const result = await processPdfWithOCR('/test/sample.pdf', 'test-api-key');
    
    console.log('\n===== TEST RESULTS =====');
    console.log('OCR processing completed with partial success');
    console.log('Result:', result);
    
    // Verify that the result contains both successful and failed pages
    if (result.includes('Successfully processed page 1') && 
        result.includes('OCR PROCESSING FAILED') && 
        result.includes('Successfully processed page 3')) {
      console.log('\n✅ TEST PASSED: Error handling works correctly!');
    } else {
      console.log('\n❌ TEST FAILED: Error handling did not work as expected');
    }
  } catch (error) {
    console.error('\n❌ TEST FAILED: Function threw an unexpected error');
    console.error(`Error: ${error.message}`);
  }
}

// Run the test
testErrorHandling();
