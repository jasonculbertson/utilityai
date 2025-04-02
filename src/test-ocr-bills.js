// Script to test OCR extraction from bill text
const fs = require('fs');
const path = require('path');

// Since we can't directly process PDFs in this simple script,
// we'll use simulated OCR text based on the bill you shared

async function extractTextFromPdf(pdfPath) {
  console.log(`Processing PDF: ${pdfPath}`);
  try {
    // Use the OCR API key from environment variables
    const ocrApiKey = process.env.OCR_SPACE_API_KEY || 'K86742198888957';
    const extractedText = await processPdfWithOCR(pdfPath, ocrApiKey);
    return extractedText;
  } catch (error) {
    console.error('Error processing PDF:', error);
    return null;
  }
}

function extractBillInfo(text) {
  // Simple extraction similar to test-rate-plan.js
  const result = {
    rateSchedule: null,
    billingPeriod: null,
    energyCharges: {
      peak: null,
      partPeak: null,
      offPeak: null
    },
    generationCredit: null,
    totalCharges: null
  };

  // Extract rate schedule
  const rateScheduleRegex = /(?:Rate\s+(?:Schedule|Plan)|SERVICE\s+DETAILS[^]*?Rate[^]*?:)[^]*?([A-Z]-?[A-Z0-9]+-?[A-Z0-9]?)\s+([^\n]+)/i;
  const rateMatch = rateScheduleRegex.exec(text);
  if (rateMatch) {
    result.rateSchedule = `${rateMatch[1]} ${rateMatch[2] || ''}`;
  }

  // Extract billing period
  const billingPeriodRegex = /(\d{1,2}\/\d{1,2}\/\d{4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4})\s*\((\d+)\s*billing\s*days\)/i;
  const billingMatch = billingPeriodRegex.exec(text);
  if (billingMatch) {
    result.billingPeriod = `${billingMatch[1]} - ${billingMatch[2]} (${billingMatch[3]} billing days)`;
  }

  // Extract energy charges
  const peakEnergyRegex = /Peak\s+(\d+\.\d+)(?:000)?\s*kWh\s*@\s*\$?[so]\.?(\d+\.\d+)\s*\$?(\d+\.\d+)/i;
  const peakMatch = peakEnergyRegex.exec(text);
  if (peakMatch) {
    result.energyCharges.peak = {
      kWh: parseFloat(peakMatch[1]),
      rate: parseFloat(peakMatch[2]),
      charge: parseFloat(peakMatch[3])
    };
  }

  // Extract part peak energy charges
  const partPeakEnergyRegex = /Part\s+Peak\s+(\d+\.\d+)(?:000)?\s*kWh\s*@\s*\$?[so]\.?(\d+\.\d+)\s*\$?(\d+\.\d+)/i;
  const partPeakMatch = partPeakEnergyRegex.exec(text);
  if (partPeakMatch) {
    result.energyCharges.partPeak = {
      kWh: parseFloat(partPeakMatch[1]),
      rate: parseFloat(partPeakMatch[2]),
      charge: parseFloat(partPeakMatch[3])
    };
  }

  // Extract off-peak energy charges
  const offPeakEnergyRegex = /Off\s+Peak\s*(\d+\.\d+)(?:CD0|000)?\s*kWh\s*@\s*\$?[so]\.?(\d+\.\d+)\s*\$?(\d+\.?\d*)/i;
  const offPeakMatch = offPeakEnergyRegex.exec(text);
  if (offPeakMatch) {
    result.energyCharges.offPeak = {
      kWh: parseFloat(offPeakMatch[1]),
      rate: parseFloat(offPeakMatch[2]),
      charge: parseFloat(offPeakMatch[3])
    };
  }

  // Extract generation credit
  const genCreditRegex = /Generation\s+Credit\s+(-\d+\.\d+)/i;
  const genCreditMatch = genCreditRegex.exec(text);
  if (genCreditMatch) {
    result.generationCredit = parseFloat(genCreditMatch[1]);
  }

  // Extract total charges
  const totalChargesRegex = /Total\s+PG&E\s+Electric\s+Delivery\s+Charges\s*\$?(\d+\.\d+)/i;
  const totalMatch = totalChargesRegex.exec(text);
  if (totalMatch) {
    result.totalCharges = parseFloat(totalMatch[1]);
  }

  return result;
}

