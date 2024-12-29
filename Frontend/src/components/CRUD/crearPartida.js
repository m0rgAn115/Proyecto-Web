import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

const CrearPartida = () => {
  const [nombre, setNombre] = useState(""); 
  const [descripcion, setDescripcion] = useState(""); 
  const [id, setId] = useState(""); 
  const [juegoData, setJuegoData] = useState(null); 
  const [juegos, setJuegos] = useState([]); // Estado para almacenar los juegos obtenidos
  const [error, setError] = useState(null); 
  const history = useHistory();
  const idUsuario = sessionStorage.getItem('id_usuario');

  // Cargar la lista de juegos desde la base de datos
  useEffect(() => {
    axios
      .get("http://localhost:9999/juegos") // Asumiendo que esta es la ruta para obtener los juegos
      .then((response) => {
        setJuegos(response.data); // Guardamos los juegos en el estado
      })
      .catch((err) => {
        console.error("Error al obtener los juegos:", err);
        setError("No se pudo cargar la lista de juegos.");
      });
  }, []);

  const handleNombreChange = (e) => {
    setNombre(e.target.value);
  };

  const handleDescripcionChange = (e) => {
    setDescripcion(e.target.value);
  };

  const handleJuegoChange = (e) => {
    const selectedId = e.target.value;
    setId(selectedId);
    setJuegoData(null); 

    if (selectedId) {
      axios
        .get(`http://localhost:9999/juegos/${selectedId}`)
        .then((response) => {
          setJuegoData(response.data); 
        })
        .catch((err) => {
          console.error("Error al obtener los datos del juego:", err);
          setError("No se pudo cargar la información del juego.");
        });
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!nombre || !descripcion || !id ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    const data = {
      nombre,
      descripcion,
      id,
      usuario: idUsuario,
    };

    // solicitud para crear la partida
    axios
      .post("http://localhost:9999/partidas", data)
      .then((response) => {
        console.log("Partida creada:", response.data);
        setNombre("");
        setDescripcion("");
        setId("");
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
            <label htmlFor="formNombre" className="text-gray-700 font-medium">
              Nombre de la partida:
            </label>
            <input
              id="formNombre"
              type="text"
              placeholder="Ingresa un nombre descriptivo"
              value={nombre}
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
            <label htmlFor="formId" className="text-gray-700 font-medium">
              Selecciona un juego:
            </label>
            <select
              id="formId"
              value={id}
              onChange={handleJuegoChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md mt-2"
            >
              <option value="" disabled>
                Selecciona un juego
              </option>
              {juegos.map((juego) => (
                <option key={juego.id} value={juego.id}>
                  {juego.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-5 justify-center">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded-md">
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-900 text-white py-2 px-4 rounded-md">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearPartida;
