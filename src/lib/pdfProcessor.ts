import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';
import FormData from 'form-data';

/**
 * Extract pages from a PDF file and save them as individual PDFs
 */
export async function extractPdfPages(pdfPath: string, outputDir: string): Promise<string[]> {
  // Read the PDF file
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pageCount = pdfDoc.getPageCount();
  
  console.log(`PDF has ${pageCount} pages. Extracting...`);
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const pageFilePaths: string[] = [];
  
  // Extract each page to a separate PDF
  for (let i = 0; i < pageCount; i++) {
    const newPdfDoc = await PDFDocument.create();
    const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
    newPdfDoc.addPage(copiedPage);
    
    const pageBytes = await newPdfDoc.save();
    const pageFilePath = path.join(outputDir, `page_${i + 1}.pdf`);
    
    fs.writeFileSync(pageFilePath, pageBytes);
    pageFilePaths.push(pageFilePath);
    
    console.log(`Extracted page ${i + 1}/${pageCount} to ${pageFilePath}`);
  }
  
  return pageFilePaths;
}

/**
 * Process a PDF page with OCR.space API
 */
export async function processPageWithOCR(pagePath: string, apiKey: string, maxRetries = 3): Promise<any> {
  console.log(`Processing page with OCR: ${pagePath}`);
  console.log(`File exists: ${fs.existsSync(pagePath)}`);
  console.log(`File size: ${fs.statSync(pagePath).size} bytes`);
  
  let retries = 0;
  let lastError: any = null;
  
  // Retry logic with exponential backoff
  while (retries <= maxRetries) {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(pagePath));
      console.log('Created form data with file stream');
      
      // Try alternating between OCR engines if we're retrying
      const ocrEngine = retries % 2 === 0 ? '2' : '1';
      console.log(`Retry ${retries}/${maxRetries}: Using OCR Engine ${ocrEngine}`);
      
      console.log(`Sending OCR request with API key: ${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}`);
      console.log(`OCR request parameters: language=eng, isOverlayRequired=false, scale=true, isTable=true, OCREngine=${ocrEngine}`);
      
      const startTime = Date.now();
      console.log(`Starting OCR API request at ${new Date().toISOString()}`);
      
      const response = await axios.post('https://api.ocr.space/parse/image', formData, {
        headers: {
          ...formData.getHeaders(),
          'apikey': apiKey,
        },
        params: {
          'language': 'eng',
          'isOverlayRequired': 'false',
          'scale': 'true',
          'isTable': 'true',
          'OCREngine': ocrEngine,
          'timeout': 30000 // 30 second timeout
        },
        timeout: 60000 // 60 second axios timeout
      });
      
      const endTime = Date.now();
      console.log(`OCR API request completed in ${endTime - startTime}ms`);
      console.log(`OCR response status: ${response.status}`);
      
      // Check if the response indicates an error
      if (response.data && response.data.IsErroredOnProcessing) {
        console.error(`OCR API returned an error: ${response.data.ErrorMessage}`);
        console.error(`OCR error details: ${response.data.ErrorDetails}`);
        throw new Error(`OCR API error: ${response.data.ErrorMessage || 'Unknown error'}`);
      }
      
      if (response.data && response.data.OCRExitCode) {
        console.log(`OCR exit code: ${response.data.OCRExitCode}`);
        console.log(`OCR processing time: ${response.data.ProcessingTimeInMilliseconds}ms`);
      }
      
      if (response.data && response.data.ParsedResults) {
        console.log(`OCR parsed results count: ${response.data.ParsedResults.length}`);
        
        // Check if any of the parsed results have errors
        const hasErrors = response.data.ParsedResults.some(
          (result: any) => result.FileParseExitCode < 0 || result.ErrorMessage
        );
        
        if (hasErrors) {
          const errorMessages = response.data.ParsedResults
            .filter((result: any) => result.ErrorMessage)
            .map((result: any) => result.ErrorMessage)
            .join(', ');
          
          console.error(`OCR parsed results contain errors: ${errorMessages}`);
          throw new Error(`OCR parsing error: ${errorMessages || 'Unknown parsing error'}`);
        }
      }
      
      console.log(`OCR response data preview: ${JSON.stringify(response.data).substring(0, 200)}...`);
      return response.data;
    } catch (err) {
      const error = err as Error;
      lastError = error;
      console.error(`Error processing page with OCR (attempt ${retries + 1}/${maxRetries + 1}): ${error}`);
      
      // Handle axios error response
      if ('response' in error && error.response && typeof error.response === 'object') {
        const axiosError = error as { response: { status?: number, data?: any } };
        if (axiosError.response.status) {
          console.error(`OCR error response status: ${axiosError.response.status}`);
        }
        if (axiosError.response.data) {
          console.error(`OCR error response data: ${JSON.stringify(axiosError.response.data)}`);
        }
      }
      
      // If we've reached max retries, throw the error
      if (retries >= maxRetries) {
        console.error(`Max retries (${maxRetries}) reached. Giving up.`);
        throw error;
      }
      
      // Otherwise, wait and retry
      const delay = Math.pow(2, retries) * 1000; // Exponential backoff: 1s, 2s, 4s, etc.
      console.log(`Waiting ${delay}ms before retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    }
  }
  
  // This should never happen due to the throw in the loop, but TypeScript needs it
  throw lastError;
}

/**
 * Extract text from OCR result
 */
export function extractTextFromOCRResult(ocrResult: any): string {
  if (!ocrResult || !ocrResult.ParsedResults || ocrResult.ParsedResults.length === 0) {
    return '';
  }
  
  return ocrResult.ParsedResults.map((result: any) => result.ParsedText).join('\n');
}

/**
 * Process a PDF file with OCR.space API, extracting pages first
 */
export async function processPdfWithOCR(pdfPath: string, apiKey: string): Promise<string> {
  console.log(`Starting OCR processing of PDF: ${pdfPath}`);
  console.log(`Using OCR API key starting with: ${apiKey.substring(0, 5)}...`);
  
  // Create a temporary directory for extracted pages
  const tempDir = path.join(path.dirname(pdfPath), 'temp_pages');
  console.log(`Created temporary directory: ${tempDir}`);
  
  try {
    // Extract pages from the PDF
    const pageFilePaths = await extractPdfPages(pdfPath, tempDir);
    
    let allText = '';
    let failedPages = 0;
    
    // Only process pages 1 and 3 (which are indices 0 and 2)
    const pagesToProcess = [0, 2];
    console.log(`Only processing pages 1 and 3 of the bill for efficiency...`);
    
    // Process only selected pages with OCR
    for (const pageIndex of pagesToProcess) {
      if (pageIndex < pageFilePaths.length) {
        const pagePath = pageFilePaths[pageIndex];
        const pageNumber = pageIndex + 1;
        console.log(`Processing page ${pageNumber} (important billing info)...`);
        
        try {
          // Process the page with OCR with retries
          const ocrResult = await processPageWithOCR(pagePath, apiKey);
          
          // Extract text from OCR result
          const pageText = extractTextFromOCRResult(ocrResult);
          
          // Add page header and text to all text
          allText += `\n--- PAGE ${pageNumber} ---\n${pageText}\n`;
        } catch (err) {
          const error = err as Error;
          console.error(`Failed to process page ${pageNumber} after multiple retries: ${error.message}`);
          failedPages++;
          
          // Add error message to text
          allText += `\n--- PAGE ${pageNumber} ---\n[OCR PROCESSING FAILED: ${error.message || 'Unknown error'}]\n`;
          
          // If all selected pages have failed, throw an error
          if (failedPages === pagesToProcess.length) {
            throw new Error('All selected pages failed OCR processing. Please try again later or contact support.');
          }
        }
      }
    }
    
    if (failedPages > 0) {
      console.warn(`OCR processing completed with ${failedPages}/${pageFilePaths.length} failed pages`);
    } else {
      console.log('OCR processing complete successfully for all pages');
    }
    
    return allText;
  } finally {
    // Clean up temporary files
    try {
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        for (const file of files) {
          try {
            fs.unlinkSync(path.join(tempDir, file));
          } catch (err) {
            const error = err as Error;
            console.error(`Error deleting temporary file ${file}: ${error.message}`);
          }
        }
        fs.rmdirSync(tempDir);
      }
    } catch (err) {
      const error = err as Error;
      console.error(`Error cleaning up temporary directory: ${error.message}`);
    }
  }
}
