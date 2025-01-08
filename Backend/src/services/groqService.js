const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODELS = ["llama3-70b-8192", "llama-3.3-70b-versatile"];
const MODEL = MODELS[0];

class GroqService {
  async sendMessage(message) {
    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: "user", content: message }],
        model: MODEL,
        response_format: { type: "json_object" }
      });
      return response.choices[0]?.message?.content;
    } catch (error) {
      throw new Error(`Error in Groq: ${error.message}`);
    }
  }

  async createCompletion(messages) {
    try {
      const response = await groq.chat.completions.create({
        messages,
        model: MODEL,
        response_format: { type: "json_object" }
      });
      return response.choices[0]?.message?.content;
    } catch (error) {
      throw new Error(`Error in Groq: ${error.message}`);
    }
  }
}

module.exports = new GroqService();