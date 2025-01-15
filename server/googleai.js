// import { GoogleGenerativeAI } from "@google/generative-ai";
// import dotenv from 'dotenv';
// dotenv.config();
// import text from './text.js'

// class GeminiAIService {
//   constructor(apiKey) {
//     this.genAI = new GoogleGenerativeAI(apiKey);
//   }

//   async generateText(prompt, options = {}) {
//     try {
//       const model = this.genAI.getGenerativeModel({ 
//         model: options.model || "gemini-pro",
//         // Optional safety settings
//         safetySettings: [
//           {
//             category: 'HARM_CATEGORY_HATE_SPEECH',
//             threshold: 'BLOCK_MEDIUM_AND_ABOVE'
//           }
//         ]
//       });

//       const result = await model.generateContent(prompt);
//       return result.response.text();
//     } catch (error) {
//       console.error('Gemini AI Request Failed:', error);
//       throw error;
//     }
//   }

//   // Multi-turn conversation support
//   async startChat(history = []) {
//     const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

//     const chat = model.startChat({
//       history: history.map(msg => ({
//         role: msg.role,
//         parts: [{ text: msg.parts }]
//       }))
//     });

//     return chat;
//   }

//   // Image analysis (if needed)
//   async analyzeImage(imageFile) {
//     const model = this.genAI.getGenerativeModel({ model: "gemini-pro-vision" });

//     const image = {
//       inlineData: {
//         mimeType: "image/jpeg",
//         data: Buffer.from(imageFile).toString("base64")
//       }
//     };

//     const result = await model.generateContent([
//       "Describe this image in detail",
//       image
//     ]);

//     return result.response.text();
//   }
// }

// // Usage Example
// async function main() {
//   const geminiService = new GeminiAIService(process.env.GEMINI_API_KEY);

//   try {
//     // Simple text generation
//     const response = await geminiService.generateText(
//       `Generate 5 questions from the following text:\n${text}. list and frame them properly according to 
//       what are asked in Government Current Affairs exam like UPSC and provide answers as well`
//     );
//     console.log(response);

//     // Multi-turn conversation
//     const chat = await geminiService.startChat([
//       { role: "user", parts: "Hello" },
//       { role: "model", parts: "Hi there! How can I help you today?" }
//     ]);

//     // const continueChat = await chat.sendMessage("Tell me a joke");
//     // console.log(continueChat.response.text());
//   } catch (error) {
//     console.error('Gemini AI Error:', error);
//   }
// }

// main();

const axios = require('axios');
const cheerio = require('cheerio');
const dotenv = require('dotenv');
dotenv.config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

class Adda247CurrentAffairsScraper {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.baseUrl = 'https://currentaffairs.adda247.com/national-current-affairs/';
  }

  // Fetch the main page with date-based links
  async fetchMainPage() {
    try {
      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch main page:', error);
      throw error;
    }
  }

  // Extract date-based article links from the main page
  extractArticleLinks(html) {
    const $ = cheerio.load(html);
    const articleLinks = [];

    // Adjust the selector based on the actual HTML structure
    $('.post-title a').each((index, element) => {
      const link = $(element).attr('href');
      const title = $(element).text().trim();

      if (link) {
        articleLinks.push({
          title,
          url: link
        });
      }
    });

    return articleLinks;
  }

  // Fetch content from a specific article
  async fetchArticleContent(articleUrl) {
    try {
      const response = await axios.get(articleUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch article content from ${articleUrl}:`, error);
      throw error;
    }
  }

  // Extract main content from an article
  extractArticleMainContent(html) {
    const $ = cheerio.load(html);
    let content = '';

    // Adjust selectors based on the actual HTML structure
    $('.entry-content p').each((index, element) => {
      content += $(element).text().trim() + '\n\n';
    });

    return content.trim();
  }

  // Analyze article content using Gemini
  async analyzeArticleContent(content, prompt) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

      const fullPrompt = `Analyze the following current affairs content:\n\n${content}\n\n${prompt}`;

      const result = await model.generateContent(fullPrompt);
      return result.response.text();
    } catch (error) {
      console.error('Content analysis failed:', error);
      throw error;
    }
  }

  // Comprehensive scraping method
  async scrapeCurrentAffairs(options = {}) {
    const {
      maxArticles = 5,
      analysisPrompt = 'Summarize the key points and their significance in national current affairs'
    } = options;

    try {
      // Fetch main page
      const mainPageHtml = await this.fetchMainPage();

      // Extract article links
      const articleLinks = this.extractArticleLinks(mainPageHtml);

      // Limit articles if specified
      const articlesToProcess = articleLinks.slice(0, maxArticles);

      // Process each article
      const scrapedArticles = [];

      for (const article of articlesToProcess) {
        try {
          // Fetch article content
          const articleHtml = await this.fetchArticleContent(article.url);

          // Extract main content
          const mainContent = this.extractArticleMainContent(articleHtml);

          // Analyze content with Gemini
          const analysis = await this.analyzeArticleContent(
            mainContent,
            analysisPrompt
          );

          scrapedArticles.push({
            title: article.title,
            url: article.url,
            content: mainContent,
            analysis: analysis
          });
        } catch (articleError) {
          console.error(`Error processing article ${article.title}:`, articleError);
        }
      }

      return scrapedArticles;
    } catch (error) {
      console.error('Comprehensive scraping failed:', error);
      throw error;
    }
  }
}

// Usage example
async function main() {
  const scraper = new Adda247CurrentAffairsScraper(process.env.GEMINI_API_KEY);

  try {
    // Scrape current affairs
    const scrapedArticles = await scraper.scrapeCurrentAffairs({
      maxArticles: 3,
      analysisPrompt: 'Provide a detailed analysis of the national current affairs, highlighting their political, economic, and social implications'
    });

    // Print or process scraped articles
    scrapedArticles.forEach((article, index) => {
      console.log(`\n--- Article ${index + 1} ---`);
      console.log('Title:', article.title);
      console.log('URL:', article.url);
      console.log('\nContent:\n', article.content.substring(0, 500) + '...');
      console.log('\nAnalysis:\n', article.analysis);
    });
  } catch (error) {
    console.error('Scraping demonstration failed:', error);
  }
}

// module.exports = {
//   Adda247CurrentAffairsScraper,
//   main
// };

async function scrapeCurrentAffairs1() {
  const scraper = new Adda247CurrentAffairsScraper(process.env.GEMINI_API_KEY);
  
  try {
    const articles = await scraper.scrapeCurrentAffairs({
      maxArticles: 5,
      analysisPrompt: 'Summarize the key national current affairs and their potential long-term impact'
    });
    
    // Process or store articles as needed
    console.log(articles);
  } catch (error) {
    console.error('Scraping failed:', error);
  }
}

scrapeCurrentAffairs1();