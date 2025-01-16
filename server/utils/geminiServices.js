const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
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

  // Image text reading method
  async readTextFromImage(imagePath, prompt = "Extract all text from this image including headings as well") {
    try {
      // Validate image file
      if (!fs.existsSync(imagePath)) {
        throw new Error('Image file does not exist');
      }

      // Read image file
      const imageBuffer = fs.readFileSync(imagePath);
      
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const image = {
        inlineData: {
          mimeType: this._getMimeType(imagePath),
          data: imageBuffer.toString("base64")
        }
      };

      const result = await model.generateContent([prompt, image]);
      return result.response.text();
    } catch (error) {
      console.error('Image Text Extraction Failed:', error);
      throw error;
    }
  }

  // Determine MIME type based on file extension
  _getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }


  // text translation
  async translateText(text, targetLanguage, sourceLanguage = 'auto') {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = sourceLanguage === 'auto' 
        ? `Translate the entire text to ${targetLanguage}, preserving its original formatting and meaning.:` 
        : `Translate the following text from ${sourceLanguage} to ${targetLanguage}:`;
  
      const result = await model.generateContent(`${prompt}\n\n${text}`);
      return result.response.text();
    } catch (error) {
      console.error('Text Translation Failed:', error);
      throw error;
    }
  }


  async _extractNoteContext(description, category) {
    console.log("description",description,"\ncontext", category);
    try {
      const contextPrompt = `
       Analyze the following note description and category:

    Description: ${description}
    Category: ${category}

    Provide the response in **pure JSON format** using the structure below:

    {
      "keyTopics": [Array of strings, e.g., "Topic 1", "Topic 2"],
      "educationalLevel": "Beginner/Intermediate/Advanced",
      "learningGoals": [Array of strings, e.g., "Goal 1", "Goal 2"],
      "skills": [Array of strings, e.g., "Skill 1", "Skill 2"]
    }

    Ensure the output is valid JSON without any additional text or formatting or symbols, or stylistic modifications.
  `;

  
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(contextPrompt);

      // removing ``` or json tag if any
      const rawResponse = result.response.text();
      const cleanedResponse = rawResponse.replace(/```json|```/g, "").trim();
      // Return the extracted context as plain text
      return cleanedResponse;
    } catch (error) {
      console.error('Context Extraction Error:', error);
      throw new Error('Failed to extract context from the note.');
    }
  }

  // Method to clear cache
  clearCache() {
    this.cache.clear();
  }
}

// Create and export a singleton instance
const geminiService = new GeminiAIService(process.env.GEMINI_API_KEY);

module.exports = {
  GeminiAIService,
  geminiService
};