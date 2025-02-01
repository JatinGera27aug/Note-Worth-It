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
        model: options.model || "gemini-1.5-pro",
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
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

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
    console.log("description", description, "\ncontext", category);
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


      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
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
      console.log("context2", context);

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
            3. Include diverse resource formats (websites, books, courses, etc.), if providing url, it must be valid and working .
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


  async ContinueStory(description, title, category, options = {}) {
    try {
      const prompt = `
            Continue the story based on the provided description:

            Description: ${description}

            Guidelines:
            1. Maintain the original tone and style of the story.
            2. Ensure the continuation flows logically from the provided description.
            3. Provide three creative ways the storyline can progress. 
            4. Use descriptive language to enhance the narrative and don't include any special formatting or use of sybmols.
            5. Limit the continuation to a reasonable length (e.g., 50-100 words).
            If description not enough you could take some information from the title:${title} and category:${category}

            Output Format (JSON):
            {
                "suggestions": [
                    { "id": 1, "text": "[Your first continuation here]" },
                    { "id": 2, "text": "[Your second continuation here]" },
                    { "id": 3, "text": "[Your third continuation here]" }
                ]
            }
        `;

      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: { responseMimeType: 'application/json' }
      });

      const result = await model.generateContent(prompt);
      const continuationSuggestions = JSON.parse(result.response.text());

      return continuationSuggestions;

    } catch (error) {
      console.error('Continuation Suggestion Error:', error);
      throw new Error('Failed to generate continuation suggestions');
    }
  }


  async SolveProblem(problemInput, options = {}) {
    try {
      // Validate input
      if (!problemInput || problemInput.trim() === '') {
        throw new Error('No problem input provided');
      }

      // Choose the most appropriate model for text-based problem solving
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro", // Specifically use text model for text input
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
          topP: 0.9
        }
      });

      // Comprehensive prompt for text-based problem solving
      const fullPrompt = `
        Advanced Problem Solving Assistant:

        Problem Statement: ${problemInput}

        Detailed Solution Requirements:
        1. Carefully analyze the entire problem statement
        2. Break down the solution into clear, step-by-step instructions
        3. Show all mathematical workings in detail
        4. Provide the final numerical answer
        5. Explain the reasoning behind each step
        6. Highlight any key formulas or principles used
        7. If that's a not a math problem but based on theory, provide a detailed solution with explanation no steps required.

        Solution Format:
        - Step-by-Step Solution
        - Detailed Calculations
        - Final Answer
        - Explanation of Concepts

        If the problem cannot be solved:
        - Explain the specific challenges
        - Suggest alternative approaches
        - Provide learning resources related to the problem type

        Additional Context:
        - Ensure the solution is comprehensive
        - Use clear, educational language
        - Provide insights that help understanding
      `;

      // Generate solution
      const result = await model.generateContent(fullPrompt);

      // Extract response text
      const responseText = result.response.text();

      // Validate response
      if (!responseText || responseText.trim() === '') {
        return {
          solution: "No solution could be generated. The problem might be too complex or unclear.",
          steps: [],
          alternativeSources: this._getAlternativeSources()
        };
      }

      // Parse solution steps
      const steps = this._extractSolutionSteps(responseText);

      // Return structured response
      return {
        solution: responseText,
        steps: steps,
        alternativeSources: this._getAlternativeSources()
      };
    } catch (error) {
      console.error('Problem Solving Error:', error);
      
      // Detailed error logging
      console.error('Full Error Details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        problemInput: problemInput
      });
      
      // Comprehensive fallback
      return {
        solution: `Unable to solve the problem automatically. Error: ${error.message}`,
        error: error.message,
        steps: [],
        alternativeSources: this._getAlternativeSources()
      };
    }
  }

  // Helper method to get alternative sources
  _getAlternativeSources() {
    return [
      {
        name: "Chegg Study",
        url: "https://www.chegg.com/study/",
        description: "Detailed step-by-step solutions for complex problems"
      },
      {
        name: "Symbolab",
        url: "https://www.symbolab.com/",
        description: "Advanced mathematical problem solver and calculator"
      },
      {
        name: "Khan Academy",
        url: "https://www.khanacademy.org/",
        description: "Free educational resources and problem-solving tutorials"
      }
    ];
  }

  // Helper method to extract solution steps
  _extractSolutionSteps(responseText) {
    // More robust step extraction
    const stepPatterns = [
      /Step\s*(\d+)[:.]?\s*(.*?)(?=Step \d+|$)/gis,
      /(\d+)\.\s*(.*?)(?=\d+\.|$)/gis
    ];

    const steps = [];
    for (const pattern of stepPatterns) {
      const matches = [...responseText.matchAll(pattern)];
      
      if (matches.length > 0) {
        matches.forEach((match, index) => {
          steps.push({
            stepNumber: parseInt(match[1] || (index + 1)),
            description: match[2].trim()
          });
        });
        break;
      }
    }

    // Fallback if no structured steps found
    if (steps.length === 0) {
      // Split by newlines and take first few lines
      const lines = responseText.split('\n')
        .filter(line => line.trim() !== '')
        .slice(0, 3);
      
      steps.push({
        stepNumber: 1,
        description: lines.join(' ') || 'Detailed solution generated'
      });
    }

    return steps;
  }


  async retryAnswer(problemInput, preferences, wordLimit=50, options = {}) {
    try {
      // Validate input
      if (!problemInput || problemInput.trim() === '') {
        throw new Error('No problem input provided');
      }

      // Choose the most appropriate model for text-based problem solving
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro", // Specifically use text model for text input
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
          topP: 0.9
        }
      });

      // Comprehensive prompt for text-based problem solving
      const fullPrompt = `
        Advanced Problem Solving Assistant:

        Problem Statement: ${problemInput}

        Detailed Solution Requirements:
        1. Carefully analyze the entire problem statement
        2. Structure the solution according to the user’s preference (${preferences}) under word limit of ${wordLimit}:
          - **Step-by-Step** (Detailed breakdown with explanations)
          - **Concise Answer** (Final answer with minimal steps)
          - **Bullet Points** (Key takeaways in a summarized format)
          - **Detailed Explanation** (Comprehensive reasoning with supporting concepts)
        3. Show all necessary calculations and highlight formulas if applicable.  
        4. Ensure clarity with easy-to-follow explanations.  
        5. Provide relevant insights to enhance understanding.  
        6. If the question is theoretical, focus on a well-structured explanation aligned with user preferences.  
        7. If related to maths or physics, provide detailed calculations and explanations but not for simpler calculations like easy arithmetic operation.

        If the problem cannot be solved:
        - Explain the specific challenges
        - Suggest alternative approaches
        - Provide learning resources related to the problem type

        **Output Guidelines:**  
        - Ensure clarity and an educational tone.  
        - Use a structured approach for easy comprehension.  
        - Adapt the response format dynamically based on user preference.  
      `;

      // Generate solution
      const result = await model.generateContent(fullPrompt);

      // Extract response text
      const responseText = result.response.text();

      // Validate response
      if (!responseText || responseText.trim() === '') {
        return {
          solution: "No solution could be generated. The problem might be too complex or unclear.",
          steps: [],
          alternativeSources: this._getAlternativeSources()
        };
      }

      // Parse solution steps
      const steps = this._extractSolutionSteps(responseText);

      // Return structured response
      return {
        solution: responseText,
        steps: steps,
        alternativeSources: this._getAlternativeSources()
      };
    } catch (error) {
      console.error('Problem Solving Error:', error);
      
      // Detailed error logging
      console.error('Full Error Details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        problemInput: problemInput
      });
      
      // Comprehensive fallback
      return {
        solution: `Unable to solve the problem automatically. Error: ${error.message}`,
        error: error.message,
        steps: [],
        alternativeSources: this._getAlternativeSources()
      };
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