const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testUpload() {
  try {
    console.log('Testing bill upload...');
    
    // Path to the test PDF file
    const pdfPath = path.join(__dirname, 'test-files', '2035custbill12112024.pdf');
    console.log(`Using test file: ${pdfPath}`);
    
    // Create a form data object
    const form = new FormData();
    form.append('file', fs.createReadStream(pdfPath));
    
    // Send the request to the local API endpoint
    console.log('Sending request to upload API...');
    const response = await axios.post('http://localhost:3000/api/upload', form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error testing upload API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testUpload();
