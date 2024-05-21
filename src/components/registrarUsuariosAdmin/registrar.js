import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase-config'; // Asegúrate de que la ruta sea correcta
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import './registrar.css';


function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [usuario, setUsuario] = useState('');
    const [rol, setRol] = useState('Usuario');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const db = getFirestore();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (!user) {
                navigate('/'); // Redirecciona al usuario a la página de inicio de sesión si no está autenticado
            }
        });
    
        return () => unsubscribe();
    }, [navigate]); // Agregar products como dependencia

    const handleSignUp = async (event) => {
        event.preventDefault();
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                Usuario: usuario,
                email: email,
                rol: rol
            });
            console.log('Usuario registrado correctamente');
            navigate('/home');
        } catch (error) {
            setError(error.message);
            console.error('Error al registrarse:', error);
        }
    };

    return (
        <div> 
            <div className="sign-up-form">
                <h1>Sign Up</h1>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSignUp}>
                    <label>Usuario:</label>
                    <input
                        type="text"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        required
                    />
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label>Rol:</label>
                    <select value={rol} onChange={(e) => setRol(e.target.value)}>
                        <option value="Usuario">Usuario</option>
                        <option value="Administrador">Administrador</option>
                    </select>
                    <div className="form-buttons">
                        <button type="submit" className="button">Register</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
