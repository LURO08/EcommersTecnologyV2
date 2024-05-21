import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase-config';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './Registrar.css';
import { auth } from '../../firebase-config';


function ProductForm() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [ventas, setVentas] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (!user) {
                navigate('/'); // Redirecciona al usuario a la página de inicio de sesión si no está autenticado
            }
        });

        return () => unsubscribe();
    }, [navigate]); // Agregar products como dependencia

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!name || !description || !price || !quantity || !image) {
            alert('Please fill in all fields and select an image.');
            return;
        }

        setLoading(true);
        try {
            const imageRef = ref(storage, `images/${image.name}`);
            const snapshot = await uploadBytes(imageRef, image);
            const imageUrl = await getDownloadURL(snapshot.ref);

            await addDoc(collection(db, "products"), {
                name,
                description,
                price: Number(price),
                quantity: Number(quantity),
                ventas: 0,
                imageUrl
            });
            alert('Product added successfully!');
            navigate('/home');
        } catch (error) {
            console.error("Error adding product: ", error);
            alert('Error adding product!');
        }
        setLoading(false);
    };

    return (
        <div>
        <form onSubmit={handleSubmit} className="formContainer">
            <h1>Registrar Producto</h1>
            <label className="label">
                Nombre:
                <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="label">
                Descripción:
                <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </label>
            <label className="label">
                Precio:
                <input className="input" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </label>
            <label className="label">
                Cantidad:
                <input className="input" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            </label>
            <label className="label">
                Foto:
                <input className="input" type="file" onChange={(e) => setImage(e.target.files[0])} required />
            </label>
            <button className="button" type="submit" disabled={loading}>{loading ? 'Agregando...' : 'Agregar Producto'}</button>
        </form>
        </div>
    );
}

export default ProductForm;
