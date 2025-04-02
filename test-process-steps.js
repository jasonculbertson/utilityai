// Test script to verify each step of the bill processing pipeline
require('dotenv').config({ path: './.env.test' });
const fs = require('fs');
const path = require('path');
// Use direct imports with full paths
const pdfProcessor = require('./src/lib/pdfProcessor');
const openai = require('./src/lib/openai');

// Extract the functions we need
const { extractPdfPages, processPdfWithOCR } = pdfProcessor;
const { extractBillInfo } = openai;

// Test configuration
const testPdfPath = './test-files/2035custbill12112024.pdf'; // Using existing test PDF
const tempDir = path.join(__dirname, 'temp-test-pages');

// Create temp directory if it doesn't exist
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Step 1: Test PDF page extraction
async function testPdfExtraction() {
  console.log('\n===== STEP 1: TESTING PDF PAGE EXTRACTION =====');
  console.log(`Using test PDF: ${testPdfPath}`);
  
  try {
    if (!fs.existsSync(testPdfPath)) {
      console.error(`Test PDF file not found: ${testPdfPath}`);
      return false;
    }
    
    console.log('Extracting pages from PDF...');
    const pageFilePaths = await extractPdfPages(testPdfPath, tempDir);
    console.log(`Successfully extracted ${pageFilePaths.length} pages from PDF`);
    console.log('Extracted pages:', pageFilePaths);
    
    // Verify extracted pages exist
    let allPagesExist = true;
    for (const pagePath of pageFilePaths) {
      if (!fs.existsSync(pagePath)) {
        console.error(`Extracted page file does not exist: ${pagePath}`);
        allPagesExist = false;
      } else {
        const stats = fs.statSync(pagePath);
        console.log(`Page file ${path.basename(pagePath)}: ${stats.size} bytes`);
      }
    }
    
    return { success: allPagesExist, pageFilePaths };
  } catch (error) {
    console.error('Error in PDF extraction step:', error);
    return { success: false, error };
  }
}

// Step 2: Test OCR processing
async function testOcrProcessing(pageFilePaths) {
  console.log('\n===== STEP 2: TESTING OCR PROCESSING =====');
  console.log(`Using OCR API key starting with: ${process.env.OCR_SPACE_API_KEY?.substring(0, 5)}...`);
  
  try {
    if (!pageFilePaths || pageFilePaths.length === 0) {
      console.error('No page files provided for OCR processing');
      return false;
    }
    
    console.log(`Processing ${pageFilePaths.length} pages with OCR...`);
    const extractedText = await processPdfWithOCR(
      testPdfPath,
      process.env.OCR_SPACE_API_KEY
    );
    
    // Save extracted text for inspection
    const textOutputPath = path.join(tempDir, 'extracted_text.txt');
    fs.writeFileSync(textOutputPath, extractedText);
    console.log(`Saved extracted OCR text to ${textOutputPath}`);
    console.log(`Extracted ${extractedText.length} characters of text`);
    console.log('Text preview:', extractedText.substring(0, 200) + '...');
    
    return { success: extractedText.length > 0, extractedText, textOutputPath };
  } catch (error) {
    console.error('Error in OCR processing step:', error);
    return { success: false, error };
  }
}

// Step 3: Test OpenAI processing
async function testOpenAiProcessing(extractedText) {
  console.log('\n===== STEP 3: TESTING OPENAI PROCESSING =====');
  console.log(`Using OpenAI API key starting with: ${process.env.OPENAI_API_KEY?.substring(0, 10)}...`);
  
  try {
    if (!extractedText) {
      console.error('No extracted text provided for OpenAI processing');
      return false;
    }
    
    console.log('Sending extracted text to OpenAI for analysis...');
    console.log('Text length:', extractedText.length, 'characters');
    
    const billInfo = await extractBillInfo(extractedText);
    
    // Save bill info for inspection
    const billInfoPath = path.join(tempDir, 'bill_info.json');
    fs.writeFileSync(billInfoPath, JSON.stringify(billInfo, null, 2));
    console.log(`Saved bill info to ${billInfoPath}`);
    console.log('Bill info:', JSON.stringify(billInfo, null, 2));
    
    return { success: true, billInfo, billInfoPath };
  } catch (error) {
    console.error('Error in OpenAI processing step:', error);
    return { success: false, error };
  }
}

// Run all tests in sequence
async function runAllTests() {
  try {
    console.log('Starting bill processing tests...');
    console.log(`OpenAI API Key: ${process.env.OPENAI_API_KEY?.substring(0, 10)}...${process.env.OPENAI_API_KEY?.substring(process.env.OPENAI_API_KEY.length - 5)}`);
    console.log(`OCR Space API Key: ${process.env.OCR_SPACE_API_KEY?.substring(0, 5)}...`);
    
    // Step 1: PDF Extraction
    const extractionResult = await testPdfExtraction();
    if (!extractionResult.success) {
      console.error('PDF extraction test failed. Stopping tests.');
      return;
    }
    
    // Step 2: OCR Processing
    const ocrResult = await testOcrProcessing(extractionResult.pageFilePaths);
    if (!ocrResult.success) {
      console.error('OCR processing test failed. Stopping tests.');
      return;
    }
    
    // Step 3: OpenAI Processing
    const openaiResult = await testOpenAiProcessing(ocrResult.extractedText);
    if (!openaiResult.success) {
      console.error('OpenAI processing test failed.');
      return;
    }
    
    console.log('\n===== ALL TESTS COMPLETED SUCCESSFULLY =====');
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    // Clean up temporary files (uncomment to enable cleanup)
    // if (fs.existsSync(tempDir)) {
    //   fs.rmSync(tempDir, { recursive: true, force: true });
    //   console.log(`Cleaned up temporary directory: ${tempDir}`);
    // }
  }
}

// Run the tests
runAllTests();
