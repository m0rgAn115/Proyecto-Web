const Groq = require('groq-sdk');
const express = require('express');
const router = express.Router();

const triviaController = require('../controllers/triviaController');
const storyController = require('../controllers/storyController');

router.post('/generar-trivia', triviaController.generateTrivia);
router.get('/generar-temas', triviaController.generateTopics);

// Story routes
router.post('/generar-historia', storyController.generateStory);
router.get('/generar-temas-historias', storyController.generateTopics);

module.exports = router;
