const groqService = require('./groqService');

class StoryService {
  constructor() {
    this.conversationHistory = [];
    this.MAX_MESSAGES = 8;
  }

  summarizeHistory() {
    const assistantMessages = this.conversationHistory.filter(msg => msg.role === "assistant");
    const lastDescription = assistantMessages.length > 0 ? assistantMessages.slice(-1)[0].content : "";
    return `Resumen de la historia hasta ahora: ${lastDescription.slice(0, 300)}... (Fin del resumen)`;
  }

  resetHistory() {
    this.conversationHistory = [];
  }

  async generateStory(tema, comando) {
    if (this.conversationHistory.length === 0) {
      this.conversationHistory.push({
        role: "system",
        content: `Eres un creador de historias interactivas. Tu objetivo es continuar la narrativa de manera coherente y fluida, sin repetir información innecesaria. 
Debes avanzar la historia basándote en los mensajes anteriores y el último comando del usuario.
Sigue estas reglas:
1. No repitas descripciones ni acciones que ya hayan ocurrido.
2. Aporta detalles nuevos y relevantes para enriquecer la narrativa.
3. Mantén la coherencia con el contexto e integra las decisiones tomadas.
4. Responde siempre en un **formato JSON** para que la respuesta sea válida.
5. Tu respuesta debe contener las llaves "description" y "options", donde "options" es una lista de objetos con "text" y "command".`
      });
    }

    if (this.conversationHistory.length === 1 && tema) {
      this.conversationHistory.push({
        role: "user",
        content: `Crea una historia basada en el tema: "${tema}".
Recuerda: 
- Responde **exclusivamente** en formato JSON, sin añadir texto fuera de las llaves.
- Debes usar las claves "description" y "options".`
      });
    }

    if (comando) {
      this.conversationHistory.push({
        role: "user",
        content: `El usuario ingresa la acción: ${comando}. Recuerda responder en JSON.`
      });
    }

    if (this.conversationHistory.length > this.MAX_MESSAGES) {
      const resumen = this.summarizeHistory();
      this.conversationHistory = [
        { role: "system", content: resumen },
        ...this.conversationHistory.slice(-2)
      ];
    }

    const response = await groqService.createCompletion(this.conversationHistory);
    this.conversationHistory.push({
      role: "assistant",
      content: response
    });

    return JSON.parse(response);
  }

  async generateStoryTopics() {
    const prompt = `
       Eres un experto creador de historias interactivas donde los jugadores pueden tomar decisiones. Tu tarea es generar una lista de 10 emocionantes escenarios narrativos, cada uno con emojis representativos.

          Requisitos para las historias:
          - Cada historia debe incluir 2-3 emojis que representen su temática
          - Las historias deben ser diversas y cubrir diferentes géneros:
            * Fantasía y magia ⚔️🧙‍♂️
            * Ciencia ficción 🚀👽
            * Aventuras y exploración 🗺️🏃‍♂️
            * Misterio y crimen 🔍🕵️‍♂️
            * Terror y suspenso 👻😱
            * Romance y drama ❤️😢
            * Historia alternativa 📜🌍
            * Supervivencia 🏕️💪
            * Comedia 😂🎭
            * Vida cotidiana 🏠💼

          El formato de respuesta debe ser un objeto JSON con esta estructura:
          {
            "historias": [
              {
                "titulo": "Nombre de la historia + emoji(s)",
                "descripcion": "Breve descripción del escenario inicial",
                "genero": "Género principal de la historia + emoji(s)"
              }
            ]
          }

          Ejemplos de historias bien formateadas:
          {
            "historias": [
              {
                "titulo": "La Academia de Magia 🔮✨🏰",
                "descripcion": "Te despiertas en tu primer día en la prestigiosa Academia Arcana. Descubres que tienes un don único para la magia, pero también un misterioso destino que cumplir.",
                "genero": "Fantasía y magia ⚔️🧙‍♂️"
              },
              {
                "titulo": "Colonos de Marte 🚀👨‍🚀🔴",
                "descripcion": "Eres parte de la primera colonia humana en Marte. Una tormenta solar amenaza la base y debes tomar decisiones cruciales para la supervivencia.",
                "genero": "Ciencia ficción 🚀👽"
              },
              {
                "titulo": "El Último Tren 🚂🌙",
                "descripcion": "Te encuentras en un misterioso tren nocturno donde los pasajeros comienzan a desaparecer. Debes descubrir qué está sucediendo antes de que sea demasiado tarde.",
                "genero": "Misterio y suspense 🔍😱"
              },
              {
                "titulo": "Startup Dreams 💻💡",
                "descripcion": "Has heredado una startup en quiebra. Con solo un mes de fondos restantes, debes tomar decisiones empresariales cruciales para salvar la compañía.",
                "genero": "Vida cotidiana 🏠💼"
              },
              {
                "titulo": "La Expedición Perdida 🗺️🏔️",
                "descripcion": "Lideras una expedición en busca de una antigua civilización en el Himalaya. Cada decisión puede significar la diferencia entre el descubrimiento y el desastre.",
                "genero": "Aventuras y exploración 🗺️🏃‍♂️"
              }
            ]
          }

          ÚNICAMENTE DEVUELVE UN JSON CORRECTAMENTE FORMATEADO.
    `;

    const response = await groqService.sendMessage(prompt);
    return JSON.parse(response);
  }
}

module.exports = new StoryService();