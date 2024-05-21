import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase-config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, updatePassword } from "firebase/auth";
import './ModificarUsuarios.css';

function EditUser() {
    const { id } = useParams();
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, "users", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUser(docSnap.data());
                } else {
                    alert("No such user!");
                    navigate("/home");
                }
            } catch (error) {
                console.error("Error fetching user: ", error);
                alert("Failed to fetch user details!");
            }
            setLoading(false);
        };

        fetchUser();
    }, [id, navigate]);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (auth.currentUser && password) {
            updatePassword(auth.currentUser, password).then(() => {
                alert("Password updated successfully!");
            }).catch((error) => {
                console.error("Error updating password: ", error);
                alert("Failed to update password!");
            });
        }

        try {
            const userRef = doc(db, "users", id);
            await updateDoc(userRef, { ...user });
            alert("User updated successfully!");
            navigate("/home");
        } catch (error) {
            console.error("Error updating user: ", error);
            alert("Failed to update user!");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="edit-user-container">
                <h2>Editar Usuario</h2>
                <form onSubmit={handleSubmit}>
                    <label>Usuario:</label>
                    <input type="text" name="Usuario" value={user.Usuario || ''} onChange={handleChange} />
                    <label>Email:</label>
                    <input type="email" name="email" value={user.email || ''} onChange={handleChange} />
                    <label>Contraseña:</label>
                    <input type="password" name="password" value={password} onChange={handlePasswordChange} />
                    <label>Rol:</label>
                    <select value={user.rol || ''} name="rol" onChange={handleChange}>
                        <option value="Usuario">Usuario</option>
                        <option value="Administrador">Administrador</option>
                    </select>
                    <button type="submit">Actualizar Usuario</button>
                </form>
            </div>
        </div>
    );
}

export default EditUser;
