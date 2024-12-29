import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom"; 
import axios from "axios";

const EditarPartida = () => {
  const { partidaId } = useParams(); 
  const [partidaData, setPartidaData] = useState([{ id: 1, nombre: "Partida 1", descripcion: "Descripción de la partida 1" }]);
  const [juegoData, setJuegoData] = useState([{ id: 1, nombre: "Juego 1", descripcion: "Descripción del juego 1" }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const history = useHistory();

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

  useEffect(() => {
    if(partidaData?.id_juego) {
      setLoading(true);
      axios.get(`http://localhost:9999/partidas/${partidaData?.id_juego}`)
        .then((response)=>{
          setJuegoData(response.data);
          setLoading(false);
        })
        .catch((err)=> {
          console.error("Error al obtener los datos del juego", err);
          setError("Error al obtener los datos del juego");
          setLoading(false);
        });
    }
  },[partidaData?.id_juego]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    axios
      .put(`http://localhost:9999/partidas/${partidaId}`, {
        nombre,
        descripcion,
      })
      .then((response) => {
        setSuccess("La partida se actualizó correctamente.");
        setTimeout(() => {
          history.push(`/Proyecto/administrador`);
        }, 2000);
      })
      .catch((err) => {
        console.error("Error al actualizar la partida", err);
        setError("Hubo un problema al actualizar la partida. Inténtalo de nuevo.");
      });
  };

  return (
    <div className="bg-[#0B294C] min-h-screen flex justify-center items-center p-5">
      <div className="max-w-[800px] w-full bg-white p-6 rounded-lg shadow-lg">
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold text-gray-800">Editar Partida</h2>
          <p className="text-gray-600">Modifica el nombre o la descripción de la partida.</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 text-center border border-red-500 rounded-md p-3 mb-5">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-600 border border-green-500 rounded-md p-3 mb-5">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500"></div>
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
                      onChange={(e) => setPartidaData({...partidaData, nombre: e.target.value})}
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
                      onChange={(e) => setPartidaData({...partidaData, descripcion: e.target.value})}
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

              <div className="col-span-2 flex justify-center gap-4 mt-5">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="bg-red-600 hover:bg-red-800 text-white py-2 px-4 rounded-md">
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-800 hover:bg-blue-1000 text-white py-2 px-4 rounded-md">
                  Guardar Cambios
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default EditarPartida;
