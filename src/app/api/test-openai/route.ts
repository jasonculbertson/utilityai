import { NextResponse } from 'next/server';
import { extractBillInfo } from '@/lib/openai';
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
    
    // Extract bill information using OpenAI
    console.log('Sending OCR text to OpenAI for extraction...');
    console.log(`Using OpenAI API key starting with: ${process.env.OPENAI_API_KEY?.substring(0, 10)}...`);
    const billInfo = await extractBillInfo(ocrText);
    
    // Save the extracted bill info to a file for reference
    const outputPath = path.join(process.cwd(), 'extracted-bill-info.json');
    fs.writeFileSync(outputPath, JSON.stringify(billInfo, null, 2));
    
    // Return the extracted bill information
    return NextResponse.json({
      success: true,
      billInfo,
      verification: {
        serviceInfo: {
          customerName: billInfo.serviceInfo?.customerName || 'Not found',
          serviceAddress: billInfo.serviceInfo?.serviceAddress || 'Not found',
          city: billInfo.serviceInfo?.city || 'Not found',
          state: billInfo.serviceInfo?.state || 'Not found',
          zip: billInfo.serviceInfo?.zip || 'Not found'
        },
        billingInfo: {
          billingPeriod: billInfo.billingInfo?.billingPeriod || 'Not found',
          rateSchedule: billInfo.billingInfo?.rateSchedule || 'Not found'
        },
        energyCharges: {
          peak: {
            kWh: billInfo.energyCharges?.peak?.kWh || 'Not found',
            rate: billInfo.energyCharges?.peak?.rate || 'Not found',
            charge: billInfo.energyCharges?.peak?.charge || 'Not found'
          },
          offPeak: {
            kWh: billInfo.energyCharges?.offPeak?.kWh || 'Not found',
            rate: billInfo.energyCharges?.offPeak?.rate || 'Not found',
            charge: billInfo.energyCharges?.offPeak?.charge || 'Not found'
          },
          total: billInfo.energyCharges?.total || 'Not found'
        }
      }
    });
  } catch (error) {
    console.error('Error in OpenAI extraction:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }, { status: 500 });
  }
}
