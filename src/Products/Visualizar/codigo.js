import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import './visualizar.css';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState([]);

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
                alert('Failed to fetch products!');
            }
            setLoading(false);
        };

        fetchProducts();
    }, []);

    const addToCart = (product) => {
        const existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) {
            setCart(cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const incrementQuantity = (productId) => {
        setCart(cart.map(item =>
            item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        ));
    };

    const decrementQuantity = (productId) => {
        setCart(cart.map(item =>
            item.id === productId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
        ));
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    };

    if (loading) {
        return <div className="loading">Loading products...</div>;
    }

    return (

        <div className='Container'>
        <div className="product-list-container">
            <h2>Lista de Productos</h2>
            <div className="product-list">
                {products.map(product => (
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

        <div className="cart">
                <h3>Carrito de Compras</h3>
                {cart.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.name}</td>
                                    <td >
                                        <div className='botones'>
                                        <button onClick={() => decrementQuantity(item.id)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => incrementQuantity(item.id)}>+</button>
                                        </div>
                                    </td>
                                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                                    <td>
                                        <button onClick={() => removeFromCart(item.id)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>El carrito está vacío</p>
                )}
                <div><strong>Total: </strong>${calculateTotal()}</div>
            </div>

        </div>
    );
}

export default ProductList;
