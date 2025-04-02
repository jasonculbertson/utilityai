import { processBill } from './lib/billProcessor';
import path from 'path';

async function testBillProcessing() {
  try {
    // Path to the bill PDF file
    const billPath = path.join(__dirname, '..', 'test-files', '2035custbill03122025.pdf');
    
    console.log(`Processing bill file: ${billPath}`);
    
    // Process the bill
    const result = await processBill(billPath);
    
    // Log the detection results
    console.log('\nBill Processing Results:');
    console.log('Rate Plan:', result.billingInfo?.rateSchedule);
    console.log('Billing Period:', result.billingInfo?.billingPeriod);
    console.log('Customer:', result.serviceInfo?.customerName);
    
    // Log full result for detailed inspection
    console.log('\nFull Result:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('Error processing bill:', error);
    throw error;
  }
}

// Run the test
testBillProcessing()
  .then(() => console.log('\nTest completed successfully'))
  .catch(error => console.error('\nTest failed:', error));
