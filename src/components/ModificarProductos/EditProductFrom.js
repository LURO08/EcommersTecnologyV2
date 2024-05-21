import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase-config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './EditProductForm.css'; // Importamos el archivo CSS para estilos

function EditProductForm() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const { productId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            const docRef = doc(db, "products", productId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setName(docSnap.data().name);
                setDescription(docSnap.data().description);
                setPrice(docSnap.data().price);
                setQuantity(docSnap.data().quantity);
                setImageUrl(docSnap.data().imageUrl);
            } else {
                alert("No such product!");
            }
            setLoading(false);
        };

        fetchProduct();
    }, [productId]);

    const handleImageChange = (event) => {
        if (event.target.files[0]) {
            setImage(event.target.files[0]);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        let newImageUrl = imageUrl;
        if (image) {
            const imageRef = ref(storage, `images/${image.name}`);
            const snapshot = await uploadBytes(imageRef, image);
            newImageUrl = await getDownloadURL(snapshot.ref);
        }

        const productRef = doc(db, "products", productId);
        try {
            await updateDoc(productRef, {
                name,
                description,
                price: Number(price),
                quantity :Number(quantity),
                imageUrl: newImageUrl
            });
            alert('Producto actualizado correctamente!');
            navigate('/home');
        } catch (error) {
            console.error("Error actualizar productos: ", error);
            alert('Failed to update product!');
        }
        setLoading(false);
    };

    return (
    <div>
        <form className="edit-product-form" onSubmit={handleSubmit}>
            <h1>REGISTRO DE PRODUCTOS</h1>
            <label>
                Nombre:
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
                Descripcion:
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </label>
            <label>
                Precio:
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </label>
            <label>
                Cantidad:
                <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            </label>
            <label>
                Imagen:
                <input type="file" onChange={handleImageChange} />
            </label>
            <button className="button" type="submit" disabled={loading}>{loading ? 'Actualizando...' : 'Actualizando Producto'}</button>
        </form>
        </div>
    );
}

export default EditProductForm;
