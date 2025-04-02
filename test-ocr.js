// Simple test script to verify OCR functionality
require('dotenv').config({ path: './.env.test' });
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Test configuration
const testImagePath = './test-files/extracted_pages/page_1.pdf'; // Using existing test PDF page
const ocrApiKey = process.env.OCR_SPACE_API_KEY;

// Function to test OCR with a single image
async function testOcrWithImage(imagePath) {
  console.log('\n===== TESTING OCR PROCESSING =====');
  console.log(`Using OCR API key starting with: ${ocrApiKey?.substring(0, 5)}...`);
  console.log(`Testing with image: ${imagePath}`);
  
  try {
    // Check if the image file exists
    if (!fs.existsSync(imagePath)) {
      console.error(`Image file not found: ${imagePath}`);
      return { success: false, error: 'File not found' };
    }
    
    // Create form data for OCR API request
    const formData = new FormData();
    formData.append('apikey', ocrApiKey);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('file', fs.createReadStream(imagePath), path.basename(imagePath));
    
    console.log('Sending request to OCR.space API...');
    
    // Send request to OCR.space API
    const response = await axios.post('https://api.ocr.space/parse/image', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    
    console.log(`OCR API response status: ${response.status}`);
    
    if (response.status === 200 && response.data) {
      console.log('OCR processing successful');
      console.log('OCR result:', JSON.stringify(response.data, null, 2));
      
      // Extract text from OCR result
      let extractedText = '';
      if (response.data.ParsedResults && response.data.ParsedResults.length > 0) {
        extractedText = response.data.ParsedResults.map(result => result.ParsedText).join('\n');
        console.log(`Extracted ${extractedText.length} characters of text`);
        console.log('Text preview:', extractedText.substring(0, 200) + '...');
      } else {
        console.warn('No parsed results found in OCR response');
      }
      
      return { success: true, data: response.data, extractedText };
    } else {
      console.error('OCR processing failed');
      console.error('Response:', response.data);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.error('Error in OCR processing:', error);
    if (error.response) {
      console.error(`OCR error response status: ${error.response.status}`);
      console.error(`OCR error response data:`, error.response.data);
    }
    return { success: false, error };
  }
}

// Run the OCR test
async function runOcrTest() {
  try {
    console.log('Starting OCR test...');
    const result = await testOcrWithImage(testImagePath);
    
    if (result.success) {
      console.log('\n===== OCR TEST COMPLETED SUCCESSFULLY =====');
    } else {
      console.error('\n===== OCR TEST FAILED =====');
    }
  } catch (error) {
    console.error('Error running OCR test:', error);
  }
}

// Run the test
runOcrTest();
