const { OpenAI } = require('openai');

const apiKey = process.env.OPENAI_API_KEY;
console.log(`Using API key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);

const openai = new OpenAI({
  apiKey: apiKey,
});

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API...');
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: "Hello, are you working?"
        }
      ],
    });
    
    console.log('API Response:', response.choices[0].message.content);
    console.log('API test successful!');
  } catch (error) {
    console.error('Error testing OpenAI API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testOpenAI();
