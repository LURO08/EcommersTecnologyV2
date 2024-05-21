import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

import { AuthProvider } from './components/auth/AuthContext'; // Asegúrate de importar AuthProvider desde la ruta correcta
import Login from './components/Login/Login';
import Registro from './components/registrarUsuarios/registrar';
import Home from './Home/home';
import Profile from './components/Profiles/Profile';
import RegistrarProducto from './Products/Registrar/Registrar';
import Productos from './components/GestionProductos/productAdmin';
import GestionUsuarios from './components/GestionUsuarios/GestionUsuarios';
import EditProductForm from './components/ModificarProductos/EditProductFrom';
import ModifyUsers from './components/ModificarUsuarios/ModifcarUsuarios';
import RegistrarUsuariosAdmin from './components/registrarUsuariosAdmin/registrar';
import Header from './components/header/header'; // Asegúrate de que la ruta es correcta
import Estadisticas from './components/Estadistica/estadisticas';
import Ventas from './components/GestionVentas/gestionventas';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Registro />} />

            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            
            <Route path='/usuarios' element={<GestionUsuarios/>} />
            <Route path='/User-Register' element={<RegistrarUsuariosAdmin/>} />
            <Route path='/Productos' element={<Productos/>} />
            <Route path='/registrarProducto' element={<RegistrarProducto/>} />
            <Route path="/edit/:productId" element={<EditProductForm />} />
            <Route path="/edit-user/:id" element={<ModifyUsers />} />

            <Route path='/estadisticas' element={<Estadisticas/>}/>
            <Route path='/Ventas' element={<Ventas/>}/>
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
