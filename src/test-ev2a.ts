// Import the openai file and access the extractWithRegex function
const openai = require('./lib/openai');
const extractWithRegex = openai.extractWithRegex;

// Test OCR text (simulating the OCR result from your bill)
const testOcrText = `
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

// Test the extraction function
const result = extractWithRegex(testOcrText);

// Log the detected rate plan
console.log('Rate Plan Detection Result:');
console.log('Detected Rate Schedule:', result.billingInfo?.rateSchedule);
console.log('\nFull Extraction Result:', JSON.stringify(result, null, 2));
