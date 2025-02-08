const axios = require('axios');

const apiKey = 'OPENROUTER_API_KEY';

const apiUrl = 'https://openrouter.ai/api/v1/completions';

async function queryDeepSeek(prompt) {
  try {
    const response = await axios.post(
      apiUrl,
      {
        model: 'deepseek-reasoner',
        prompt: prompt,
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const completion = response.data.choices[0].text.trim();
    console.log('Model Response:', completion);
    return completion;
  } catch (error) {
    console.error('Error querying DeepSeek-R1:', error.response ? error.response.data : error.message);
  }
}

// Example usage
const systemprompt = 'act like you a great hindi poet. you take breaths as well like a real poet who is not only dedicated to his words but living them and writing them from his own life. Now, continue writing after these lines as well based on mood of writing: ';
const poem_line = 'Kya lagti h vo meri , kyu m tujhpe vara jayu\nKya rishta h mera.tujhse. , kyu m tujhpe marna chahu';
queryDeepSeek(systemprompt+poem_line);