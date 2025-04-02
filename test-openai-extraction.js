// Test script to verify OpenAI extraction with the OCR text
require('dotenv').config({ path: './.env.test' });
const fs = require('fs');
const { extractBillInfo } = require('./src/lib/openai');

// Read the OCR text from the file
const ocrText = fs.readFileSync('./ocr-results.txt', 'utf8');

// Test OpenAI extraction
async function testOpenAiExtraction() {
  console.log('\n===== TESTING OPENAI EXTRACTION =====');
  console.log(`Using OpenAI API key starting with: ${process.env.OPENAI_API_KEY?.substring(0, 10)}...`);
  console.log(`OCR text length: ${ocrText.length} characters`);
  
  try {
    console.log('Sending OCR text to OpenAI for extraction...');
    const billInfo = await extractBillInfo(ocrText);
    
    // Save the extracted bill info to a file
    fs.writeFileSync('./extracted-bill-info.json', JSON.stringify(billInfo, null, 2));
    console.log('\n===== EXTRACTED BILL INFORMATION =====');
    console.log(JSON.stringify(billInfo, null, 2));
    
    // Verify the extracted information
    console.log('\n===== VERIFICATION =====');
    
    // Service Info
    console.log('Service Information:');
    console.log(`- Customer Name: ${billInfo.serviceInfo?.customerName || 'Not found'}`);
    console.log(`- Service Address: ${billInfo.serviceInfo?.serviceAddress || 'Not found'}`);
    console.log(`- City: ${billInfo.serviceInfo?.city || 'Not found'}`);
    console.log(`- State: ${billInfo.serviceInfo?.state || 'Not found'}`);
    console.log(`- ZIP: ${billInfo.serviceInfo?.zip || 'Not found'}`);
    
    // Billing Info
    console.log('\nBilling Information:');
    console.log(`- Billing Period: ${billInfo.billingInfo?.billingPeriod || 'Not found'}`);
    console.log(`- Rate Schedule: ${billInfo.billingInfo?.rateSchedule || 'Not found'}`);
    
    // Energy Charges
    console.log('\nEnergy Charges:');
    console.log('Peak:');
    console.log(`- kWh: ${billInfo.energyCharges?.peak?.kWh || 'Not found'}`);
    console.log(`- Rate: ${billInfo.energyCharges?.peak?.rate || 'Not found'}`);
    console.log(`- Charge: ${billInfo.energyCharges?.peak?.charge || 'Not found'}`);
    
    console.log('Off-Peak:');
    console.log(`- kWh: ${billInfo.energyCharges?.offPeak?.kWh || 'Not found'}`);
    console.log(`- Rate: ${billInfo.energyCharges?.offPeak?.rate || 'Not found'}`);
    console.log(`- Charge: ${billInfo.energyCharges?.offPeak?.charge || 'Not found'}`);
    
    console.log(`Total Energy Charges: ${billInfo.energyCharges?.total || 'Not found'}`);
    
    return { success: true, billInfo };
  } catch (error) {
    console.error('Error in OpenAI extraction:', error);
    return { success: false, error };
  }
}

// Run the test
async function runTest() {
  try {
    console.log('Starting OpenAI extraction test...');
    const result = await testOpenAiExtraction();
    
    if (result.success) {
      console.log('\n===== OPENAI EXTRACTION TEST COMPLETED SUCCESSFULLY =====');
    } else {
      console.error('\n===== OPENAI EXTRACTION TEST FAILED =====');
    }
  } catch (error) {
    console.error('Error running test:', error);
  }
}

// Run the test
runTest();
