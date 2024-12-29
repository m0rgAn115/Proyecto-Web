
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const VerPartida = () => {
  const { partidaId } = useParams();
  const [partidaData, setPartidaData] = useState(null);
  const [juegoData, setJuegoData] = useState(null);
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
          setError("Error al obtener los datos de la partida");
          setLoading(false);
        });
    }
  }, [partidaId]);

  useEffect(() => {
    if (partidaData?.id_juego) {
      setLoading(true);
      axios
        .get(`http://localhost:9999/juegos/${partidaData.id_juego}`)
        .then((response) => {
          setJuegoData(response.data);
          setLoading(false);
        })
        .catch(() => {
          setError("Error al obtener los datos del juego");
          setLoading(false);
        });
    }
  }, [partidaData?.id_juego]);

  return (
    <div className="bg-[#0B294C] min-h-screen flex justify-center items-center p-5">
      <div className="max-w-[800px] w-full bg-white p-6 rounded-lg shadow-lg">
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold text-gray-800">Ver Partida</h2>
          <p className="text-gray-600">Visualiza los detalles de la partida.</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 text-center border border-red-500 rounded-md p-3 mb-5">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center">
            <div className="spinner-border animate-spin w-8 h-8 border-4 border-blue-500 rounded-full"></div>
          </div>
        ) : (
          partidaData && (
            <div className="grid grid-cols-2 gap-5">
            {/* Lado izquierdo */}
            <div className="col-span-1">
              <form className="space-y-4">
                <div>
                  <label className="block text-left text-gray-700 font-medium">
                    ID de la Partida:
                  </label>
                  <input
                    type="text"
                    value={partidaData.id || ""}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 mt-1"
                  />
                </div>

                <div>
                  <label className="block text-left text-gray-700 font-medium">
                    Nombre de la Partida:
                  </label>
                  <input
                    type="text"
                    value={partidaData.nombre || ""}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 mt-1"
                  />
                </div>

                <div>
                  <label className="block text-left text-gray-700 font-medium">
                    Descripción:
                  </label>
                  <textarea
                    value={partidaData.descripcion || ""}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 mt-1"
                  />
                </div>
              </form>
            </div>

            {/* Lado derecho */}
            <div className="col-span-1">
              <form className="space-y-4">
                <div>
                  <label className="block text-left text-gray-700 font-medium">
                    Juego Seleccionado:
                  </label>
                  <input
                    type="text"
                    value={juegoData.nombre || "N/A"}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 mt-1"
                  />
                </div>

                <div>
                  <label className="block text-left text-gray-700 font-medium">
                    Puntuación:
                  </label>
                  <input
                    type="text"
                    value={partidaData.puntuacion || "Sin puntuación"}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 mt-1"
                  />
                </div>
              </form>
            </div>

            {/* Botón que ocupa ambas columnas */}
            <div className="col-span-2 flex justify-center mt-5">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded-md"
              >
                Regresar
              </button>
            </div>
          </div>     
          )
        )}
      </div>
    </div>
  );
};

export default VerPartida;
