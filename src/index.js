import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Импортируем функции инициализации Firebase и необходимые модули
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage';

// Конфигурация Firebase для вашего проекта
const firebaseConfig = {
  apiKey: "AIzaSyDxwwzX1DoWdvCdZB1NZvYO72p9Iv81R00",
  authDomain: "library-test-14ed4.firebaseapp.com",
  projectId: "library-test-14ed4",
  storageBucket: "library-test-14ed4.appspot.com",
  messagingSenderId: "1082227639374",
  appId: "1:1082227639374:web:3f6a523dc50787f32a6f1f",
  measurementId: "G-9HD3HZB9GJ"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Экспортируем объекты для использования в приложении
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Рендеринг основного компонента приложения
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Для измерения производительности приложения
reportWebVitals();
