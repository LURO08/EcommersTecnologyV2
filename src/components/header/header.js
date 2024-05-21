import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase-config';
import { signOut } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import './header.css';
import { useCart } from './CartContext';

const ADMIN_ROLE = 'Administrador'; // Constant for role comparison

function Header() {
    const { cartItems, decrementQuantity, removeFromCart, addToCart, checkout } = useCart();
    const [userName, setUserName] = useState('');
    const [rol, setRol] = useState('');
    const [cartVisible, setCartVisible] = useState(false);
    const [points, setPoints] = useState(0);
    const db = getFirestore();
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const unsubscribeUserDoc = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setUserName(userData.Usuario);
                        setRol(userData.rol);
                        setPoints(userData.points || 0);
                    } else {
                        console.log("No such document!");
                        setUserName(user.email || '');
                    }
                });
                return () => unsubscribeUserDoc();
            } else {
                setUserName('');
                setRol('');
            }
        });

        return () => unsubscribe();
    }, [db]);

    const handleLogout = () => {
        signOut(auth).then(() => {
            console.log('User logged out successfully');
            navigate('/');
        }).catch((error) => {
            console.error('Logout Error:', error);
        });
    };

    const toggleCart = () => {
        setCartVisible(!cartVisible);
    };

    const totalItemsInCart = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div>
            {userName && (
                <>
                    <div className="header">
                        <div className="logo">
                            <Link to="/home">Home</Link>
                        </div>

                        <div className="nav-links">
                            {userName && rol === ADMIN_ROLE && (
                                <>
                                    <div className="dropdown">
                                        <a href="#">Usuarios</a>
                                        <ul className="dropdown-menu">
                                            <li><Link to="/User-Register">Registrar Usuario</Link></li>
                                            <li><Link to="/usuarios">Gestion de Usuarios</Link></li>
                                        </ul>
                                    </div>

                                    <div className="dropdown">
                                        <a href="#">Productos</a>
                                        <ul className="dropdown-menu">
                                            <li><Link to="/registrarProducto">Registrar Producto</Link></li>
                                            <li><Link to="/Productos">Gestion de Productos</Link></li>
                                            <li><Link to="/estadisticas">Estadisticas</Link></li>
                                        </ul>
                                    </div>

                                    <div className="dropdown">
                                        <a href="#">Ventas</a>
                                        <ul className="dropdown-menu">
                                            <li><Link to="/Ventas">Gestion Ventas</Link></li>
                                        </ul>
                                    </div>
                                </>
                            )}
                            <div className='points'>
                                <h3>Puntos: </h3><p>{points}</p>
                            </div>

                            <a onClick={toggleCart}>
                                <img src="https://firebasestorage.googleapis.com/v0/b/e-commers-67174.appspot.com/o/carritoCompras2.png?alt=media&token=69e9b11c-b714-44a7-ba7d-25d4c54ba620" alt="Carrito" width={25} height={25} />
                                <span>{totalItemsInCart}</span>
                            </a>

                            <div className="navUser-links">
                                <div className="dropdownUser">
                                    <a href="#">{userName}</a>
                                    <ul className="dropdownUser-menu">
                                        <li><Link to="/profile">Perfil</Link></li>
                                        <li><Link to="/" onClick={handleLogout}>Cerrar Sesión</Link></li>
                                    </ul>
                                </div>
                            </div>

                            {cartVisible && (
                                <div className="cart-dropdown">
                                    {cartItems.length > 0 ? (
                                        <ul>
                                            {cartItems.map(item => (
                                                <li key={item.id}>
                                                    <div className='contentproducto'>
                                                        <div>
                                                            <img src={item.img} alt={item.name} width={70} height={80} />
                                                        </div>

                                                        <div>
                                                            <div className="item-top">
                                                                <span className="item-name">{item.name}</span>
                                                                <button className="btnEliminar" onClick={() => removeFromCart(item.id)}>X</button>
                                                            </div>

                                                            <div className="item-bottom">
                                                                <button onClick={() => addToCart(item)}>+</button>
                                                                <span>{item.quantity}</span>
                                                                <button onClick={() => decrementQuantity(item)}>-</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                            <span>Total: ${totalPrice}</span>
                                            <button onClick={checkout}>Comprar</button>
                                        </ul>
                                    ) : (
                                        <p>Tu carrito está vacío</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Header;
