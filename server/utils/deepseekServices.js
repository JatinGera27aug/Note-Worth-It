const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configure DeepSeek client
const openai = require('openai');
const deepseekClient = new openai.OpenAI({
  baseURL: 'https://api.kluster.ai/v1',
  apiKey: process.env.DEEPSEEK_API_KEY
});

class DeepSeek_Services{
    async generateResourceLinks(description, category, context, options = {}) {
        console.log(description, category, context)
    try {
      // Validate input
      if (!description || description.trim() === '') {
        throw new Error('No description provided for resource generation');
      }

      

      // Comprehensive prompt for resource generation
      const resourcePrompt = `
        Generate a list of high-quality, verified online resources based on:
        
        Description: ${description}
        Category: ${category}
        Context: ${context}

        Resource Generation Guidelines:
        1. Provide 5-7 diverse, credible resources
        2. Include direct, working URLs
        3. Ensure resources match the content's educational level
        4. Prioritize academic, educational, and professional sources
        5. Validate each link's accessibility

        For each resource, provide:
        - Title
        - Direct URL (must be valid)
        - Brief description
        - Relevance score (0-100)
        - Resource type (Website, Course, Tutorial, etc.)

        Output Format (Strict JSON):
        {
          "resources": [
            {
              "title": "Resource Title",
              "type": "Website/Book/Course/etc.",
              "url": "https://valid-url.com",
              "description": "Why this resource is relevant",
              "relevanceScore": 0-100,
            }
          ],
          "insights": "Contextual analysis of recommended resources"
        }
      `;

      // Generate resources
      const response = await deepseekClient.chat.completions.create({
        model: "deepseek-ai/DeepSeek-R1",
        messages: [
          { 
            role: "system", 
            content: "You are an expert resource curator specializing in generating precise, high-quality learning resources." 
          },
          { 
            role: "user", 
            content: resourcePrompt 
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1024
      });

      // Parse and validate resources
      const resourceData = JSON.parse(response.choices[0].message.content);
      
      // Additional link validation
      const validatedResources = await this._validateResourceLinks(resourceData.resources);

      return {
        resources: validatedResources,
        insights: resourceData.insights || "Curated resources based on your content"
      };
    } catch (error) {
      console.error('Resource Generation Error:', error);
      
      // Fallback resources
      return {
        resources: this._getFallbackResources(description, category),
        insights: "Unable to generate custom resources. Showing general recommendations."
      };
    }
  }

  // Validate resource links
  async _validateResourceLinks(resources) {
    const axios = require('axios');
    const validatedResources = [];

    for (const resource of resources) {
      try {
        // Basic URL validation
        const urlPattern = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/;
        if (!urlPattern.test(resource.url)) continue;

        // Head request to check link accessibility
        const response = await axios.head(resource.url, { 
          timeout: 3000,
          validateStatus: (status) => status === 200
        });

        validatedResources.push(resource);
      } catch (error) {
        console.warn(`Invalid resource link: ${resource.url}`);
      }

      // Limit to 5 validated resources
      if (validatedResources.length >= 5) break;
    }

    return validatedResources;
  }

  // Fallback resources generator
  _getFallbackResources(description, category) {
    const genericResources = [
      {
        title: "Khan Academy",
        url: "https://www.khanacademy.org/",
        description: "Free educational resources across multiple subjects",
        relevanceScore: 75,
        type: "Educational Platform"
      },
      {
        title: "Coursera",
        url: "https://www.coursera.org/",
        description: "Online courses from top universities",
        relevanceScore: 70,
        type: "Online Learning"
      }
    ];

    return genericResources;
  }
}

const deepseekService = new DeepSeek_Services();

module.exports = {DeepSeek_Services,
    deepseekService} ; 
