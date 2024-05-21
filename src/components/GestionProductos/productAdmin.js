import React, { useState, useEffect } from 'react';
import { db,auth } from '../../firebase-config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './ProductAdmin.css';
  // Asegúrate de que el archivo CSS está en la carpeta correcta y contiene los estilos necesarios.

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const productList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(productList);
            } catch (error) {
                console.error("Error fetching products: ", error);
            }
            setLoading(false);
        };

       


        const unsubscribe = auth.onAuthStateChanged(user => {
            if (!user) {
                navigate('/'); // Redirecciona al usuario a la página de inicio de sesión si no está autenticado
            }
        });

        fetchProducts();
        return () => unsubscribe();
    }, [navigate]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteDoc(doc(db, "products", id));
                setProducts(products.filter(product => product.id !== id));
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
        <div>
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
                        <th>Accion</th>
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
        </div>
    );
}

export default ProductList;
