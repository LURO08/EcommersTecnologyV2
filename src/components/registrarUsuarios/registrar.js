import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase-config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import './registrar.css';

function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [Usuario, setUsuario] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const db = getFirestore();

    const handleSignUp = async (event) => {
        event.preventDefault();
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
       
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                Usuario: Usuario,
                email: email,
                rol: 'Usuario'
            });
            console.log(userCredential);
            alert('User registered successfully!');
            navigate('/');
        } catch (error) {
            setError(error.message);
            console.error('Error signing up:', error);
        }
    };

    const handleGoToLogin = () => {
        navigate('/');  // Navigate to the login page
    };

    return (
        <div className="sign-up-form">
            <h1>Sign Up</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSignUp}>
                <label>Usuario:</label>
                <input
                    type="text"
                    value={Usuario}
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

                

                <div className="form-buttons">
                    <button type="button" onClick={handleGoToLogin} className="button register-btn">Back to Login</button>
                    <button type="submit" className="button">Register</button>
                </div>
            </form>
        </div>
    );
}

export default SignUp;
