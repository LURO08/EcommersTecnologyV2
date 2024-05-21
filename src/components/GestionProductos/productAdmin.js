import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase-config';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './ProductAdmin.css';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged(user => {
            if (!user) {
                navigate('/'); // Redirecciona al usuario a la página de inicio de sesión si no está autenticado
            }
        });

        const unsubscribeProducts = onSnapshot(collection(db, "products"), snapshot => {
            const productList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productList);
            setLoading(false);
        });

        return () => {
            unsubscribeAuth();
            unsubscribeProducts();
        };
    }, [navigate]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteDoc(doc(db, "products", id));
                // No necesitamos actualizar la lista de productos localmente,
                // ya que se actualiza automáticamente mediante la suscripción en tiempo real.
                alert("Product deleted successfully!");
            } catch (error) {
                console.error("Error deleting product: ", error);
                alert("Failed to delete product!");
            }
        }
    };

    const handleEdit = (id) => {
        navigate(`/edit/${id}`); // Asumiendo que tienes una ruta /edit/:id
    };

    if (loading) {
        return <div className="loading">Loading products...</div>;
    }

    return (
        <div className="product-container">
            <h2>Lista de Productos</h2>
            <table className="product-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Ventas</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length > 0 ? (
                        products.map(product => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.description}</td>
                                <td>{product.quantity}</td>
                                <td>${product.price.toFixed(2)}</td>
                                <td>{product.ventas}</td>
                                <td className='tdbuttons'>
                                    <button onClick={() => handleEdit(product.id)}>Modificar</button>
                                    <button onClick={() => handleDelete(product.id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">No products found!</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ProductList;
