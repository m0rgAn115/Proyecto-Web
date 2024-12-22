import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Administrador from "./components/administrador";
import Editar from "./components/CRUD/editar";
import VerAudio from "./components/CRUD/verAudio";
import CrearAudio from "./components/CRUD/crearAudio"; 
import Login from "./components/login";
import ProbarAudio from "./components/CRUD/probarAudio";
import Presentacion from "./presentacion";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/styles.css";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route exact path="/index.html" component={Presentacion} />
        <Route exact path="/Proyecto/administrador" component={Administrador} />
        <Route exact path="/Proyecto/editar/:audioId" component={Editar} />
        <Route exact path="/Proyecto/verAudio/:audioId" component={VerAudio} />
        <Route exact path="/Proyecto/probarAudio/:audioId" component={ProbarAudio} />
        <Route exact path="/Proyecto/CrearAudio" component={CrearAudio} />
        <Route path="*" render={() => <h1>RECURSO NO ENCONTRADO</h1>} />
      </Switch>
    </Router>
  );
};

export default App;