// Validate rate plan
function validateRatePlan(detectedPlan) {
  if (!detectedPlan) return null;
  
  // Normalize the detected plan (remove spaces, make uppercase)
  const normalizedPlan = detectedPlan.replace(/\s+/g, "").toUpperCase();
  
  // Define the valid PG&E rate plans
  const VALID_RATE_PLANS = [
    "E-1", "E-TOU-C", "E-TOU-D", "EV-A", "EV-B", "EV2-A", 
    "B-1", "B-6", "B-10", "B-19", "B-20", "BEV1", "BEV2"
  ];
  
  // First check if the plan is already in our valid list (case insensitive)
  for (const plan of VALID_RATE_PLANS) {
    if (plan.toUpperCase() === detectedPlan.toUpperCase()) {
      return plan; // Return the correctly formatted version from our list
    }
  }
  
  // Then check normalized versions (with spaces and hyphens removed)
  for (const plan of VALID_RATE_PLANS) {
    if (plan.replace(/\s+|-/g, "").toUpperCase() === normalizedPlan) {
      return plan;
    }
  }
  
  // Handle common OCR errors
  if (normalizedPlan === "ETOUB") return "E-TOU-C"; // Fix B/C confusion
  if (normalizedPlan === "ETOU8") return "E-TOU-B"; // Fix 8/B confusion
  if (normalizedPlan === "ET0UC") return "E-TOU-C"; // Fix 0/O confusion
  if (normalizedPlan === "ET0UD") return "E-TOU-D"; // Fix 0/O confusion
  if (normalizedPlan === "ETOUC") return "E-TOU-C"; // Add proper formatting
  if (normalizedPlan === "ETOUD") return "E-TOU-D"; // Add proper formatting
  if (normalizedPlan === "El") return "E-1"; // Fix l/1 confusion
  if (normalizedPlan === "EV2A") return "EV2-A"; // Handle EV2A format (without hyphen)
  
  // Default to null if we can't determine the rate plan
  return null;
}

async function processAndAnalyzeBill(pdfPath) {
  const extractedText = await extractTextFromPdf(pdfPath);
  
  if (!extractedText) {
    console.log(`Failed to extract text from ${pdfPath}`);
    return null;
  }
  
  // Save extracted text to a file for reference
  const textFileName = path.basename(pdfPath, '.pdf') + '_ocr.txt';
  const textFilePath = path.join(__dirname, '..', textFileName);
  fs.writeFileSync(textFilePath, extractedText);
  console.log(`Saved OCR text to ${textFilePath}`);
  
  // Extract bill information
  const billInfo = extractBillInfo(extractedText);
  
  // Validate rate plan
  if (billInfo.rateSchedule) {
    const ratePlan = billInfo.rateSchedule.split(' ')[0];
    const validatedPlan = validateRatePlan(ratePlan);
    if (validatedPlan) {
      billInfo.validatedRateSchedule = validatedPlan + ' ' + billInfo.rateSchedule.split(' ').slice(1).join(' ');
    }
  }
  
  return {
    file: path.basename(pdfPath),
    billInfo,
    extractedText
  };
}

async function main() {
  const bill1Path = path.join(__dirname, '..', 'test-files', '2035custbill03122025.pdf');
  const bill2Path = path.join(__dirname, '..', 'test-files', '2035custbill12112024.pdf');
  
  console.log('\nProcessing Bill 1: 2035custbill03122025.pdf');
  const result1 = await processAndAnalyzeBill(bill1Path);
  if (result1) {
    console.log('\nResults from Bill 1:');
    console.log('Raw Rate Schedule:', result1.billInfo.rateSchedule);
    console.log('Validated Rate Schedule:', result1.billInfo.validatedRateSchedule);
    console.log('Billing Period:', result1.billInfo.billingPeriod);
    console.log('\nEnergy Charges:');
    console.log('Peak:', result1.billInfo.energyCharges.peak);
    console.log('Part Peak:', result1.billInfo.energyCharges.partPeak);
    console.log('Off Peak:', result1.billInfo.energyCharges.offPeak);
    console.log('Generation Credit:', result1.billInfo.generationCredit);
    console.log('Total Charges:', result1.billInfo.totalCharges);
  }
  
  console.log('\n--------------------------------\n');
  
  console.log('\nProcessing Bill 2: 2035custbill12112024.pdf');
  const result2 = await processAndAnalyzeBill(bill2Path);
  if (result2) {
    console.log('\nResults from Bill 2:');
    console.log('Raw Rate Schedule:', result2.billInfo.rateSchedule);
    console.log('Validated Rate Schedule:', result2.billInfo.validatedRateSchedule);
    console.log('Billing Period:', result2.billInfo.billingPeriod);
    console.log('\nEnergy Charges:');
    console.log('Peak:', result2.billInfo.energyCharges.peak);
    console.log('Part Peak:', result2.billInfo.energyCharges.partPeak);
    console.log('Off Peak:', result2.billInfo.energyCharges.offPeak);
    console.log('Generation Credit:', result2.billInfo.generationCredit);
    console.log('Total Charges:', result2.billInfo.totalCharges);
  }
  
  console.log('\nTesting complete!');
}

// Run the main function
main().catch(err => console.error('Error in main function:', err));
