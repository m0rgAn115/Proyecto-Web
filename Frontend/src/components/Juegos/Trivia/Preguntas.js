import axios from 'axios'
import React, { useEffect, useState } from 'react'
import PulsingMicButton from '../../PulsingMicButton'
import * as tf from "@tensorflow/tfjs"
import { useParams, useHistory } from "react-router-dom"; 

export const Preguntas = ({ tema, id_partida, hora_inicio }) => {

  const [preguntas, setpreguntas] = useState(undefined)
  const [indice_pregunta_actual, set_indice_pregunta_actual] = useState(0)
  const [model, setmodel] = useState(undefined)
  const [labels, setlabels] = useState([])
  const [es_correcta, set_es_correcta] = useState(undefined)
  const [respuestas, setrespuestas] = useState([])
  const [terminado, setterminado] = useState(false)
  const [puntos_por_pregunta, setpuntos_por_pregunta] = useState(0)

  const [duracion, setduracion] = useState(0)
  const [puntuacion, setpuntuacion] = useState(0)

  const history = useHistory();

  useEffect(() => {
    loadModel()
  }, [])

  const loadModel = async () => {
      const recognizer = speechCommands.create('BROWSER_FFT');
      console.log("Model Loaded")
      await recognizer.ensureModelLoaded()
      setmodel(recognizer)
      setlabels( recognizer.wordLabels())
  }

  const validar_comando = (comando) => {
    switch(comando){
      case "up":  return preguntas[indice_pregunta_actual].indice_correcto == 0
      case "right":  return preguntas[indice_pregunta_actual].indice_correcto == 1
      case "down":  return preguntas[indice_pregunta_actual].indice_correcto == 2
      case "left":  return preguntas[indice_pregunta_actual].indice_correcto == 3
      default: {
        return undefined
      }
    }
  }

  const validar_respuesta = (respuesta) => {
    if(respuesta != undefined){
      model.stopListening()
      
    if( respuesta ){
      setrespuestas((prev) => [...prev, true])
      set_es_correcta(true)
      setTimeout(() => set_es_correcta(undefined), 2000)
    }else {
      setrespuestas((prev) => [...prev, false])
      set_es_correcta(false)
      setTimeout(() => set_es_correcta(undefined), 2000)
    }

    console.log("indice: ", indice_pregunta_actual, "lenght: ", preguntas.length);
    

    if(indice_pregunta_actual < preguntas.length - 1){
      set_indice_pregunta_actual((prev) => prev+1)
    }else {
      setterminado(true)
      const tiempo = obtener_duracion_partida()
      const puntuacion = obtener_puntacion()
      setduracion(tiempo)
      setpuntuacion(puntuacion)
      guardar_partida(puntuacion,tiempo)

    }
     
    }
  }

  const validar = (comando) => {
    console.log(comando);
    
    const respuesta = validar_comando(comando)

    console.log("respuesta:", respuesta);

    validar_respuesta(respuesta)
  }
  
  const recognizeCommands = async () => {

    model.listen(
      (result) => {
        const tensor_resultados = tf.tensor(result.scores);
        const maxValue = tensor_resultados.argMax().dataSync()[0];
        const comando = labels[maxValue];

        console.log("comando: ", comando);
  
        validar(comando)
        
      },
      { includeSpectrogram: true, probabilityThreshold: 0.90 }
    );
  };


  useEffect(() => {
    obtener_preguntas()
  
  }, [tema])

  const obtener_preguntas = () => {
    axios
      .post("http://localhost:9999/model/generar-trivia",
      {
        tema
      }) 
      .then((response) => {
        const preguntas_obtenidas = response.data.preguntas
        const puntos = response.data.puntuacion
        console.log(preguntas_obtenidas);
        console.log(response);
        console.log(puntos);
        if(preguntas_obtenidas != undefined)
          setpreguntas(preguntas_obtenidas)

        if(puntos != undefined)
          setpuntos_por_pregunta(puntos)



      })
      .catch((err) => {
        console.error("Error al obtener los temas sugeridos:", err);
      });
  }

  const obtener_comando_por_indice = (index) => {
    switch(index){
      case 0: return "up"
      case 1: return "right"
      case 2: return "down"
      case 3: return "left"
      default: return "Up"

    }
  }

  const obtener_color_por_indice = (index, val = 0) => {
    if( val == 0){
      switch(index){
        case 0: return "bg-green-200"
        case 1: return "bg-red-200"
        case 2: return "bg-yellow-200"
        case 3: return "bg-blue-200"
        default: return "bg-green-200"

      }
    }else {
      switch(index){
        case 0: return "bg-green-300"
        case 1: return "bg-red-300"
        case 2: return "bg-yellow-300"
        case 3: return "bg-blue-300"
        default: return "bg-green-300"

      }
    }

  }

  const obtener_mensaje_final = () => {
    const porcentaje = respuestas.filter(value => value === true).length / respuestas.length

    switch (true) {
      case porcentaje === 0:
          return "¡No diste una! 😭 ¡La próxima vez será mejor!";
          
      case porcentaje <= 0.10:
          return "¡Hey! Una es mejor que ninguna 🌱 ¡Sigue intentando!";
          
      case porcentaje <= 0.30:
          return "¡Vas por buen camino! 🌟 Un poco más de práctica y lo dominarás.";
          
      case porcentaje <= 0.50:
          return "¡No está mal! 👍 Ya dominas la mitad del tema.";
          
      case porcentaje <= 0.70:
          return "¡Muy bien! 🎯 Estás dominando el tema.";
          
      case porcentaje <= 0.90:
          return "¡Excelente trabajo! 🎉 ¡Casi perfecto!";
          
      case porcentaje <= 0.99:
          return "¡Impresionante! 🌟 ¡Eres casi un experto!";
          
      case porcentaje === 1:
          return "¡PERFECTO! 🏆 ¡Has alcanzado la excelencia!";
          
      default:
          return "¡Sigue intentando! 💪";
      }
  }

  const obtener_puntacion = ( ) => {
    return respuestas.filter(value => value === true).length * puntos_por_pregunta
  }

  const obtener_duracion_partida = () => {
    // Convierte las horas a objetos Date
    const hora_fin = new Date().toLocaleTimeString("en-GB");

    console.log("hora inicio: ", hora_inicio);
    console.log("hora fin: ", hora_fin);
    
    const date1 = new Date(`1970-01-01T${hora_inicio}Z`);
    const date2 = new Date(`1970-01-01T${hora_fin}Z`);

    // Obtén la diferencia en milisegundos y conviértela a segundos
    const differenceInSeconds = (date2 - date1) / 1000;

    console.log("timepo: ", differenceInSeconds);
    

    return differenceInSeconds;
  }

  const guardar_partida = (puntuacion,tiempo) => {
    if (id_partida) {
      axios
      .put(`http://localhost:9999/partidas/${id_partida}`, {
        puntuacion: puntuacion,
        duracion: tiempo
      }).then(() => {
        console.log("Partida Actualizada Correctamente!");
        
      })
      .catch((err) => {
        console.error("Error al actualizar la partida", err);
      });
    }else {
      console.error("No se encuentro un id de partida")
    }
  }

  return (
    <div className='relative bg-slate-900 h-screen w-full flex flex-col items-center justify-around'>
    <button className=" font-bold hover:scale-[1.03] flex w-full items-left mx-10 text-white" onClick={() => history.push(`/Proyecto/administrador`)}>
      <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 text-white transform scale-x-[-1]" width={12} height={24} viewBox="0 0 12 24"><path fill="currentColor" fillRule="evenodd" d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414"></path></svg>
      Regresar
    </button>
    {
      terminado ?
        <div className='text-white font-mono' >
          <p className='font-2xl' > { obtener_mensaje_final() } </p>          
          <p className='font-lg' > Tema: {tema} </p> 
          <p className='font-lg' > Puntuacion: <span className='font-bold' > { puntuacion } </span> </p> 
          <p className='font-lg' > Duracion (segundos): <span className='font-bold' > { duracion } </span> </p> 

        </div>         
      :

      <>
      <div className='w-4/5 bg-white shadow-[0_0_20px_rgba(255,255,255,1)] p-3 rounded-md
                      text-xl text-center font-mono
      ' >
        {
          preguntas && 
            preguntas[indice_pregunta_actual].pregunta
        }
      </div>

      <div className='grid grid-cols-2 gap-y-2 gap-x-4 w-3/5 mx-auto' >
          {
            preguntas &&
              preguntas[indice_pregunta_actual].opciones.map((opc, index) => (
                <div className={`flex ${ obtener_color_por_indice(index, 0)} `}  
                >

                  <div className={`w-1/5 flex flex-col items-center justify-center  ${ obtener_color_por_indice(index,1)}`} 
                    onClick={() => validar(obtener_comando_por_indice(index))}
                  >
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          transform: index === 1 ? 'rotate(90deg)' : index === 2 ? 'rotate(180deg)' : index === 3 ? 'rotate(270deg)' : 'none'
                        }}

                        className='w-1/2 h-1/2 '
                        viewBox="0 0 24 24"
                      >
                        <path fill="currentColor" d="M12 21c-1.654 0-3-1.346-3-3v-4.764c-1.143 1.024-3.025.979-4.121-.115a3 3 0 0 1 0-4.242L12 1.758l7.121 7.121a3 3 0 0 1 0 4.242c-1.094 1.095-2.979 1.14-4.121.115V18c0 1.654-1.346 3-3 3M11 8.414V18a1.001 1.001 0 0 0 2 0V8.414l3.293 3.293a1.023 1.023 0 0 0 1.414 0a1 1 0 0 0 0-1.414L12 4.586l-5.707 5.707a1 1 0 0 0 0 1.414a1.023 1.023 0 0 0 1.414 0z"></path>
                      </svg>
                      <p className='font-bold' > {obtener_comando_por_indice(index)} </p>
                      
                  </div>
                  <p key={index}
                    className={`w-4/5 inline-flex rounded-md p-5 items-center justify-center text-xl font-mono
                         
                          `}
                  > 
                    {
                      opc
                    }
                  </p>
              </div>
              

            ))
          }
      </div>

      <div className='mx-auto w-full mt-3 flex flex-col items-center justify-center' >
          <PulsingMicButton onClick={recognizeCommands} />

          <p className='text-white mt-3' >Diga una opcion!</p>
        </div>

        {es_correcta != undefined && (
            <div className={`absolute opacity-90 top-20 left-1/2 transform -translate-x-1/2 text-xl -translate-y-1/2 p-4 rounded shadow-lg text-white ${
              es_correcta== true ? "bg-green-500" : "bg-red-500"
            }`}>
              <p className="text-center  font-bold">
                { es_correcta== true ? "Respuesta Correcta! ✅" : "Respuesta Incorrecta! ❌"}
              </p>
            </div>
          )}
      </>
      }
      
    </div>
  )
}
