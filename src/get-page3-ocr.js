// Script to get OCR output specifically from page 3 of bill PDFs
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { exec } = require('child_process');

// Function to extract a specific page from PDF
function extractPdfPage(pdfPath, pageNum, outputPath) {
  return new Promise((resolve, reject) => {
    // Use pdfjam to extract the page (available on most Mac systems)
    const command = `pdfjam "${pdfPath}" ${pageNum} --outfile "${outputPath}"`;
    
    exec(command, (error) => {
      if (error) {
        // Fallback to pdftohtml
        const altCommand = `pdftohtml -f ${pageNum} -l ${pageNum} -s -noframes "${pdfPath}" "${outputPath.replace('.pdf', '')}"`;
        exec(altCommand, (altError) => {
          if (altError) {
            console.error(`Error extracting PDF page: ${altError}`);
            reject(altError);
            return;
          }
          // pdftohtml creates an HTML file
          resolve(outputPath.replace('.pdf', '.html'));
        });
        return;
      }
      resolve(outputPath);
    });
  });
}

// Function to call OCR.space API directly
async function getOcrText(pdfPath) {
  try {
    console.log(`Processing file: ${pdfPath}`);
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      console.error(`File not found: ${pdfPath}`);
      return null;
    }
    
    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    // Extract page 3
    const pagePath = path.join(tempDir, `${path.basename(pdfPath, '.pdf')}_page3.pdf`);
    try {
      await extractPdfPage(pdfPath, 3, pagePath);
    } catch (error) {
      console.error('Could not extract page 3, trying to use full PDF');
      // If page extraction fails, use the original PDF
    }
    
    // Determine which file to use for OCR
    const fileToOcr = fs.existsSync(pagePath) ? pagePath : pdfPath;
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(fileToOcr));
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
    console.log('\n===== MARCH 2025 BILL OCR OUTPUT (PAGE 3) =====');
    const marchOcrText = await getOcrText(marchBillPath);
    if (marchOcrText) {
      // Extract and highlight the rate plan information
      const rateRegex = /Rate Schedule:\s*([A-Za-z0-9-]+)\s*([^\n]+)?/;
      const rateMatch = marchOcrText.match(rateRegex);
      
      console.log('\nRaw OCR Text from Page 3:');
      console.log(marchOcrText);
      
      if (rateMatch) {
        console.log('\nRate Plan Found:');
        console.log(`Rate Schedule: ${rateMatch[1]}${rateMatch[2] ? ' ' + rateMatch[2] : ''}`);
      } else {
        console.log('\nNo Rate Plan Found in OCR text');
      }
    } else {
      console.log('Failed to get OCR output for March 2025 bill');
    }
    
    // Process December 2024 bill
    console.log('\n===== DECEMBER 2024 BILL OCR OUTPUT (PAGE 3) =====');
    const decemberOcrText = await getOcrText(decemberBillPath);
    if (decemberOcrText) {
      // Extract and highlight the rate plan information
      const rateRegex = /Rate Schedule:\s*([A-Za-z0-9-]+)\s*([^\n]+)?/;
      const rateMatch = decemberOcrText.match(rateRegex);
      
      console.log('\nRaw OCR Text from Page 3:');
      console.log(decemberOcrText);
      
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

// Run the main function
main();
