// controllers/triviaController.js
const triviaService = require('../services/triviaService');

class TriviaController {
  async generateTrivia(req, res) {
    try {
      const { tema } = req.body;

      if (!tema) {
        return res.status(400).json({ 
          status: "error", 
          message: "No se envió un tema para generar trivia." 
        });
      }

      const response = await triviaService.generateTrivia(tema);
      res.status(200).json({ 
        preguntas: response.preguntas, 
        puntuacion: response.puntuacion 
      });
    } catch (error) {
      res.status(500).json({ 
        status: "error", 
        message: error.message 
      });
    }
  }

  async generateTopics(req, res) {
    try {
      const response = await triviaService.generateTriviaTopics();
      res.status(200).json({ data: response });
    } catch (error) {
      res.status(500).json({ 
        status: "error", 
        message: error.message 
      });
    }
  }
}

module.exports = new TriviaController();