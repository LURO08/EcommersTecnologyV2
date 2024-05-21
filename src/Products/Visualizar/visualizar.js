import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import './visualizar.css';
import { auth } from '../../firebase-config';
import { useCart } from '../../components/header/CartContext';
import { useNavigate } from 'react-router-dom';


function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true); // Cambiado a true para que muestre "Loading products..." al inicio
    const { addToCart } = useCart();
    const [maxProductQuantity, setMaxProductQuantity] = useState(0);
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
                // Calcula la cantidad máxima de productos disponibles
                const maxQuantity = Math.max(...productList.map(product => product.quantity));
                setMaxProductQuantity(maxQuantity);
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
    }, [products], [navigate]); // Agregar products como dependencia

    if (loading || products.length === 0) { // Verifica si los productos están cargando o si no hay productos
        return <div className="loading">Loading products...</div>;
    }

    return (
        <div className='Container'>
            <div className='Titulo'>
            <h1>LISTA DE PRODUCTOS</h1>
            </div>
            <div className="product-list-container">
                
                <div className="product-list">
                    {products.map(product => (
                        product.quantity >= 1 && // Moved the conditional rendering here
                        <div className="product-card" key={product.id}>
                            <img src={product.imageUrl} alt={product.name} />
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <p>Precio: ${product.price.toFixed(2)}</p>
                            <button
                                type="button" 
                                className="button register-btn" 
                                onClick={() =>  addToCart(product)}
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
