// import { ChatOpenAI } from "@langchain/openai";
import dotenv from 'dotenv';
dotenv.config();
// import { SystemMessage, HumanMessage } from "@langchain/core/messages";

// async function runPrompt() {
//     const llm = new ChatOpenAI({
//         temperature: 0,
//         openAIApiKey: process.env.OPENAI_API_KEY,
//     });

//     const messages = [
//         new SystemMessage("You are a helpful assistant"),
//         new HumanMessage("What is the weather like?")
//     ];

//     try {
//         const response = await llm.invoke(messages);
//         console.log(response);
//     } catch (error) {
//         console.error("Error running prompt:", error);
//     }
// }

// runPrompt();
const text = `The Ministry of Rural Development has sanctioned 56 new Watershed Development Projects under the Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) at a total cost of ₹700 crore. These projects aim to enhance agricultural productivity, address land degradation, and bolster climate resilience across ten high-performing states: Rajasthan, Madhya Pradesh, Karnataka, Odisha, Tamil Nadu, Assam, Nagaland, Himachal Pradesh, Uttarakhand, and Sikkim.
Project Details
Scope and Coverage: Each project will cover approximately 5,000 hectares, with adjustments in hill states where areas may be smaller. Collectively, these initiatives will impact around 280,000 hectares.

Activities Undertaken: The projects will implement various activities, including ridge area treatment, drainage line treatment, soil and moisture conservation, rainwater harvesting, nursery raising, pasture development, and providing livelihoods for asset-less individuals.

Objectives and Expected Outcomes
Agricultural Productivity: By improving soil health and water availability, the projects aim to increase crop yields and farmers’ incomes.

Land Degradation: The initiatives focus on rehabilitating degraded lands, promoting sustainable land management practices.

Climate Resilience: Enhancing water conservation and soil fertility will strengthen farmers’ resilience to climate change impacts.

Historical Context
This initiative builds upon the success of the Watershed Development Component of PMKSY 1.0, which led to significant improvements in groundwater levels, surface water availability, and agricultural productivity. The ongoing PMKSY-WDC 2.0 continues these efforts, with the recent approval of these 56 projects marking a substantial investment in sustainable agriculture and rural development`
// import OpenAI from 'openai';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
//   maxRetries: 3  // Built-in retry mechanism
// });

// async function makeRequestWithBackoff(inputText) {
//   try {
//     // Implement exponential backoff
//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: `Generate 5 questions from the following text:\n${inputText}` }],
//       // Add rate limit protection
//       max_tokens: 50,
//       timeout: 30000  // 30-second timeout
//     });
//   } catch (error) {
//     if (error.status === 429) {
//       console.log("Rate limit exceeded. Waiting before retry...");
//       // Exponential backoff
//       const waitTime = Math.pow(2, 2) * 1000;
//       await new Promise(resolve => setTimeout(resolve, waitTime));
//     }
//   }
// }

// makeRequestWithBackoff(text);

import OpenAI from 'openai';

class RateLimitHandler {
  constructor(apiKey) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
    this.retryCount = 0;
    this.MAX_RETRIES = 5;
    this.BASE_DELAY = 1000; // 1 second base delay
  }

  async makeRequest(messages, options = {}) {
    try {
      this.retryCount = 0;
      return await this._executeRequestWithRetry(messages, options);
    } catch (error) {
      console.error('Persistent OpenAI request failure:', error);
      throw error;
    }
  }

  async _executeRequestWithRetry(messages, options) {
    try {
      return await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo-16k',
        messages: messages,
        max_tokens: options.max_tokens || 150,
        temperature: options.temperature || 0.7
      });
    } catch (error) {
      // Specifically handle rate limit errors
      if (error.status === 429) {
        if (this.retryCount < this.MAX_RETRIES) {
          this.retryCount++;
          
          // Exponential backoff with jitter
          const delay = Math.min(
            this.BASE_DELAY * Math.pow(2, this.retryCount),
            30000 // Max 30 seconds
          );
          
          const jitteredDelay = delay * (1 + Math.random());
          
          console.warn(`Rate limit hit. Retry ${this.retryCount}. Waiting ${jitteredDelay}ms`);
          
          await new Promise(resolve => setTimeout(resolve, jitteredDelay));
          
          return this._executeRequestWithRetry(messages, options);
        } else {
          console.error('Max retries exceeded');
          throw new Error('Unable to complete request due to rate limiting');
        }
      }
      
      // Rethrow other types of errors
      throw error;
    }
  }

  // Diagnostic method to check account status
  async checkAccountStatus() {
    try {
      const accountInfo = await this.openai.retrieveAccount();
      console.log('Account Details:', accountInfo);
    } catch (error) {
      console.error('Failed to retrieve account status:', error);
    }
  }
}

// Usage example
async function main() {
  const rateLimitHandler = new RateLimitHandler(process.env.OPENAI_API_KEY);
  
  try {
    const response = await rateLimitHandler.makeRequest([
      { role: "user", content: "Tell me a short story" }
    ]);
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('Request failed:', error);
  }
}

main();