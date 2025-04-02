// Script to get actual OCR output from bill PDFs
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Function to call OCR.space API directly
async function getOcrText(pdfPath) {
  try {
    console.log(`Processing file: ${pdfPath}`);
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      console.error(`File not found: ${pdfPath}`);
      return null;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(pdfPath));
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'false');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');
    
    // Get API key from env or use default
    const apiKey = process.env.OCR_SPACE_API_KEY || 'K86742198888957';
    
    // Call OCR.space API
    const response = await axios({
      method: 'post',
      url: 'https://api.ocr.space/Parse/Image',
      headers: {
        'apikey': apiKey,
        ...formData.getHeaders()
      },
      data: formData,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    // Extract OCR text
    if (response.data && response.data.ParsedResults && response.data.ParsedResults.length > 0) {
      return response.data.ParsedResults[0].ParsedText;
    } else {
      console.error('No OCR results returned');
      return null;
    }
  } catch (error) {
    console.error('Error calling OCR API:', error.message);
    return null;
  }
}

async function main() {
  try {
    // Define paths to bill PDFs
    const marchBillPath = path.join(__dirname, '..', 'test-files', '2035custbill03122025.pdf');
    const decemberBillPath = path.join(__dirname, '..', 'test-files', '2035custbill12112024.pdf');
    
    // Process March 2025 bill
    console.log('\n===== MARCH 2025 BILL OCR OUTPUT =====');
    const marchOcrText = await getOcrText(marchBillPath);
    if (marchOcrText) {
      console.log('\nRaw OCR Text:');
      console.log(marchOcrText);
    } else {
      console.log('Failed to get OCR output for March 2025 bill');
    }
    
    // Process December 2024 bill
    console.log('\n===== DECEMBER 2024 BILL OCR OUTPUT =====');
    const decemberOcrText = await getOcrText(decemberBillPath);
    if (decemberOcrText) {
      console.log('\nRaw OCR Text:');
      console.log(decemberOcrText);
    } else {
      console.log('Failed to get OCR output for December 2024 bill');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
main();
