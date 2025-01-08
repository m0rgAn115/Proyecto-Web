const storyService = require('../services/storyService');

class StoryController {
  async generateStory(req, res) {
    try {
      const { tema, comando, reset } = req.body;

      if (reset) {
        storyService.resetHistory();
      }

      const response = await storyService.generateStory(tema, comando);
      res.status(200).json({ data: response });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async generateTopics(req, res) {
    try {
      const response = await storyService.generateStoryTopics();
      res.status(200).json({ historias: response.historias });
    } catch (error) {
      res.status(500).json({ 
        status: "error", 
        message: error.message 
      });
    }
  }
}

module.exports = new StoryController();