// Script to extract OCR text from all pages of the test PDF
require('dotenv').config({ path: './.env.test' });
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Configuration
const testPdfDir = './test-files/extracted_pages';
const ocrApiKey = process.env.OCR_SPACE_API_KEY;
const outputFile = './ocr-results.txt';

// Function to process a single page with OCR
async function processPageWithOCR(imagePath, apiKey) {
  console.log(`Processing ${path.basename(imagePath)} with OCR...`);
  
  try {
    // Create form data for OCR API request
    const formData = new FormData();
    formData.append('apikey', apiKey);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('file', fs.createReadStream(imagePath), path.basename(imagePath));
    
    // Send request to OCR.space API
    const response = await axios.post('https://api.ocr.space/parse/image', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      console.error(`OCR processing failed for ${imagePath}`);
      return null;
    }
  } catch (error) {
    console.error(`Error processing page with OCR: ${error.message}`);
    if (error.response) {
      console.error(`OCR error response status: ${error.response.status}`);
      console.error(`OCR error response data:`, error.response.data);
    }
    return null;
  }
}

// Function to extract text from OCR result
function extractTextFromOCRResult(ocrResult) {
  if (!ocrResult || !ocrResult.ParsedResults || ocrResult.ParsedResults.length === 0) {
    return '';
  }
  
  return ocrResult.ParsedResults.map(result => result.ParsedText).join('\n');
}

// Main function to process all pages
async function processAllPages() {
  try {
    // Get all PDF files in the directory
    const files = fs.readdirSync(testPdfDir)
      .filter(file => file.endsWith('.pdf'))
      .map(file => path.join(testPdfDir, file))
      .sort(); // Sort to ensure pages are in order
    
    console.log(`Found ${files.length} PDF pages to process`);
    
    let allText = '';
    
    // Process each page
    for (let i = 0; i < files.length; i++) {
      const pagePath = files[i];
      console.log(`Processing page ${i + 1}/${files.length}: ${path.basename(pagePath)}`);
      
      const ocrResult = await processPageWithOCR(pagePath, ocrApiKey);
      if (ocrResult) {
        const pageText = extractTextFromOCRResult(ocrResult);
        allText += `\n\n===== PAGE ${i + 1} =====\n${pageText}\n`;
        console.log(`Extracted ${pageText.length} characters from page ${i + 1}`);
      } else {
        allText += `\n\n===== PAGE ${i + 1} ERROR =====\nFailed to process this page\n`;
      }
    }
    
    // Write all text to output file
    fs.writeFileSync(outputFile, allText);
    console.log(`All OCR text saved to ${outputFile}`);
    
    // Print the text to console as well
    console.log('\n\n===== COMPLETE OCR TEXT =====');
    console.log(allText);
  } catch (error) {
    console.error('Error processing pages:', error);
  }
}

// Run the script
processAllPages();
