// Importa solo las funciones necesarias de Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAO61pMBFpSV53R6RaYTTFicXSYXz2Iyjc",
  authDomain: "ecommers-161ad.firebaseapp.com",
  databaseURL: "https://ecommers-161ad-default-rtdb.firebaseio.com",
  projectId: "ecommers-161ad",
  storageBucket: "ecommers-161ad.appspot.com",
  messagingSenderId: "344735620728",
  appId: "1:344735620728:web:6a34f0e67fad2dcdeed78d"
};
// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa los servicios de Firebase
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app); // Utiliza getAuth para obtener la instancia de autenticación


// Exporta las instancias para usar en otras partes de tu aplicación
export { auth, db, storage };
