import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import './GestionUsuarios.css';

const auth = getAuth();

function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const db = getFirestore();

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged(user => {
            if (!user) {
                navigate('/'); // Redirecciona al usuario a la página de inicio de sesión si no está autenticado
            }
        });

        const unsubscribeUsers = onSnapshot(collection(db, "users"), snapshot => {
            const userList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(userList);
            setLoading(false);
        });

        return () => {
            unsubscribeAuth();
            unsubscribeUsers();
        };
    }, [navigate, db]);

    const handleDeleteAccount = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await deleteDoc(doc(db, "users", userId));
                // No necesitamos actualizar la lista de usuarios localmente,
                // ya que se actualiza automáticamente mediante la suscripción en tiempo real.
                alert('User data deleted successfully');
            } catch (error) {
                console.error("Error deleting user data: ", error);
                alert('Error deleting user data.');
            }
        }
    };

    if (loading) {
        return <div className="loading">Cargando usuarios...</div>;
    }

    return (
        <div>
            <div className="user-container">
                <h2>Lista de Usuarios</h2>
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? users.map(user => (
                            <tr key={user.id}>
                                <td>{user.Usuario}</td>
                                <td>{user.email}</td>
                                <td>{user.rol}</td>
                                <td>
                                    <button onClick={() => navigate(`/edit-user/${user.id}`)}>Modificar</button>
                                    <button onClick={() => handleDeleteAccount(user.id)}>Eliminar</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4">No users found!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UserList;
