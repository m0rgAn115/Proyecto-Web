// services/triviaService.js
const groqService = require('./groqService');

class TriviaService {
  async generateTrivia(tema) {
    const prompt = `
      Eres un generador especializado de preguntas de trivia. Tu tarea es crear 5 preguntas desafiantes pero precisas sobre el tema: "${tema}".

          Requisitos para las preguntas:
          - Deben ser claras y concisas
          - Nivel de dificultad moderado
          - Basadas en hechos verificables
          - Sin ambigüedades en las respuestas

          Para cada pregunta deberás generar:
          - 1 respuesta correcta
          - 3 respuestas incorrectas pero plausibles
          - Las opciones deben presentarse en orden aleatorio
          - El índice correcto debe corresponder a la posición (0-3) de la respuesta correcta
          
          La puntuación debe asignarse según estos criterios:
          - Para preguntas muy básicas: 50-150 puntos
          - Para preguntas de conocimiento general: 151-300 puntos
          - Para preguntas especializadas: 301-500 puntos
          - Para preguntas muy específicas o técnicas: 501-1000 puntos
          
          Asigna la puntuación considerando:
          - La especificidad del conocimiento requerido
          - La complejidad de la pregunta
          - El nivel de detalle necesario
          - La rareza o unicidad de la información

          La respuesta debe ser un objeto JSON con la siguiente estructura, sin caracteres de escape:
          {
            "puntuacion": número que representa los puntos por respuesta correcta,
            "preguntas": [
              {
                "pregunta": "string con la pregunta",
                "opciones": ["opción 1", "opción 2", "opción 3", "opción 4"],
                "indice_correcto": número del 0 al 3
              }
            ]
          }

          Devuelve el JSON formateado.

          Ejemplo de respuesta de salida:
          {
            "puntuacion": 450,
            "preguntas": [
              {
                "pregunta": "¿En qué año comenzó la Revolución Mexicana?",
                "opciones": [
                  "1910",
                  "1921",
                  "1900",
                  "1917"
                ],
                "indice_correcto": 0
              },
              {
                "pregunta": "¿Quién fue el último emperador azteca?",
                "opciones": [
                  "Hernán Cortés",
                  "Cuauhtémoc",
                  "Moctezuma I",
                  "Cuitláhuac"
                ],
                "indice_correcto": 1
              },
              {
                "pregunta": "¿Qué presidente mexicano implementó la expropiación petrolera?",
                "opciones": [
                  "Porfirio Díaz",
                  "Benito Juárez",
                  "Lázaro Cárdenas",
                  "Francisco I. Madero"
                ],
                "indice_correcto": 2
              },
              {
                "pregunta": "¿En qué año se firmó la actual Constitución Mexicana?",
                "opciones": [
                  "1810",
                  "1910",
                  "1921",
                  "1917"
                ],
                "indice_correcto": 3
              },
              {
                "pregunta": "¿Cuál fue el nombre original de la Ciudad de México?",
                "opciones": [
                  "Tenochtitlan",
                  "Tlatelolco",
                  "Texcoco",
                  "Tula"
                ],
                "indice_correcto": 0
              }
            ]
          }

          UNICAMENTE DEVUELVE TU RESPUESTA EN FORMATO JSON, VALIDA QUE EL JSON TENGA EL FORMATO CORRECTO.

    `;

    const response = await groqService.sendMessage(prompt);
    return JSON.parse(response);
  }

  async generateTriviaTopics() {
    const prompt = `
      Eres un experto generador de temas para trivias. Tu tarea es crear una lista diversa y entretenida de 10 temas, cada uno acompañado de emojis relevantes.

          Requisitos para los temas:
          - Cada tema debe incluir 1-2 emojis que lo representen visualmente
          - Los temas deben ser diversos y abarcar diferentes categorías:
            * Historia y cultura
            * Entretenimiento (cine, TV, música)
            * Ciencia y tecnología
            * Deportes
            * Literatura
            * Arte
            * Cultura pop
            * Geografía
            * Gastronomía
            * Curiosidades generales

          El formato de respuesta debe ser un objeto JSON exactamente así:
          {
            "temas": [
              "Nombre del tema + emoji(s)"
            ]
          }

          Ejemplo de temas bien formateados:
          - "Imperio Romano ⚔️🏛️"
          - "Mundo Marvel 🦸‍♂️🎬"
          - "Videojuegos Clásicos 🕹️👾"


          Ejemplo de respuesta de salida:

          {
            "temas": [
              "Historia de Japón 🗾⛩️",
              "Series Netflix 📺🍿",
              "Sistema Solar 🌎🌠",
              "Copa Mundial ⚽🏆",
              "Mitología Griega ⚡🏺",
              "Arte Renacentista 🎨🖼️",
              "Rock Clásico 🎸🤘",
              "Cultura Maya 🏯🗿",
              "Cocina Italiana 🍝🇮🇹",
              "Inventos Famosos 💡⚡"
            ]
          }

          UNICAMENTE DEVUELVE UN JSON CORRECTAMENTE FORMATEADO.
    `;

    const response = await groqService.sendMessage(prompt);
    return JSON.parse(response);
  }
}

module.exports = new TriviaService();