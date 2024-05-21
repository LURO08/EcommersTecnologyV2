import React, { createContext, useContext, useReducer, useMemo, useEffect, useState } from 'react';
import { db } from '../../firebase-config';
import { 
    collection, 
    doc, 
    getDoc, 
    updateDoc, 
    setDoc, 
    addDoc 
} from 'firebase/firestore';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import Roboto from '../../Roboto-normal.js'; // Ajusta la ruta según la ubicación del archivo


import { auth } from '../../firebase-config';

const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CART':
            return action.payload;
        case 'ADD_ITEM':
            const exist = state.find(item => item.id === action.payload.id);
            if (exist) {
                return state.map(item =>
                    item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...state, { ...action.payload, quantity: 1 }];
            }
        case 'REMOVE_ITEM':
            return state.filter(item => item.id !== action.payload.id);
        case 'INCREMENT':
            return state.map(item =>
                item.id === action.payload.id ? { ...item, quantity: Math.min(item.quantity + 1, action.payload.limit) } : item
            );
        case 'DECREMENT':
            return state.map(item =>
                item.id === action.payload.id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
            );
        case 'CLEAR_CART':
            return [];
        default:
            return state;
    }
};

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, dispatch] = useReducer(cartReducer, []);
    const [userName, setUserName] = useState('');

    // Load cart from database
    useEffect(() => {

        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    setUserName(docSnap.data().Usuario);
                } else {
                    console.log("No such document!");
                    setUserName(user.email || '');
                }
            } else {
                setUserName('');
            }
        });

        const fetchCart = async () => {
            try {
                const cartDoc = doc(db, "carts", "userCartId"); // Replace "userCartId" with actual user cart ID
                const cartSnapshot = await getDoc(cartDoc);
                if (cartSnapshot.exists()) {
                    const cartData = cartSnapshot.data().cartItems;
                    dispatch({ type: 'SET_CART', payload: cartData });
                }
            } catch (error) {
                console.error("Error fetching cart: ", error);
            }
        };
        fetchCart();
        return () => unsubscribe();
    }, [db]);

    // Update cart in database whenever cartItems change
    useEffect(() => {
        updateCartInDatabase(cartItems);
    }, [cartItems]);

    const updateCartInDatabase = async (cart) => {
        const total = cart.reduce((acc, item) => acc + (item.quantity * item.price), 0);
        const cartDocRef = doc(db, "carts", "userCartId"); // Replace "userCartId" with actual user cart ID
        await setDoc(cartDocRef, { cartItems: cart, total });
    };

    const updateProductQuantity = async (productId, newQuantity) => {
        const productDocRef = doc(db, 'products', productId);
        await updateDoc(productDocRef, { quantity: newQuantity });
    };

    const updateProductVentas = async (productId, newVentas) => {
        const productDocRef = doc(db, 'products', productId);
        await updateDoc(productDocRef, { ventas: newVentas });
    };

    const addToCart = async (product) => {
        const productInCart = cartItems.find(item => item.id === product.id);
        if (productInCart) {
            const productDoc = await getDoc(doc(db, "products", product.id));
            const availableQuantity = productDoc.exists() ? productDoc.data().quantity : 0;
            dispatch({ type: 'INCREMENT', payload: { id: product.id, limit: availableQuantity } });
        } else {
            dispatch({ type: 'ADD_ITEM', payload: { id: product.id, name: product.name, quantity: 1, price: product.price, img: product.imageUrl } });
        }
    };

    const removeFromCart = async (id) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    };

    const decrementQuantity = async (product) => {
        dispatch({ type: 'DECREMENT', payload: { id: product.id } });
    };

    const clearCart = async () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const checkout = async () => {
        try {
            const cartItemsData = cartItems.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }));

            const total2 = cartItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
            const pointsEarned = Math.floor(total2 / 100); // Por ejemplo, 1 punto por cada $100 gastados

            // Actualizar la cantidad de productos en la base de datos
            cartItems.forEach(async item => {
                const productDoc = await getDoc(doc(db, "products", item.id));
                const currentQuantity = productDoc.exists() ? productDoc.data().quantity : 0;
                const newQuantity = Math.max(currentQuantity - item.quantity, 0); // Asegúrate de que la cantidad no sea negativa
                await updateProductQuantity(item.id, newQuantity);

                if (productDoc.exists()) {
                    const currentVentas = productDoc.data().ventas || 0;
                    const newVentas = currentVentas + item.quantity;
                    await updateProductVentas(item.id, newVentas);
                }
            });

            await addDoc(collection(db, 'orders'), {
                items: cartItemsData,
                total: cartItems.reduce((acc, item) => acc + (item.quantity * item.price), 0),
                User: userName,
                timestamp: new Date().toISOString()
            });

           
            // Actualizar puntos del usuario en la base de datos
            const userRef = doc(db, "users", auth.currentUser.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const currentPoints = userDoc.data().points || 0;
                const newPoints = currentPoints + pointsEarned;
                await updateDoc(userRef, { points: newPoints });
            }

            const pdfDoc = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: [102, 150] // Ancho 80mm, altura 150mm
            });

            // Cargar la fuente Roboto
            pdfDoc.addFileToVFS('Roboto.ttf', Roboto);
            pdfDoc.addFont('Roboto.ttf', 'Roboto', 'normal');
            pdfDoc.setFont('Roboto');


            pdfDoc.setFontSize(20);
            pdfDoc.setFont('Roboto', 'bold');
            pdfDoc.text('ECOMMERS TECNOLOGY', 8, 15);


            pdfDoc.setFontSize(10);
            pdfDoc.setFont('helvetica', 'normal');
            pdfDoc.text('Instituto Tecnologico de Chilpancingo', 20, 23);
            pdfDoc.text('Av, José Francisco Ruiz Massieu No. 5, Fracc.villa ', 10, 28);
            pdfDoc.text('Moderna, 39090 Chilpancingo de los Bravo, Gro.', 12, 32);

            const currentDate = new Date().toLocaleString(); // Obtener la fecha y hora actual
            pdfDoc.text(`Fecha de Compra: ${currentDate}`, 20, 38);

            pdfDoc.text('------------------------------------------------------------------------------------', 2, 46);
            // Crear una tabla para mostrar los productos comprados
            pdfDoc.autoTable({
                startY: 40,
                margin: { left: 0, right: 0 },
                head: [['PRODUCTO', 'CANT', 'PRECIO']],
                body: cartItems.map(item => [item.name, item.quantity, `$${(item.price * item.quantity).toFixed(0)}`]),
                theme: 'plain', // Tema sin bordes
                styles: {
                    fontSize: 10,
                    cellPadding: 1,
                    halign: 'center',
                    valign: 'middle',
                },
                tableWidth: 'wrap', // Ajusta el ancho de la tabla al contenido
            });

            pdfDoc.text('------------------------------------------------------', 2, pdfDoc.autoTable.previous.finalY + 2);

            // Calcular y agregar el total de la compra
            const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
            const numArticulos = cartItems.reduce((acc, item) => acc + item.quantity, 0);

            pdfDoc.setFontSize(10);
            pdfDoc.setFont('helvetica', 'bold');
            pdfDoc.text(`ARTICULOS: ${numArticulos}`, 5, pdfDoc.autoTable.previous.finalY + 7);
            pdfDoc.text(`TOTAL: $${total.toFixed(2)}`, 65, pdfDoc.autoTable.previous.finalY + 7);
            
            pdfDoc.setFontSize(12);
            pdfDoc.setFont('Roboto', 'bold');
            
            pdfDoc.text('GRACIAS POR TU COMPRA!', 25, pdfDoc.autoTable.previous.finalY+ 20);
            // Guardar el documento como un archivo PDF
            pdfDoc.save('ticket.pdf');

            // Limpiar el carrito después de realizar la compra
            clearCart();

        } catch (error) {
            console.error("Error checking out: ", error);
        }
    };

    const value = useMemo(() => ({
        cartItems,
        addToCart,
        removeFromCart,
        decrementQuantity,
        clearCart,
        checkout
    }), [cartItems]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
