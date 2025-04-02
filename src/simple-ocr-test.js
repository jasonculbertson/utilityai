// Simple script to test OCR.space API with a single PDF file
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Function to call OCR.space API directly
async function getOcrTextFromPdf(pdfPath) {
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
    // Don't specify page range to get all pages
    
    // Get API key from env or use default
    const apiKey = process.env.OCR_SPACE_API_KEY || 'K86742198888957';
    
    console.log('Sending request to OCR.space API...');
    
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
    
    console.log('Response received from OCR.space API');
    
    // Save full response to a file for debugging
    fs.writeFileSync('ocr-response.json', JSON.stringify(response.data, null, 2));
    console.log('Full response saved to ocr-response.json');
    
    // Extract OCR text
    if (response.data && response.data.ParsedResults && response.data.ParsedResults.length > 0) {
      // Save all the parsed text to a file
      const allText = response.data.ParsedResults.map(result => result.ParsedText).join('\n\n=== NEW PAGE ===\n\n');
      fs.writeFileSync('ocr-text.txt', allText);
      console.log('OCR text saved to ocr-text.txt');
      
      return allText;
    } else {
      console.error('No OCR results returned');
      if (response.data) {
        console.error('API Response:', JSON.stringify(response.data));
      }
      return null;
    }
  } catch (error) {
    console.error('Error calling OCR API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data));
    }
    return null;
  }
}

async function main() {
  try {
    // Define path to one bill PDF
    const billPath = path.join(__dirname, '..', 'test-files', '2035custbill12112024.pdf');
    
    console.log('\n===== TESTING OCR.SPACE API WITH BILL PDF =====');
    const ocrText = await getOcrTextFromPdf(billPath);
    
    if (ocrText) {
      console.log('\nSuccessfully extracted text from PDF');
      
      // Look for rate plan information
      const rateRegex = /Rate\s+Schedule:\s*([A-Za-z0-9-]+)\s*([^\n]+)?/i;
      const rateMatches = [...ocrText.matchAll(new RegExp(rateRegex, 'gi'))];
      
      if (rateMatches.length > 0) {
        console.log('\nRate Plans Found:');
        rateMatches.forEach((match, index) => {
          console.log(`${index + 1}. Rate Schedule: ${match[1]}${match[2] ? ' ' + match[2] : ''}`);
        });
      } else {
        console.log('\nNo Rate Plan Found in OCR text');
      }
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
