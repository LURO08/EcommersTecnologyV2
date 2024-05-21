import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase-config';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import './Profile.css';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (!user) {
                navigate('/'); // Redirecciona al usuario a la página de inicio de sesión si no está autenticado
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Reautenticar al usuario con su contraseña actual
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Cambiar la contraseña
            await updatePassword(user, newPassword);
            setMessage('Contraseña cambiada correctamente');
            setLoading(false);
        } catch (error) {
            setMessage(`Error: ${error.message}`);
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            // Reautenticar al usuario con su contraseña actual
            await reauthenticateWithCredential(user, credential);

            // Eliminar la cuenta
            await deleteUser(user);
            navigate('/'); // Redirecciona al usuario después de eliminar la cuenta
        } catch (error) {
            console.error('Error al eliminar la cuenta:', error);
            setMessage('Error al eliminar la cuenta. Por favor, inténtalo de nuevo más tarde.');
        }
    };

    return (
        <div>
            <div className="profile-container">
                <h1>Configuración de Perfil</h1>
                <div className="form-section">
                    <h2>Cambiar Contraseña</h2>
                    <form onSubmit={handlePasswordChange}>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Contraseña actual"
                            required
                        />
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nueva contraseña"
                            required
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Actualizar'}
                        </button>
                    </form>
                    {message && <p className="message">{message}</p>}
                </div>
            </div>

            <div className="profile-container">
                <h1>Eliminar Cuenta</h1>
                <div className="form-section">
                    <h3>Para eliminar tu cuenta, confirma tu contraseña</h3>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Contraseña"
                        required
                    />
                    <button onClick={handleDeleteAccount}>Eliminar Cuenta</button>
                    {message && <p className="message">{message}</p>}
                </div>
            </div>
        </div>
    );
}

export default Profile;
