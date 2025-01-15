import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();
import text from './text.js'

class GeminiAIService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateText(prompt, options = {}) {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: options.model || "gemini-pro",
        // Optional safety settings
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      });

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini AI Request Failed:', error);
      throw error;
    }
  }

  // Multi-turn conversation support
  async startChat(history = []) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts }]
      }))
    });

    return chat;
  }

  // Image analysis (if needed)
  async analyzeImage(imageFile) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    const image = {
      inlineData: {
        mimeType: "image/jpeg",
        data: Buffer.from(imageFile).toString("base64")
      }
    };

    const result = await model.generateContent([
      "Describe this image in detail",
      image
    ]);

    return result.response.text();
  }
}

// Usage Example
async function main() {
  const geminiService = new GeminiAIService(process.env.GEMINI_API_KEY);

  try {
    // Simple text generation
    const response = await geminiService.generateText(
      `Generate 5 questions from the following text:\n${text}. list and frame them properly according to 
      what are asked in Government Current Affairs exam like UPSC and provide answers as well`
    );
    console.log(response);

    // Multi-turn conversation
    const chat = await geminiService.startChat([
      { role: "user", parts: "Hello" },
      { role: "model", parts: "Hi there! How can I help you today?" }
    ]);

    // const continueChat = await chat.sendMessage("Tell me a joke");
    // console.log(continueChat.response.text());
  } catch (error) {
    console.error('Gemini AI Error:', error);
  }
}

main();