// Script to test rate plan detection with different OCR outputs
const openai = require('./lib/openai');
const extractWithRegex = openai.extractWithRegex;
const validateRatePlan = openai.validateRatePlan;

// Sample OCR texts with different rate plans
const samples = [
  {
    name: "Sample 1: EV2A",
    text: `
Details of PG&E Electric Delivery Charges
02/04/2025 - 03/05/2025 (30 billing days)
Service For: 1080 WARFIELD AVE
Service Agreement ID: 7097173513
Rate Schedule: EV2A Home Charging

Energy Charges
    Peak            74.347000 kWh @ $0.48879        $36.34
    Part Peak       43.925000 kWh @ $0.47209         20.74
    Off Peak      389.547000 kWh @ $0.30339        118.18
`
  },
  {
    name: "Sample 2: ETOUB",
    text: `
Details of PG&E Electric Delivery Charges
11/04/2024 - 12/03/2024 (30 billing days)
Service For: 1080 WARFIELD AVE
Service Agreement ID: 7097173513
Rate Schedule: ETOUB

Energy Charges
    Peak            68.210000 kWh @ $0.48255        $32.91
    Part Peak       40.120000 kWh @ $0.46585         18.69
    Off Peak      372.460000 kWh @ $0.29715        110.72
`
  },
  {
    name: "Sample 3: E-TOU-B",
    text: `
Details of PG&E Electric Delivery Charges
09/04/2024 - 10/03/2024 (30 billing days)
Service For: 1080 WARFIELD AVE
Service Agreement ID: 7097173513
Rate Schedule: E-TOU-B

Energy Charges
    Peak            66.420000 kWh @ $0.47928        $31.84
    Off Peak      365.780000 kWh @ $0.29388        107.49
`
  },
  {
    name: "Sample 4: EV2-A",
    text: `
Details of PG&E Electric Delivery Charges
08/04/2024 - 09/03/2024 (30 billing days)
Service For: 1080 WARFIELD AVE
Service Agreement ID: 7097173513
Rate Schedule: EV2-A Home Charging

Energy Charges
    Peak            70.580000 kWh @ $0.48567        $34.28
    Part Peak       41.520000 kWh @ $0.46897         19.47
    Off Peak      379.900000 kWh @ $0.30027        114.07
`
  }
];

console.log("===== TESTING RATE PLAN DETECTION =====\n");

// Test extraction function with regex
console.log("--- REGEX EXTRACTION RESULTS ---");
samples.forEach(sample => {
  console.log(`\n${sample.name}`);
  const result = extractWithRegex(sample.text);
  console.log(`Detected Rate Schedule: ${result.billingInfo?.rateSchedule || 'Not detected'}`);
});

// Test direct validation function
console.log("\n\n--- VALIDATION FUNCTION RESULTS ---");
console.log("(Shows how detected rate plans are converted to valid PG&E rate plans)\n");
const ratePlans = [
  "EV2A",
  "EV2-A",
  "ETOUB",
  "E-TOU-B",
  "ETOUD",
  "E-TOU-D",
  "E1",
  "E-1"
];

ratePlans.forEach(plan => {
  const valid = validateRatePlan(plan);
  console.log(`Rate Plan: ${plan} => Validated as: ${valid || 'Invalid'}`);
});
