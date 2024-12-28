import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; 
import axios from "axios";

const VerPartida = () => {
  const { partidaId } = useParams(); 
  const [partidaData, setPartidaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (partidaId) {
      setLoading(true); 
      axios
        .get(`http://localhost:9999/partidas/${partidaId}`)
        .then((response) => {
          setPartidaData(response.data); 
          setLoading(false); 
        })
        .catch((err) => {
          console.error("Error al obtener los datos de la partida", err);
          setError("Error al obtener los datos de la partida");
          setLoading(false); 
        });
    }
  }, [partidaId]); 

  return (
    <div className="bg-[#0B294C] min-h-screen flex justify-center items-center p-5">
      <div className="max-w-[600px] mx-auto p-5 bg-white rounded-lg shadow-lg text-center">
        <div className="mb-5">
          <h2 className="text-2xl text-gray-800 font-bold mb-2 font-jockey">Ver Partida</h2>
          <p className="text-gray-600">Visualiza los detalles de la partida.</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 border border-red-500 rounded-md p-3 mb-5">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500"></div>
          </div>
        ) : (
          partidaData && (
            <form className="space-y-5">
              {/* ID de la partida */}
              <div className="text-left">
                <label className="text-gray-700 font-medium">ID de la Partida:</label>
                <input
                  type="text"
                  value={partidaData.id_partida}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-md mt-2 bg-gray-100"
                />
              </div>

              {/* Nombre de la partida */}
              <div className="text-left">
                <label className="text-gray-700 font-medium">Nombre de la Partida:</label>
                <input
                  type="text"
                  value={partidaData.nombrePartida}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-md mt-2 bg-gray-100"
                />
              </div>

              {/* Descripción de la partida */}
              <div className="text-left">
                <label className="text-gray-700 font-medium">Descripción:</label>
                <textarea
                  value={partidaData.descripcion}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-md mt-2 bg-gray-100"
                />
              </div>

              {/* Juego seleccionado */}
              <div className="text-left">
                <label className="text-gray-700 font-medium">Juego Seleccionado:</label>
                <input
                  type="text"
                  value={partidaData.juegoSeleccionado}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-md mt-2 bg-gray-100"
                />
              </div>

              {/* Puntuación */}
              <div className="text-left">
                <label className="text-gray-700 font-medium">Puntuación:</label>
                <input
                  type="text"
                  value={partidaData.puntuacion || "Sin puntuación aún"}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-md mt-2 bg-gray-100"
                />
              </div>

              <div className="flex gap-5 justify-center">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded-md"
                >
                  Regresar
                </button>
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
};

export default VerPartida;
