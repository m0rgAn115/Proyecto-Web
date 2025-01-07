import React, { useEffect, useState } from 'react'
import axios from "axios";
import { Preguntas } from './Trivia/Preguntas';
import { useParams, useHistory } from "react-router-dom"; 


export const Trivia = () => {

  const [temas_sugeridos, settemas_sugeridos] = useState([])
  const [input_value, setinput_value] = useState("")
  const [juego_iniciado, set_juego_iniciado] = useState(false)

  const [is_loading, setis_loading] = useState(true)
  const [partidaData, setpartidaData] = useState([])

  const { idPartida } = useParams(); 
  
  const history = useHistory();

  

  useEffect(() => {
    cargar_datos()
  
  }, [])
  
  
  const obtener_datos_partida = async () => {
    axios
    .get(`http://localhost:9999/partidas/${idPartida}`)
    .then((response) => {
      console.log("data: ",response.data);
      
      setpartidaData(response.data);
      return response.data.puntuacion
    })
    .catch((err) => {
      console.error("Error al obtener los datos de la partida", err);
      setError("Error al obtener los datos de la partida");
      return undefined
    })
    
  }

  const obtener_temas_sugeridos = async () => {
    axios
      .get("http://localhost:9999/model/generar-temas") // Asumiendo que esta es la ruta para obtener los juegos
      .then((response) => {
        const temas = response.data.data.temas
        console.log(temas);
        settemas_sugeridos(temas)
      })
      .catch((err) => {
        console.error("Error al obtener los temas sugeridos:", err);
      });
  }

  const cargar_datos = async () => {
    obtener_datos_partida().then((p) => {
      if(p == undefined){
       obtener_temas_sugeridos().then(() => setis_loading(false) )
       console.log("entro");
       

      }
      else
        setis_loading(false)
    })
  }

  const on_jugar = () => {
    set_juego_iniciado(true)
  }


  if(juego_iniciado) 
    return (
      <Preguntas tema={input_value} id_partida={partidaData.id} />
    )


  return (
    <div className='bg-slate-900 h-screen w-full flex flex-col items-center justify-around' >
      <button className="absolute top-10 left-10 m-0 font-bold hover:scale-[1.03] flex items-center text-white" onClick={() => history.push(`/Proyecto/administrador`)}>
        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 text-white transform scale-x-[-1]" width={12} height={24} viewBox="0 0 12 24"><path fill="currentColor" fillRule="evenodd" d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414"></path></svg>
        Regresar
      </button>
      <div>
        <h1  
            className="text-[50px] font-bold text-center text-purple-600 "
            style={{ textShadow: "0 0 30px rgba(82, 21, 213, 1), 0 0 60px rgba(82, 21, 213, 0.5)" }}
          >
           ∞
        </h1>
        <h1  
          className="text-4xl font-bold text-center text-purple-600 font-mono"
          style={{ textShadow: "0 0 30px rgba(82, 21, 213, 1), 0 0 60px rgba(82, 21, 213, 0.5)" }}
        >
          Trivia Infinita
        </h1>
        <h2 className='text-lg text-white text-center font-mono' >Responda trivias de cualquier tema</h2>
      </div>


      {

        is_loading == true ?
          <div className='text-white text-center mx-auto' >
              <svg xmlns="http://www.w3.org/2000/svg" className='text-white w-1/2 text-center mx-auto ' viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeDasharray={16} strokeDashoffset={16} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c4.97 0 9 4.03 9 9"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.2s" values="16;0"></animate><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"></animateTransform></path></svg>
              <p className='font-mono' >Cargando...</p>
          </div>

        :

        partidaData.puntuacion !== undefined &&
        partidaData.puntuacion !== null ? (
        (() => {
          return (
            <div className="text-white font-mono text-center ">
              <h2 className="text-3xl">Juego Terminado</h2>
              <h3 className="text-xl">Nombre de la Partida: {partidaData.nombre}</h3>
              <h3 className="text-xl">Puntuacion: {partidaData.puntuacion}</h3>
            </div>
          );
        })()
      )
          :

          <>


      {/* Caja de opciones sugeridas de trivia */}
      <div>
        <div className="grid grid-cols-5 gap-y-2 gap-x-4 w-3/5 mx-auto">
          {temas_sugeridos.map((t, index) => (
            <p
              onClick={() => setinput_value(t)}
              key={index}
              className="inline-flex transition-transform duration-300 items-center 
                          hover:scale-[1.02] justify-center text-center px-3 shadow-[0_0_20px_rgba(255,255,255,1)] 
                          cursor-pointer text-sm py-2 bg-white text-black rounded-md"
            >
            {t}
          </p>
          
          ))}
        </div>
      </div>


      {/* Caja con input y boton para comenzar trivia */}
      <div className='flex flex-col w-full items-center' >
        <input
          className=' flex-3 bg-white shadow-[0_0_20px_rgba(255,255,255,1)] rounded-md border-white p-3 w-1/4 text-center text-black'
          placeholder='Ingrese un tema para jugar trivia...'
          value={input_value}
          onChange={e => setinput_value(e.target.value)}
        />

        <button className='
          mt-5
          text-white font-bold py-2 px-5 my-4 rounded-md
          hover:scale-[1.02] bg-green-600 text-xl
          hover:bg-green-500
          transition-transform duration-500 transition-colors transition-shadow ease-in-out
          '
          
          style={{ boxShadow: "0 0 30px rgba(16, 242, 69, 1)" }}

          onClick={on_jugar}
          >
          JUGAR
        </button>


      </div>

      </>

      }

      
    </div>
  )
}
