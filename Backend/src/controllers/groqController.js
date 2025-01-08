const {
  sendMessage,
  generarTrivia,
  resetConversationHistory,
  getConversationHistory,
} = require('../services/groqService');

async function handleSendMessage(req, res) {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ status: 'error', message: 'No se envió un mensaje.' });
  }

  try {
    const response = await sendMessage(message);
    res.status(200).json({ response, history: getConversationHistory() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function handleGenerarTrivia(req, res) {
  const { tema } = req.body;
  if (!tema) {
    return res.status(400).json({ status: 'error', message: 'No se envió un tema para generar trivia.' });
  }

  try {
    const response = await generarTrivia(tema);
    res.status(200).json({ response, history: getConversationHistory() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function handleResetHistory(req, res) {
  resetConversationHistory();
  res.status(200).json({ message: 'Historial reseteado.', history: getConversationHistory() });
}

module.exports = { handleSendMessage, handleGenerarTrivia, handleResetHistory };