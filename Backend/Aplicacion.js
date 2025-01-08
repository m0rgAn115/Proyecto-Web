const { Rol, Usuario, Juego, Partida } = require('./modelos.js');
const sequelize = require('./sequelize');
const express = require('express');
const app = express();
const puerto = 9999;
const Groq = require('groq-sdk');
// Al inicio de tu archivo principal (ejemplo: Aplicacion.js)
require('dotenv').config();


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODELS = ["llama-3.3-70b-versatile","llama3-70b-8192"]

const MODEL = MODELS[1]

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

app.listen(puerto, () => {
  console.log(`Servidor escuchando en el puerto ${puerto}`);
});

// Login de usuario
app.get('/', async (req, res) => {
  const { User, password } = req.query;

  try {
    await sequelize.authenticate();
    const usuario = await Usuario.findOne({
      where: { username: User, password: password },
      include: { model: Rol, as: 'rol'},
    });

    if (usuario) {
      res.status(200).json({ status: 'yes', tipo: usuario.rol.nombre, id: usuario.id });
    } else {
      res.status(404).json({ status: 'no', tipo: 'nodefinido' });
    }
  } catch (err) {
    console.error('Error al conectar o consultar la base de datos:', err);
    res.status(500).json({ status: 'error', message: 'Error al conectar o consultar la base de datos' });
  }
});

// Obtener partidas
app.get('/partidas', async (req, res) => {
  try {
    const partidas = await Partida.findAll({
      attributes: ['id', 'id_usuario', 'id_juego', 'nombre', 'descripcion', 'puntuacion'],
    });
    res.status(200).json(partidas);
  } catch (error) {
    console.error('Error al obtener las partidas:', error);
    res.status(500).json({ error: 'Error al obtener los partidas' });
  }
});

// Obtener juegos
app.get('/juegos', async (req, res) => {
  try {
    const juegos = await Juego.findAll({
      attributes: ['id', 'nombre', 'descripcion'],
    });
    res.status(200).json(juegos);
  } catch (error) {
    console.error('Error al obtener los juegos:', error);
    res.status(500).json({ error: 'Error al obtener los juegos' });
  }
});

// Obtener un juego
app.get('/juegos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const juego = await Juego.findOne({
      where: { id },
      attributes: ['id', 'nombre', 'descripcion'],
    });

    if (juego) {
      res.status(200).json(juego);
    } else {
      res.status(404).json({ error: 'Juego no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener el juego:', error);
    res.status(500).json({ error: 'Error al obtener el juego' });
  }
});

//CRUD
//CREAR PARTIDA
app.post('/partidas', async (req, res) => {
  const { nombre, descripcion, id, usuario } = req.body;

  try {
    // Verificar si los datos necesarios están presentes
    if (!nombre || !descripcion || !id) {
      return res.status(400).json({ status: 'error', message: 'Todos los campos son obligatorios.' });
    }

    // Crear una nueva partida en la base de datos
    const nuevaPartida = await Partida.create({
      nombre,
      descripcion,
      id_juego: id,
      id_usuario: usuario,
    });

    // Devolver una respuesta de éxito
    res.status(201).json({message: 'Partida creada correctamente', partida: nuevaPartida,});
  } catch (err) {
    console.error('Error al crear la partida:', err);
    res.status(500).json({error: 'Hubo un problema al crear la partida. Inténtalo de nuevo.' });
  }
});

//VER PARTIDA
app.get('/partidas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const partida = await Partida.findOne({
      where: { id },
      attributes: ['id', 'nombre', 'descripcion', 'id_juego', 'puntuacion'],
    });
    res.status(200).json(partida);
  } catch (error) {
    console.error('Error al obtener el juego:', error);
    res.status(500).json({ error: 'Error al obtener el juego' });
  }
});

//EDITAR PARTIDA
app.put('/partidas/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, id_juego, puntuacion } = req.body;

  try {
    const partida = await Partida.findOne({ where: { id: id } });

    if(nombre != undefined)
      partida.nombre = nombre;

    if(descripcion != undefined)
      partida.descripcion = descripcion;

    if(id_juego != undefined )
      partida.id_juego = id_juego;

    if(puntuacion != undefined)
      partida.puntuacion = puntuacion;

    await partida.save();

    res.status(200).json({
      message: 'Partida actualizada correctamente',
      id: partida.id,
      nombre: partida.nombre,
      descripcion: partida.descripcion,
      puntuacion: partida.puntuacion,
      id_juego: partida.id_juego,
    });
  } catch (error) {
    console.error('Error al actualizar la partida:', error);
    res.status(500).json({ error: 'Error al actualizar la partida' });
  }
});

// ELIMINAR PARTIDA
app.delete('/partidas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const partida = await Partida.findOne({ where: { id: id } });
    await partida.destroy();
    res.status(200).json({ message: 'Partida eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar el partida:', error);
    res.status(500).json({ error: 'Error al eliminar la partida' });
  }
});

async function sendMessage(message) {
  try {

    // Enviar el historial completo de mensajes al modelo
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: message,
        }
      ],
      model: MODEL,
      response_format: {"type": "json_object"}
    });

    return response.choices[0]?.message?.content
  } catch (error) {
    throw new Error(`Error en Groq: ${error.message}`);
  }
}

async function generarTrivia(tema) {
  try {

    // Enviar el historial completo de mensajes al modelo
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `
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

          `,
        }
      ],
      model: MODEL,
      response_format: {"type": "json_object"}
    });

    return response.choices[0]?.message?.content
  } catch (error) {
    throw new Error(`Error en Groq: ${error.message}`);
  }
}

app.post('/model/send-message', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ status: "error", message: "No se envio un mensaje." });
  }

  const response = await sendMessage(message)
  res.status(200).json({ response });
})

