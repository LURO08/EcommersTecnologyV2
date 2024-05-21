import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Login.css';

import { db } from '../../firebase-config';
import { collection, getDocs } from 'firebase/firestore';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const user = userList.find(user => user.email === email);

      if (user) {
          await login(email, password);
          navigate('/home');
      } else {
        setError("No existe un usuario con este correo electrónico.");
      }
    } catch (error) {
      console.error("Error al obtener la lista de usuarios:", error);
      setError("Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.");
    }
  };

  const handleGoToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-form">
      <h1>Login</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <div className="form-buttons">
          <button type="button" onClick={handleGoToRegister} className="button register-btn">Register</button>
          <button type="submit" className="button">Login</button>
        </div>
      </form>
    </div>
  );
}

export default Login;
