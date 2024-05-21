import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { CartProvider } from './components/header/CartContext';

// Obtener el elemento 'root' del documento HTML
const rootElement = document.getElementById('root');

// Crear un root React para renderizar la aplicación
const root = createRoot(rootElement);

// Renderizar la aplicación en el root
root.render(
  <React.StrictMode>
    {/* Proveer el contexto del carrito a toda la aplicación */}
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>
);
