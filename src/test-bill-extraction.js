// Script to test bill data extraction with simulated OCR text

// Simulated OCR text from your March 2025 bill (based on the image you shared)
const marchBillText = `
Details of PG&E Electric Delivery Charges
02/04/2025 - 03/05/2025 (30 billing days)
Service For: 1080 WARFIELD AVE
Service Agreement ID: 7097173513
Rate Schedule: EV2A Home Charging

02/04/2025 – 02/28/2025

Energy Charges
    Peak            74.347000 kWh @ $0.48879        $36.34
    Part Peak       43.925000 kWh @ $0.47209         20.74
    Off Peak      389.547000 kWh @ $0.30339        118.18
Generation Credit                                    -66.54
Power Charge Indifference Adjustment                   3.40
Franchise Fee Surcharge                                0.55
Oakland Utility Users' Tax (7.500%)                    8.41

03/01/2025 – 03/05/2025

Energy Charges
    Peak            14.987000 kWh @ $0.49566         $7.43
    Part Peak        7.974000 kWh @ $0.47896          3.82
    Off Peak       127.789000 kWh @ $0.31027         39.65
Generation Credit                                    -19.37
Power Charge Indifference Adjustment                   1.01
Franchise Fee Surcharge                                0.16
Oakland Utility Users' Tax (7.500%)                    2.44

Total PG&E Electric Delivery Charges                $156.22
`;

// Simulated OCR text from your December 2024 bill (placeholder - replace with actual data from the bill)
const decemberBillText = `
Details of PG&E Electric Delivery Charges
11/04/2024 - 12/03/2024 (30 billing days)
Service For: 1080 WARFIELD AVE
Service Agreement ID: 7097173513
Rate Schedule: EV2A Home Charging

11/04/2024 – 11/30/2024

Energy Charges
    Peak            68.210000 kWh @ $0.48255        $32.91
    Part Peak       40.120000 kWh @ $0.46585         18.69
    Off Peak      372.460000 kWh @ $0.29715        110.72
Generation Credit                                    -61.28
Power Charge Indifference Adjustment                   3.15
Franchise Fee Surcharge                                0.52
Oakland Utility Users' Tax (7.500%)                    7.85

12/01/2024 – 12/03/2024

Energy Charges
    Peak            13.850000 kWh @ $0.48942         $6.78
    Part Peak        7.350000 kWh @ $0.47272          3.47
    Off Peak       121.320000 kWh @ $0.30403         36.89
Generation Credit                                    -17.81
Power Charge Indifference Adjustment                   0.93
Franchise Fee Surcharge                                0.15
Oakland Utility Users' Tax (7.500%)                    2.27

Total PG&E Electric Delivery Charges                $145.24
`;

function extractBillInfo(text) {
  // Simple extraction logic
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

  // Extract energy charges (first period)
  const peakEnergyRegex = /Peak\s+(\d+\.\d+)(?:000)?\s*kWh\s*@\s*\$?[so]\.?(\d+\.\d+)\s*\$?(\d+\.\d+)/i;
  const peakMatch = peakEnergyRegex.exec(text);
  if (peakMatch) {
    result.energyCharges.peak = {
      kWh: parseFloat(peakMatch[1]),
      rate: parseFloat(peakMatch[2]),
      charge: parseFloat(peakMatch[3])
    };
  }

  // Extract part peak energy charges (first period)
  const partPeakEnergyRegex = /Part\s+Peak\s+(\d+\.\d+)(?:000)?\s*kWh\s*@\s*\$?[so]\.?(\d+\.\d+)\s*\$?(\d+\.\d+)/i;
  const partPeakMatch = partPeakEnergyRegex.exec(text);
  if (partPeakMatch) {
    result.energyCharges.partPeak = {
      kWh: parseFloat(partPeakMatch[1]),
      rate: parseFloat(partPeakMatch[2]),
      charge: parseFloat(partPeakMatch[3])
    };
  }

  // Extract off-peak energy charges (first period)
  const offPeakEnergyRegex = /Off\s+Peak\s*(\d+\.\d+)(?:CD0|000)?\s*kWh\s*@\s*\$?[so]\.?(\d+\.\d+)\s*\$?(\d+\.?\d*)/i;
  const offPeakMatch = offPeakEnergyRegex.exec(text);
  if (offPeakMatch) {
    result.energyCharges.offPeak = {
      kWh: parseFloat(offPeakMatch[1]),
      rate: parseFloat(offPeakMatch[2]),
      charge: parseFloat(offPeakMatch[3])
    };
  }

  // Extract total generation credit (combined from both billing periods)
  let totalGenCredit = 0;
  const genCreditRegex = /Generation\s+Credit\s+(-\d+\.\d+)/ig;
  let genCreditMatch;
  while ((genCreditMatch = genCreditRegex.exec(text)) !== null) {
    totalGenCredit += parseFloat(genCreditMatch[1]);
  }
  result.generationCredit = totalGenCredit;

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

function processAndAnalyzeBill(billText, billName) {
  console.log(`\nProcessing ${billName} Bill:`);
  
  // Extract bill information
  const billInfo = extractBillInfo(billText);
  
  // Validate rate plan
  if (billInfo.rateSchedule) {
    const ratePlan = billInfo.rateSchedule.split(' ')[0];
    const validatedPlan = validateRatePlan(ratePlan);
    if (validatedPlan) {
      billInfo.validatedRateSchedule = validatedPlan + ' ' + billInfo.rateSchedule.split(' ').slice(1).join(' ');
    }
  }
  
  // Print results
  console.log('\nExtracted Information:');
  console.log('Raw Rate Schedule:', billInfo.rateSchedule);
  console.log('Validated Rate Schedule:', billInfo.validatedRateSchedule);
  console.log('Billing Period:', billInfo.billingPeriod);
  console.log('\nEnergy Charges:');
  console.log('Peak:', billInfo.energyCharges.peak);
  console.log('Part Peak:', billInfo.energyCharges.partPeak);
  console.log('Off Peak:', billInfo.energyCharges.offPeak);
  console.log('Generation Credit:', billInfo.generationCredit);
  console.log('Total Charges: $' + billInfo.totalCharges);
  
  return billInfo;
}

// Process both bills
console.log('===== BILL EXTRACTION TEST =====');
processAndAnalyzeBill(marchBillText, 'March 2025');
console.log('\n--------------------------------');
processAndAnalyzeBill(decemberBillText, 'December 2024');
