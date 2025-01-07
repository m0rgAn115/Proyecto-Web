import React from "react";
import { Redirect } from "react-router-dom";
import backgroundImage from '../img/background_login.jpg';

class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      condition: false,
      tipousuario: '',
      usuario: "admin",
      password: 1234,
      error: '',
      validado: false,
      showModal: false,
    };
  }

  validar = () => {
    const { usuario, password } = this.state;

    if (!usuario || !password) {
      this.setState({ error: "Por favor, complete todos los campos.", showModal: true });
      setTimeout(() => {
        this.setState({ showModal: false });
      }, 3000); // 3 segundos para mostrar el modal
      return;
    }

    fetch(`http://localhost:9999?User=${usuario}&password=${password}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === "yes") {

          sessionStorage.setItem('id_usuario', data.id);
          sessionStorage.setItem('tipo_usuario', data.tipo);
          
          this.setState(
            { 
              tipousuario: data.tipo,
              usuario: '',
              password: '',
              error: '',
              showModal: true,
              validado: true 
            },
            () => {
              setTimeout(() => {
                this.setState({ showModal: false, condition: true });
              }, 1); // 3 segundos
            }
          );
        } else {
          this.setState({ 
            error: "Usuario o contraseña incorrectos.",
            usuario: '',
            password: '',
            showModal: true,
            validado: false,
          });

          setTimeout(() => {
            this.setState({ showModal: false });
          }, 3000); 
        }
      })
      .catch(error => {
        console.error("Error:", error);
        this.setState({ 
          error: "Error en la conexión. Inténtelo de nuevo más tarde.",
          usuario: '',
          password: '',
          showModal: true,
          validado: false,
        });

        setTimeout(() => {
          this.setState({ showModal: false });
        }, 5000); 
      });
  }

  render() {
    const { condition, tipousuario, usuario, password, error, showModal, validado } = this.state;

    if (condition) {
      return <Redirect to={`/Proyecto/${tipousuario}`} />;
    }

    return (
      <div className="bg-gray-100 flex justify-center items-center min-h-screen">
        <div className="flex w-[800px] h-[450px] bg-white rounded-lg shadow-lg overflow-hidden relative">
          
          <div className="w-1/2 bg-blue-600 flex items-center justify-center">
            <img src={backgroundImage} alt="Imagen de fondo" className="w-full h-full object-cover" />
          </div>

          {/* formulario */}
          <div className="w-1/2 p-8 flex flex-col justify-center">
            <h1 className="text-blue-600 text-4xl mb-4 text-center">
              Hola<br />Bienvenido
            </h1>
            {error && (
              <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label htmlFor="usuario" className="text-sm text-gray-700">Usuario</label>
              <input
                type="text"
                id="usuario"
                placeholder="Ingrese el usuario"
                value={usuario}
                onChange={(e) => this.setState({ usuario: e.target.value })}
                className="w-full p-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="text-sm text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => this.setState({ password: e.target.value })}
                className="w-full p-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={this.validar}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-all"
            >
              Login
            </button>
          </div>

          
          {showModal && (
            <div className={`absolute top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded shadow-lg text-white ${
              validado ? "bg-green-500" : null
            }`}>
              <p className="text-center font-bold">
                {validado ? "Usuario Validado, redirigiendo..." : null}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="w-full text-center py-4 bg-blue-600 text-white fixed bottom-0 left-0">
          <p>&copy; Buendía Rodríguez Valentina | Mondragón Orta Angel Damian | Sánchez Corona Rodrigo.</p>
        </footer>
      </div>
    );
  }
}

export default Login;
