// Script to directly use OCR.space API to extract text from bills
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Function to call OCR.space API directly
async function getOcrTextFromPdf(pdfPath, pageNumber = 1) {
  try {
    console.log(`Processing file: ${pdfPath} (Page ${pageNumber})`);
    
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
    // Specify page number to process
    formData.append('PageRange', pageNumber.toString());
    
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
    
    // Extract text from page 3 of March bill
    console.log('\n===== MARCH 2025 BILL - PAGE 3 OCR =====');
    const marchPage3Text = await getOcrTextFromPdf(marchBillPath, 3);
    if (marchPage3Text) {
      console.log('\nOCR Text from Page 3:');
      console.log(marchPage3Text);
      
      // Highlight rate plan information if found
      const rateRegex = /Rate\s+Schedule:\s*([A-Za-z0-9-]+)\s*([^\n]+)?/i;
      const rateMatch = marchPage3Text.match(rateRegex);
      if (rateMatch) {
        console.log('\nRate Plan Found:');
        console.log(`Rate Schedule: ${rateMatch[1]}${rateMatch[2] ? ' ' + rateMatch[2] : ''}`);
      } else {
        console.log('\nNo Rate Plan Found in OCR text');
      }
    } else {
      console.log('Failed to get OCR output for March 2025 bill');
    }
    
    // Extract text from page 3 of December bill
    console.log('\n===== DECEMBER 2024 BILL - PAGE 3 OCR =====');
    const decemberPage3Text = await getOcrTextFromPdf(decemberBillPath, 3);
    if (decemberPage3Text) {
      console.log('\nOCR Text from Page 3:');
      console.log(decemberPage3Text);
      
      // Highlight rate plan information if found
      const rateRegex = /Rate\s+Schedule:\s*([A-Za-z0-9-]+)\s*([^\n]+)?/i;
      const rateMatch = decemberPage3Text.match(rateRegex);
      if (rateMatch) {
        console.log('\nRate Plan Found:');
        console.log(`Rate Schedule: ${rateMatch[1]}${rateMatch[2] ? ' ' + rateMatch[2] : ''}`);
      } else {
        console.log('\nNo Rate Plan Found in OCR text');
      }
    } else {
      console.log('Failed to get OCR output for December 2024 bill');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Load environment variables if .env file exists
try {
  require('dotenv').config();
} catch (error) {
  console.warn('No .env file found, using default API key');
}

// Run the main function
main();
