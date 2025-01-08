import axios from 'axios'
import React, { useEffect, useState } from 'react'
import PulsingMicButton from '../../PulsingMicButton'
import * as tf from "@tensorflow/tfjs"
import { useParams, useHistory } from "react-router-dom"; 

export const Historia = ({ tema, id_partida, hora_inicio }) => {

  const [model, setmodel] = useState(undefined)
  const [labels, setlabels] = useState([])
  const [terminado, setterminado] = useState(false)

  const [cantidad_respuestas, set_cantidad_respuestas] = useState(0);

  const [duracion, setduracion] = useState(0)

  const history = useHistory();

  // Estados de historia
  const [historia_data, sethistoria_data] = useState(undefined)

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

  const convertir_respuesta = (comando) => {
    console.log("len", historia_data.options.length);
    
    switch(comando){
      case "up": 
        return historia_data.options.length >= 1 ? historia_data.options[0].text : undefined;
      case "right":
        return historia_data.options.length >= 2 ? historia_data.options[1].text : undefined;
      case "down":
        return historia_data.options.length >= 3 ? historia_data.options[2].text : undefined;
      case "left":
        return historia_data.options.length >= 4 ? historia_data.options[3].text : undefined;
      default: {
        console.log("entro undf");
        return undefined;
      }
    }
}

  const validar_respuesta = (respuesta) => {
    if(respuesta != undefined){
      model.stopListening()

      console.log("respuesta: ", respuesta);
      
      
      enviar_respuesta(respuesta)
    }
  }
  
  const recognizeCommands = async () => {

    model.listen(
      (result) => {
        const tensor_resultados = tf.tensor(result.scores);
        const maxValue = tensor_resultados.argMax().dataSync()[0];
        const comando = labels[maxValue];

        console.log("comando: ", comando);
  
        const respuesta = convertir_respuesta(comando)
        console.log("respuesta: ", respuesta);

        

        validar_respuesta(respuesta)
        
      },
      { includeSpectrogram: true, probabilityThreshold: 0.90 }
    );
  };


  useEffect(() => {
    iniciar_historia()
  
  }, [tema])

  const iniciar_historia = () => {
    axios
      .post("http://localhost:9999/model/generar-historia",
      {
        reset: true,
        tema
      }) 
      .then((response) => {
        const respuesta = response.data.data
        console.log(respuesta);
        
        if(respuesta != undefined)
          sethistoria_data(respuesta)

      })
      .catch((err) => {
        console.error("Error al obtener los temas sugeridos:", err);
      });
  }

  const enviar_respuesta = (comando) => {
    console.log("comando: ", comando);
    set_cantidad_respuestas((prev) => prev+1)
    
    axios
      .post("http://localhost:9999/model/generar-historia",
      {
        comando
      }) 
      .then((response) => {
        const respuesta = response.data.data
        console.log(respuesta);
        
        
        if(respuesta != undefined)
          sethistoria_data(respuesta)
      })
      .catch((err) => {
        console.error("Error el enviar la respuesta:", err);
      });
  }


  const obtener_comando_por_indice = (index) => {
    switch(index){
      case 0: return "up"
      case 1: return "right"
      case 2: return "down"
      case 3: return "left"
      default: return "up"

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


  const obtener_puntacion = ( ) => {
    return cantidad_respuestas*100
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
  const guardar_partida = (tiempo) => {
    if (id_partida) {
      axios
      .put(`http://localhost:9999/partidas/${id_partida}`, {
        puntuacion: obtener_puntacion(),
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

  const on_terminar_juego = () => {
    console.log(cantidad_respuestas);

    const tiempo = obtener_duracion_partida()
    setduracion(tiempo)

    guardar_partida(tiempo)
    setterminado(true)

    
  }

  return (
    <div className='relative bg-slate-900 h-screen w-full flex flex-col items-center justify-around'>
   
    {
      terminado ?
        <div className='text-white font-mono' >
          <p className='font-2xl' >  Haz tenido una historia interesante!  </p>          
          <p className='font-lg' > Tema: {tema} </p> 
          <p className='font-lg' > Puntuacion: <span className='font-bold' > { obtener_puntacion() } </span> </p> 
          <p className='font-lg' > Duracion (segundos): <span className='font-bold' > { duracion } </span> </p> 
          <button 
          className="font-bold hover:scale-[1.03] mt-10 flex items-center text-white" 
          onClick={() => history.push(`/Proyecto/administrador`)}
            >
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 text-white transform scale-x-[-1]" width={12} height={24} viewBox="0 0 12 24">
            <path fill="currentColor" fillRule="evenodd" d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414"></path>
          </svg>
          Regresar
        </button>
        </div>         
      :

      <>

      <div className='flex justify-between px-10 w-full' >

        <button 
          className="font-bold hover:scale-[1.03] flex items-center text-white" 
          onClick={() => history.push(`/Proyecto/administrador`)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 text-white transform scale-x-[-1]" width={12} height={24} viewBox="0 0 12 24">
            <path fill="currentColor" fillRule="evenodd" d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414"></path>
          </svg>
          Regresar
        </button>


        <button 
          className=" m-0 font-bold hover:scale-[1.03] flex items-center text-white" 
          onClick={() => on_terminar_juego()}
        >
          Terminar Partida
        </button>

      </div>


      <div className='w-4/5 bg-white shadow-[0_0_20px_rgba(255,255,255,1)] p-2 rounded-md
                      text-sm text-justify font-mono
      ' >
        {
          historia_data!== undefined && 
            historia_data.description
        }
      </div>

      <div className={`grid mx-auto grid-cols-2 gap-y-2 gap-x-5 w-3/5 place-items-center`}>
          {
             historia_data!== undefined && historia_data.options !== undefined &&
              historia_data.options.map((opc, index) => (
                <div className={`flex ${ obtener_color_por_indice(index, 0)} `}  

                  onClick={() => validar_respuesta(opc.text)}
                >

                  <div className={`w-1/5 h-auto flex flex-col items-center justify-center  ${ obtener_color_por_indice(index,1)}`}  >
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
                      <p className='font-bold text-sm' > {obtener_comando_por_indice(index)} </p>
                      
                  </div>
                  <p key={index}
                    className={`w-4/5 inline-flex rounded-md p-1 items-center justify-center text-sm font-mono
                         
                          `}
                  > 
                    {
                      opc.text
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

      </>
      }
      
    </div>
  )
}
