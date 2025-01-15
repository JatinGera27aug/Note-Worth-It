const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

class GeminiAIService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateText(text, prompt, options = {}) {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: options.model || "gemini-pro",
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      });

      // Combine the text with the specific prompt
      const fullPrompt = `Given the following text:\n${text}\n\n${prompt}`;

      const result = await model.generateContent(fullPrompt);
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

  // Image analysis method
  async analyzeImage(imageFile, prompt = "Describe this image in detail") {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    const image = {
      inlineData: {
        mimeType: "image/jpeg",
        data: Buffer.from(imageFile).toString("base64")
      }
    };

    const result = await model.generateContent([
      prompt,
      image
    ]);

    return result.response.text();
  }
}

// Create and export a singleton instance
const geminiService = new GeminiAIService(process.env.GEMINI_API_KEY);

module.exports = {
  GeminiAIService,
  geminiService
};