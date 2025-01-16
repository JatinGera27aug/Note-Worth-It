const { geminiService } = require('./geminiServices');

async function processText(text) {
  try {
    // Specific prompt for generating UPSC-style questions
    const prompt = `Generate 5 questions from this text that are suitable for Government Current Affairs exams like UPSC.
    For each question:
    1. Provide a clear and concise question.
    2. Provide a comprehensive answer.
    3. Do not include any additional formatting or symbols like asterisks.
    4. Provide the output in a plain JSON array format, where each object contains "question" and "answer" fields.`;

    // Use the generateText method with both text and prompt
    const response = await geminiService.generateText(
      text, 
      prompt
    );

    return response;
  } catch (error) {
    console.error('Text Processing Error:', error);
    throw error;
  }
}

// Summarize text
async function summarizeText(text) {
  const prompt = `Provide a concise summary of the following text, highlighting the main points and key insights.
                  Do not include any additional formatting or symbols like asterisks.`;
  
  return await geminiService.generateText(
    text, 
    prompt
  );
}

async function rewrite(text, manner="actual manner as it is") {
    const prompt = `Simplify the text such that it does not loose its original meaning and holds all the important points in ${manner}
                    Do not include any additional formatting or symbols like asterisks.`;
    console.log(manner);
    
    return await geminiService.generateText(
      text, 
      prompt
    );
}

module.exports = {
  processText,
  summarizeText,
  rewrite,
};