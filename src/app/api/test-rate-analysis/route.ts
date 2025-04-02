import { NextResponse } from 'next/server';
import { extractBillInfo } from '@/lib/openai';
import { analyzeBillWithOpenAI } from '@/lib/ratePlanAnalyzer';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the OCR text from the file
    const ocrTextPath = path.join(process.cwd(), 'ocr-results.txt');
    
    if (!fs.existsSync(ocrTextPath)) {
      return NextResponse.json({ error: 'OCR text file not found' }, { status: 404 });
    }
    
    const ocrText = fs.readFileSync(ocrTextPath, 'utf8');
    console.log(`OCR text length: ${ocrText.length} characters`);
    
    // Step 1: Extract bill information using OpenAI
    console.log('Step 1: Extracting bill information with OpenAI...');
    console.log(`Using OpenAI API key starting with: ${process.env.OPENAI_API_KEY?.substring(0, 10)}...`);
    const billInfo = await extractBillInfo(ocrText);
    
    // Step 2: Analyze rate plans using the extracted bill information
    console.log('Step 2: Analyzing rate plans with OpenAI...');
    const analysis = await analyzeBillWithOpenAI(billInfo);
    
    // Save the analysis to a file for reference
    const outputPath = path.join(process.cwd(), 'rate-plan-analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
    
    // Return the complete analysis
    return NextResponse.json({
      success: true,
      billInfo,
      analysis
    });
  } catch (error) {
    console.error('Error in rate plan analysis:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
