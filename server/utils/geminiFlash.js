// File: server/utils/geminiFlash.js
// This module provides functions to interact with the gemini-2.0-flash model via the OpenRouter API
// and generate creative content such as summaries and poems.

const axios = require('axios');

/**
 * Calls the gemini-2.0-flash model via the OpenRouter API.
 * @param {string} prompt - The input prompt for the model.
 * @returns {Promise<Object>} - The response data from the API.
 * @throws {Error} - If required API configuration is missing or the request fails.
 */
async function callGeminiFlash(prompt) {
  const apiUrl = process.env.OPENROUTER_API_URL;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('Missing OPENROUTER_API_URL or OPENROUTER_API_KEY in environment variables.');
  }

  const payload = {
    model: 'gemini-2.0-flash',
    prompt: prompt
    // Additional parameters can be added here if required.
  };

  try {
    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Request to OpenRouter API failed: ${error.response ? error.response.data : error.message}`);
  }
}

/**
 * Generates a summary for a given note.
 * @param {string} note - The note content to summarize.
 * @returns {Promise<Object>} - The summary generated by the model.
 */
async function summarizeNote(note) {
  const prompt = `Please provide a concise and clear summary for the following note: "${note}"`;
  return await callGeminiFlash(prompt);
}

/**
 * Generates a poem based on provided context and language.
 * @param {string} context - The contextual information for the poem.
 * @param {string} language - The language of the poem ("Hindi" or "English").
 * @returns {Promise<Object>} - The poem generated by the model.
 */
async function writePoem(context, language) {
  const prompt = `Compose a ${language} poem based on the following context: "${context}". The poem should be written as if you are one of the greatest poets ever, giving justice to your words with deep meanings and artistic expression.`;
  return await callGeminiFlash(prompt);
}

module.exports = {
  callGeminiFlash,
  summarizeNote,
  writePoem
};