app.post('/model/generar-trivia', async (req, res) => {
  const { tema } = req.body;

  if (!tema) {
    return res.status(400).json({ status: "error", message: "No se envio un tema para generar trivia." });
  }

  const response = await generarTrivia(tema)


  const obj = JSON.parse(response);
  
  res.status(200).json({ preguntas: obj.preguntas, puntuacion: obj.puntuacion });
})

async function generar_temas_trivia() {
  try {

    // Enviar el historial completo de mensajes al modelo
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Eres un experto generador de temas para trivias. Tu tarea es crear una lista diversa y entretenida de 10 temas, cada uno acompañado de emojis relevantes.

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
          `,
        }
      ],
      model: MODEL,
      response_format: {"type": "json_object"}
    });

    return response.choices[0]?.message?.content
  } catch (error) {
    throw new Error(`Error en Groq: ${error.message}`);
  }
}

app.get('/model/generar-temas', async (req, res) => {

  const response = await generar_temas_trivia()


  const obj = JSON.parse(response);
  
  res.status(200).json({ data: obj });
})

// Ejemplo de variable global o compartida que guarda el historial de la conversación
let conversationHistory = [];

// Función de ejemplo para resumir el historial.
// Idealmente podrías usar otra llamada al modelo para resumir inteligentemente.
// Aquí, simplemente tomamos los últimos mensajes y creamos un texto corto.
function resumirHistorial(conversationHistory) {
  const mensajesAsistente = conversationHistory.filter(msg => msg.role === "assistant");
  const ultimaDescripcion = mensajesAsistente.length > 0 ? mensajesAsistente.slice(-1)[0].content : "";
  return `Resumen de la historia hasta ahora: ${ultimaDescripcion.slice(0, 300)}... (Fin del resumen)`;
}

// Ajusta esto a tu modelo y a tus necesidades
async function generarHistoria(tema, comando) {
  try {
    // Límite de mensajes en el historial para antes de resumir
    const MAX_MESSAGES = 8;

    // Mensaje inicial de tipo "system", que solo agregamos si el historial está vacío.
    if (conversationHistory.length === 0) {
      conversationHistory.push({
        role: "system",
        content: `
Eres un creador de historias interactivas. Tu objetivo es continuar la narrativa de manera coherente y fluida, sin repetir información innecesaria. 
Debes avanzar la historia basándote en los mensajes anteriores y el último comando del usuario.
Sigue estas reglas:
1. No repitas descripciones ni acciones que ya hayan ocurrido.
2. Aporta detalles nuevos y relevantes para enriquecer la narrativa.
3. Mantén la coherencia con el contexto e integra las decisiones tomadas.
4. Responde siempre en un **formato JSON** para que la respuesta sea válida.
5. Tu respuesta debe contener las llaves "description" y "options", donde "options" es una lista de objetos con "text" y "command".
      `
      });
    }

    // Si hay un tema y solo tenemos el mensaje de tipo "system", lo agregamos como user
    // para dar contexto inicial y forzar la inclusión de la palabra "json".
    if (conversationHistory.length === 1 && tema) {
      conversationHistory.push({
        role: "user",
        content: `
Crea una historia basada en el tema: "${tema}".
Recuerda: 
- Responde **exclusivamente** en formato JSON, sin añadir texto fuera de las llaves.
- Debes usar las claves "description" y "options".
      `
      });
    }

    // Agregamos el comando del usuario, si existe
    if (comando) {
      conversationHistory.push({
        role: "user",
        content: `El usuario ingresa la acción: ${comando}. Recuerda responder en JSON.`
      });
    }

    // Antes de llamar al modelo, verificamos si se excede el límite de historial
    if (conversationHistory.length > MAX_MESSAGES) {
      const resumen = resumirHistorial(conversationHistory);

      // Reiniciamos el historial con el resumen y los últimos mensajes
      conversationHistory = [
        {
          role: "system",
          content: resumen
        },
        ...conversationHistory.slice(-2) // Mantén los últimos dos mensajes para contexto
      ];
    }

    // Llamamos al modelo de Groq
    const response = await groq.chat.completions.create({
      messages: conversationHistory,
      model: MODEL,
      response_format: { type: "json_object" } // Indicamos que queremos un JSON válido
    });

    const respuesta_modelo = response.choices[0]?.message?.content;

    // Agregamos la respuesta al historial (como si fuera el "assistant")
    conversationHistory.push({
      role: "assistant",
      content: respuesta_modelo,
    });

    // Regresamos la respuesta al cliente
    return respuesta_modelo;
  } catch (error) {
    throw new Error(`Error en Groq: ${error.message}`);
  }
}

module.exports = { generarHistoria, conversationHistory };


app.post('/model/generar-historia', async (req, res) => {

  const { tema, comando, reset } = req.body

  if(reset== true){
    conversationHistory = []
  }


  try {
    const response = await generarHistoria(tema, comando)

    const obj = JSON.parse(response);
  
    res.status(200).json({ data: obj });

  } catch (error) {
    // Aquí manejamos el error, sin "romper" la aplicación
    console.error('Ocurrió un error:', error.message);
    res.status(400).json({ error: error.message });

  }


 
})

async function generar_temas_historias() {
  try {

    // Enviar el historial completo de mensajes al modelo
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `
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
          `,
        }
      ],
      model: MODEL,
      response_format: {"type": "json_object"}
    });

    return response.choices[0]?.message?.content
  } catch (error) {
    throw new Error(`Error en Groq: ${error.message}`);
  }
}

app.get('/model/generar-temas-historias', async (req, res) => {

  const response = await generar_temas_historias()

  const obj = JSON.parse(response);
  
  res.status(200).json({ historias: obj.historias });
})