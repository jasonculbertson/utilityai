// Simple test script to verify OpenAI API functionality
require('dotenv').config({ path: './.env.test' });
const { OpenAI } = require('openai');

// Test configuration
const openaiApiKey = process.env.OPENAI_API_KEY;

// Function to test OpenAI API
async function testOpenAiApi() {
  console.log('\n===== TESTING OPENAI API =====');
  console.log(`Using OpenAI API key starting with: ${openaiApiKey?.substring(0, 10)}...`);
  console.log(`API key length: ${openaiApiKey?.length} characters`);
  
  try {
    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });
    
    console.log('OpenAI client created successfully');
    console.log('Sending test request to OpenAI API...');
    
    // First try with response_format parameter (which might be causing the issue)
    try {
      console.log('\nAttempt 1: With response_format parameter');
      const response1 = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that responds in JSON format."
          },
          {
            role: "user",
            content: "Return a simple JSON with your name and version."
          }
        ],
        response_format: { type: "json_object" }
      });
      
      console.log('OpenAI API response with response_format:');
      console.log(JSON.stringify(response1, null, 2));
      console.log('Response content:', response1.choices[0].message.content);
    } catch (error1) {
      console.error('Error with response_format parameter:');
      console.error(`Status: ${error1.status}`);
      console.error(`Message: ${error1.message}`);
      console.error(`Type: ${error1.type}`);
      if (error1.response) {
        console.error('Error response:', error1.response);
      }
    }
    
    // Then try without response_format parameter
    try {
      console.log('\nAttempt 2: Without response_format parameter');
      const response2 = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that responds in JSON format."
          },
          {
            role: "user",
            content: "Return a simple JSON with your name and version."
          }
        ]
      });
      
      console.log('OpenAI API response without response_format:');
      console.log(JSON.stringify(response2, null, 2));
      console.log('Response content:', response2.choices[0].message.content);
      
      return { success: true, data: response2 };
    } catch (error2) {
      console.error('Error without response_format parameter:');
      console.error(`Status: ${error2.status}`);
      console.error(`Message: ${error2.message}`);
      console.error(`Type: ${error2.type}`);
      if (error2.response) {
        console.error('Error response:', error2.response);
      }
      
      return { success: false, error: error2 };
    }
  } catch (error) {
    console.error('Error creating OpenAI client:');
    console.error(error);
    return { success: false, error };
  }
}

// Run the OpenAI API test
async function runOpenAiTest() {
  try {
    console.log('Starting OpenAI API test...');
    const result = await testOpenAiApi();
    
    if (result && result.success) {
      console.log('\n===== OPENAI API TEST COMPLETED SUCCESSFULLY =====');
    } else {
      console.error('\n===== OPENAI API TEST FAILED =====');
    }
  } catch (error) {
    console.error('Error running OpenAI API test:', error);
  }
}

// Run the test
runOpenAiTest();
