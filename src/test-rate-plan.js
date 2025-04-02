// Simple JavaScript test file to test rate plan detection

// Test rate plan validation
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

// Test cases
const testCases = [
  { input: "EV2A", expected: "EV2-A" },
  { input: "EV2-A", expected: "EV2-A" },
  { input: "ETOUB", expected: "E-TOU-C" },
  { input: "E-TOU-C", expected: "E-TOU-C" },
  { input: "E-TOU-D", expected: "E-TOU-D" },
  { input: "E1", expected: "E-1" },
  { input: "Rate Schedule: EV2A Home Charging", expected: null } // This would be handled by regex extraction
];

// Run tests
console.log("Testing Rate Plan Validation\n");
for (const test of testCases) {
  const result = validateRatePlan(test.input);
  const passed = result === test.expected;
  console.log(`Test: "${test.input}" → ${result} (Expected: ${test.expected}) ${passed ? '✅' : '❌'}`);
}

// Test for the full rate plan extraction from bill text
const billText = `
Details of PG&E Electric Delivery Charges
02/04/2025 - 03/05/2025 (30 billing days)
Service For: 1080 WARFIELD AVE
Service Agreement ID: 7097173513
Rate Schedule: EV2A Home Charging
`;

// Simple regex to extract rate plan
const rateScheduleRegex = /(?:Rate\s+(?:Schedule|Plan)|SERVICE\s+DETAILS[^]*?Rate[^]*?:)[^]*?([A-Z]-?[A-Z0-9]+-?[A-Z0-9]?)/i;
const match = rateScheduleRegex.exec(billText);

console.log("\nTesting Rate Extraction from Bill Text\n");
console.log("Raw match from regex:", match ? match[1] : "No match");

if (match) {
  const validatedPlan = validateRatePlan(match[1]);
  console.log("Validated rate plan:", validatedPlan);
}
