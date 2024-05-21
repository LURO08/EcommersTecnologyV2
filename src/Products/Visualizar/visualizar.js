import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import './visualizar.css';
import { auth } from '../../firebase-config';
import { useCart } from '../../components/header/CartContext';
import { useNavigate } from 'react-router-dom';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true); // Start with loading as true
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const productList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(productList);
            } catch (error) {
                console.error("Error fetching products: ", error);
            } finally {
                setLoading(false); // Ensure loading is set to false regardless of error
            }
        };

        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                fetchProducts();
            } else {
                navigate('/'); // Redirect to login page if user is not authenticated
            }
        });

        return () => unsubscribe();
    }, [navigate]); // Use navigate as a dependency

    if (loading) {
        return <div className="loading">Loading products...</div>;
    }

    if (products.length === 0) {
        return <div className="loading">No products available.</div>;
    }

    return (
        <div className='Container'>
            <div className='Titulo'>
                <h1>LISTA DE PRODUCTOS</h1>
            </div>
            <div className="product-list-container">
                <div className="product-list">
                    {products.map(product => (
                        product.quantity >= 1 && // Render only products with quantity >= 1
                        <div className="product-card" key={product.id}>
                            <img src={product.imageUrl} alt={product.name} />
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <p>Precio: ${product.price.toFixed(2)}</p>
                            <button
                                type="button" 
                                className="button register-btn" 
                                onClick={() => addToCart(product)}
                            >
                                Agregar al Carrito
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ProductList;
