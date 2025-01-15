// const { Configuration, OpenAIApi } = require("openai");
const OpenAI = require("openai");
// console.log(openai);
// console.log({ Configuration, OpenAIApi });
const dotenv = require('dotenv');
dotenv.config()
const text = require('./text.js')
// console.log(text)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
  
async function generateQuestions(inputText) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: `Generate 5 questions from the following text:\n${inputText}` }],
      max_tokens: 150,
    });
    console.log(response.choices[0].message.content);
  } catch (error) {
    if (error.status === 429) {
      console.error("Rate limit exceeded. Please check your quota.");
    } else {
      console.error("Error generating questions:", error);
    }
  }
}
  

generateQuestions(text);
