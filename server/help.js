// // const { Configuration, OpenAIApi } = require("openai");
// const OpenAI = require("openai");
// // console.log(openai);
// // console.log({ Configuration, OpenAIApi });
// const dotenv = require('dotenv');
// dotenv.config()
// const text = require('./text.js')
// // console.log(text)

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
  
// async function generateQuestions(inputText) {
//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: `Generate 5 questions from the following text:\n${inputText}` }],
//       max_tokens: 150,
//     });
//     console.log(response.choices[0].message.content);
//   } catch (error) {
//     if (error.status === 429) {
//       console.error("Rate limit exceeded. Please check your quota.");
//     } else {
//       console.error("Error generating questions:", error);
//     }
//   }
// }
  

// generateQuestions(text);


// const puppeteer = require("puppeteer");
// console.log("Hello World");
// async function getFirstGoogleLink(query) {
//   const browser = await puppeteer.launch({ headless: "new" });
//   const page = await browser.newPage();

//   // Open Google and search for the query
//   await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
//     waitUntil: "domcontentloaded",
//   });

//   // Wait for search results to load
//   await page.waitForSelector(".byrV5b cite");

//   // Extract the first result's full URL
//   const firstLink = await page.evaluate(() => {
//     const citeElement = document.querySelector(".byrV5b cite");
//     if (!citeElement) return null;

//     const mainDomain = citeElement.childNodes[0]?.textContent.trim() || "";
//     const subPath = citeElement.querySelector("span")?.textContent.trim() || "";

//     return mainDomain + subPath;
//   });

//   await browser.close();
//   return firstLink;
// }

// // Example usage
// getFirstGoogleLink("essay writing site")
//   .then((link) => console.log("First Google result:", link))
//   .catch((err) => console.error("Error:", err));







  // const puppeteer = require("puppeteer");

  // async function getFirstGoogleLink(query) {
  //   const browser = await puppeteer.launch({ headless: "new" });
  //   const page = await browser.newPage();
  
  //   // Mimic a real browser to prevent bot detection
  //   await page.setUserAgent(
  //     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  //   );
  
  //   // Open Google and search for the query
  //   await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
  //     waitUntil: "domcontentloaded",
  //   });
  
  //   // Wait for search results to load
  //   await page.waitForSelector(".tF2C cite, .tF2C a", { timeout: 10000 });
  
  //   // Extract the first result's full URL from <cite> if available
  //   const firstLink = await page.evaluate(() => {
  //     const citeElement = document.querySelector(".tF2C cite");
  //     if (citeElement) {
  //       const mainDomain = citeElement.childNodes[0]?.textContent.trim() || "";
  //       const subPath = citeElement.querySelector("span")?.textContent.trim() || "";
  //       return mainDomain + subPath;
  //     }
  
  //     // Fallback: Extract from the actual <a> tag if <cite> is missing
  //     const firstResult = document.querySelector(".tF2C a");
  //     return firstResult ? firstResult.href : null;
  //   });
  
  //   await browser.close();
  //   return firstLink;
  // }
  
  // // Example usage
  // getFirstGoogleLink("essay writing site")
  //   .then((link) => console.log("First Google result:", link))
  //   .catch((err) => console.error("Error:", err));
  




  const puppeteer = require("puppeteer");

  // const puppeteer = require("puppeteer");

  async function getFirstGoogleLink(query, options = {}) {
    const {
      timeout = 30000,
      headless = true,
      retries = 3
    } = options;
  
    for (let attempt = 1; attempt <= retries; attempt++) {
      let browser = null;
      try {
        browser = await puppeteer.launch({ 
          headless: headless ? "new" : false,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
          ]
        });
  
        const page = await browser.newPage();
  
        // Set a specific user agent
        await page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );
  
        // Navigate to Google search
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
          waitUntil: 'networkidle0',
          timeout: timeout
        });
  
        // Wait specifically for .byrV5b class with extended timeout
        await page.waitForSelector('.byrV5b', { 
          timeout: timeout,
          visible: true
        });
  
        // Extract the first result's link
        const firstLink = await page.evaluate(() => {
          const linkElement = document.querySelector('.byrV5b');
          if (linkElement) {
            // Try to get the href from an anchor tag within .byrV5b
            const anchorTag = linkElement.querySelector('a');
            if (anchorTag) {
              return anchorTag.href;
            }
            
            // If no anchor tag, return the text content (which might be a URL)
            return linkElement.textContent.trim();
          }
          return null;
        });
  
        // Validate and clean the link
        if (firstLink) {
          try {
            const url = new URL(firstLink);
            // Remove tracking parameters
            url.search = '';
            return url.toString();
          } catch {
            // If URL construction fails, return the original link
            return firstLink;
          }
        }
  
        throw new Error('No valid link found');
  
      } catch (error) {
        console.warn(`Attempt ${attempt} failed:`, error.message);
        
        // Exponential backoff
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
      } finally {
        if (browser) await browser.close();
      }
    }
  
    throw new Error('Failed to retrieve Google search result after multiple attempts');
  }
  
  // Safe wrapper function
  async function safeGetFirstGoogleLink(query) {
    try {
      const link = await getFirstGoogleLink(query);
      console.log("First Google result:", link);
      return link;
    } catch (err) {
      console.error("Comprehensive Google Search Error:", {
        message: err.message,
        query: query,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }
  
  module.exports = { 
    getFirstGoogleLink, 
    safeGetFirstGoogleLink 
  };

getFirstGoogleLink("essay writing tips");
safeGetFirstGoogleLink("essay writing tips");
module.exports = { 
  getFirstGoogleLink, 
  safeGetFirstGoogleLink 
};