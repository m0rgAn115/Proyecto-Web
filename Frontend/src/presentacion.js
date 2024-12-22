import React from "react";
import { Link } from "react-router-dom";
import indexImage from "./img/index_image.jpg"; 
import "./styles/style_index.css";

const Presentacion = () => {
    return (
      <div className="index_estilo">
        <header className="encabezado">
          <h1 className="titulos">PRÁCTICA 6: MÓDULO DE LOGIN - ORM - CRUD (EQUIPO)</h1>
          <h2 className="subtitulos">Proyecto:</h2>
          <p className="texto">
            Aplicación web reconocimiento de sílabas por voz utilizando TensorFlow.js, React con ECMAScript 6, Babel, Webpack y Node.js
          </p>
          <h2 className="subtitulos">Grupo: 4BM1</h2>
          <h2 className="subtitulos">Integrantes del equipo:</h2>
          <ul className="informacion">
            <li>Buendía Rodríguez Valentina <br /> Boleta: 2023630575</li>
            <li>Mondragón Orta Ángel Damián <br /> Boleta: 2023630007</li>
            <li>Sánchez Corona Rodrigo <br /> Boleta: 2023630621</li>
          </ul>
        </header>
  
        <section className="redirigir">
          <img src={indexImage} alt="Imagen de fondo" className="redirigir__imagen" />
          <div className="redirigir__texto">
            <p className="invitacion">Haz clic en el siguiente botón para ingresar:</p>
            <Link to="/">
              <button className="ingresar--boton">LOGIN</button>
            </Link>
          </div>
        </section>
      </div>
    );
  };
  
  export default Presentacion;
  