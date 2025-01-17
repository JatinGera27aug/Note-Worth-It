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
  async readTextFromImage(imagePath, prompt = `
    Extract all text from this image including headings as well.
    Guidelines: 
    All the text should be extracted not just highlighted words.
    Ensure the output is in valid text format without any additional formatting or symbols, or stylistic modifications.
    No starting introduction lines or ending phrases, just the text from image`) {
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

  // resource generation
  async suggestResources(context, options = {}) {
    // console.log("notesId",notesId,"\nuserId", user);
    try {
        //Retrieve or generate context
        // const context = await NotesController.getOrCreateContext(notesId, user);
        console.log("context2",context);

        const { keyTopics, educationalLevel, learningGoals, skills } = context;

        const prompt = `
            Using the provided note's context, suggest curated learning resources:

            Key Topics: ${keyTopics.join(', ')}
            Educational Level: ${educationalLevel}
            Learning Goals: ${learningGoals.join('; ')}
            Skills: ${skills.length > 0 ? skills.join(', ') : 'No specific skills identified'}

            Guidelines:
            1. Prioritize resources that address the key topics and learning goals.
            2. Ensure relevance to the user's educational level.
            3. Include diverse resource formats (websites, books, courses, etc.).
            4. Provide a brief description of each resource and its relevance.
            5. Assign a relevance score (0-100) based on contextual alignment.

            Output Format (JSON):
            {
                "resources": [
                    {
                        "title": "Resource Title",
                        "type": "Website/Book/Course/etc.",
                        "url": "Direct link",
                        "description": "Why this resource is relevant",
                        "relevanceScore": 0-100
                    }
                ],
                "insights": "Brief contextual analysis of suggested resources."
            }
        `;

        // Step 3: Generate resources using AI
        const model = this.genAI.getGenerativeModel({
            model: "gemini-1.5-pro",
            generationConfig: { responseMimeType: 'application/json' }
        });

        const result = await model.generateContent(prompt);
        const resourceSuggestions = JSON.parse(result.response.text());

        // Optional: Sort by relevance
        if (options.sortByRelevance !== false) {
            resourceSuggestions.resources.sort((a, b) => b.relevanceScore - a.relevanceScore);
        }

        return resourceSuggestions;  // back to controller
    } catch (error) {
        console.error('Resource Suggestion Error:', error);
        throw new Error('Failed to generate resource suggestions');
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