import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

const CrearPartida = () => {
  const [nombrePartida, setNombrePartida] = useState(""); 
  const [descripcion, setDescripcion] = useState(""); 
  const [juegoSeleccionado, setJuegoSeleccionado] = useState(""); 
  const [error, setError] = useState(null); 
  const history = useHistory();

  const handleNombreChange = (e) => {
    setNombrePartida(e.target.value);
  };

  const handleDescripcionChange = (e) => {
    setDescripcion(e.target.value);
  };

  const handleJuegoChange = (e) => {
    setJuegoSeleccionado(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!nombrePartida || !descripcion || !juegoSeleccionado) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    const data = {
      nombrePartida,
      descripcion,
      juegoSeleccionado,
    };

    axios
      .post("http://localhost:9999/partidas", data)
      .then((response) => {
        console.log("Partida creada:", response.data);
        setNombrePartida("");
        setDescripcion("");
        setJuegoSeleccionado("");
        history.push("/Proyecto/administrador");
      })
      .catch((error) => {
        console.error("Error al crear la partida:", error);
        setError("Hubo un problema al crear la partida. Inténtalo de nuevo.");
      });
  };

  return (
    <div className="bg-[#0B294C] min-h-screen flex justify-center items-center p-5">
      <div className="max-w-[600px] mx-auto p-5 bg-white rounded-lg shadow-lg text-center">
        <div className="mb-5">
          <h2 className="text-2xl text-gray-800 font-bold mb-2 font-jockey">Crear una nueva partida</h2>
          <p className="text-gray-600">Llena los campos para comenzar</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 border border-red-500 rounded-md p-3 mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre de la partida */}
          <div className="text-left">
            <label htmlFor="formNombrePartida" className="text-gray-700 font-medium">
              Nombre de la partida:
            </label>
            <input
              id="formNombrePartida"
              type="text"
              placeholder="Ingresa un nombre descriptivo"
              value={nombrePartida}
              onChange={handleNombreChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md mt-2"
            />
          </div>

          {/* Descripción de la partida */}
          <div className="text-left">
            <label htmlFor="formDescripcion" className="text-gray-700 font-medium">
              Descripción:
            </label>
            <textarea
              id="formDescripcion"
              placeholder="Describe brevemente la partida"
              value={descripcion}
              onChange={handleDescripcionChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md mt-2"
            />
          </div>

          {/* Selección de juego */}
          <div className="text-left">
            <label htmlFor="formJuegoSeleccionado" className="text-gray-700 font-medium">
              Selecciona un juego:
            </label>
            <select
              id="formJuegoSeleccionado"
              value={juegoSeleccionado}
              onChange={handleJuegoChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md mt-2"
            >
              <option value="" disabled>
                Selecciona un juego
              </option>
              <option value="Juego1">Juego 1</option>
              <option value="Juego2">Juego 2</option>
              <option value="Juego3">Juego 3</option>
            </select>
          </div>

          {/* Botones */}
          <div className="flex gap-5 justify-center">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-900 text-white py-2 px-4 rounded-md"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearPartida;
