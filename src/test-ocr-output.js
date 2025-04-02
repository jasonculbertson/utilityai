// Script to show raw OCR output from PDF files
const { processPage } = require('./lib/pdfProcessor');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Function to extract a single page from PDF
function extractPdfPage(pdfPath, pageNum, outputPath) {
  return new Promise((resolve, reject) => {
    // Use pdftk to extract the page
    const command = `pdftk "${pdfPath}" cat ${pageNum} output "${outputPath}"`;
    
    exec(command, (error) => {
      if (error) {
        console.error(`Error extracting PDF page: ${error}`);
        reject(error);
        return;
      }
      resolve(outputPath);
    });
  });
}

// Process the OCR for a PDF file
async function getOcrOutput(pdfPath) {
  try {
    // Create a temporary directory for extracted pages
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    // Extract page 3 (which is where the electricity charges usually are)
    const pagePath = path.join(tempDir, `${path.basename(pdfPath, '.pdf')}_page3.pdf`);
    await extractPdfPage(pdfPath, 3, pagePath);
    
    // Get OCR API key
    const apiKey = process.env.OCR_SPACE_API_KEY || 'K86742198888957';
    
    // Process the page with OCR
    console.log(`Processing ${path.basename(pdfPath)} with OCR...`);
    const ocrResult = await processPage(pagePath, apiKey);
    
    // Clean up temp files
    try {
      fs.unlinkSync(pagePath);
    } catch (err) {
      console.warn(`Warning: Could not delete temp file ${pagePath}`);
    }
    
    return ocrResult;
  } catch (error) {
    console.error('Error processing PDF:', error);
    return null;
  }
}

async function main() {
  try {
    // Load environment variables from .env file
    require('dotenv').config();
    
    // Process both bill files
    const bill1Path = path.join(__dirname, '..', 'test-files', '2035custbill03122025.pdf');
    const bill2Path = path.join(__dirname, '..', 'test-files', '2035custbill12112024.pdf');
    
    console.log('\n===== MARCH 2025 BILL OCR OUTPUT =====');
    const ocrResult1 = await getOcrOutput(bill1Path);
    if (ocrResult1) {
      console.log('\nRaw OCR Text:');
      console.log(ocrResult1);
    } else {
      console.log('Failed to get OCR output for March 2025 bill');
    }
    
    console.log('\n===== DECEMBER 2024 BILL OCR OUTPUT =====');
    const ocrResult2 = await getOcrOutput(bill2Path);
    if (ocrResult2) {
      console.log('\nRaw OCR Text:');
      console.log(ocrResult2);
    } else {
      console.log('Failed to get OCR output for December 2024 bill');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
main();
