const Groq = require('groq-sdk');
require('dotenv').config();


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODELS = ["llama3-70b-8192", "llama-3.3-70b-versatile"];
let MODEL = MODELS[0];

module.exports = { groq, MODEL };