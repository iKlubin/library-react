import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../index'; // Импортируем экземпляры Firebase Auth и Firestore
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import './Auth.css'; // Импортируем стили для страницы регистрации

function Signup() {
  // Состояния для хранения email, имени пользователя, пароля и ошибки
  const [email, setEmail] = useState('');
  const [displayName, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Хук для навигации

  // Функция для обработки регистрации
  const handleSignup = async (e) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы
    setError(null); // Сброс ошибки перед новой попыткой регистрации

    try {
      // Создание нового пользователя с email и паролем
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Обновление профиля пользователя (добавление displayName)
      await updateProfile(user, {
        displayName: displayName,
      });

      // Добавление информации о пользователе в Firestore
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: new Date(),
        isAdmin: false,
        favorites: [],
        tags: []
      });

      // Перенаправляем пользователя на страницу профиля после успешной регистрации
      navigate('/profile');
    } catch (error) {
      // Устанавливаем сообщение об ошибке при неудачной регистрации
      setError('Ошибка регистрации. Возможно, этот email уже используется.');
    }
  };

  return (
    <div className="auth-container">
      <header className="navbar">
        <div className="navbar-container">
          <h1 className="navbar-title">Библиотека Книг</h1>
          <nav className="navbar-nav">
            <a className="navbar-link" href="/">Главная</a>
            <a className="navbar-link" href="/books">Книги</a>
            <a className="navbar-link" href="/profile">Профиль</a>
            <a className="navbar-link" href="/cart">Корзина</a>
          </nav>
        </div>
      </header>

      <h1>Регистрация</h1>
      <form onSubmit={handleSignup}>
        <label>
          Имя:
          <input
            type="text"
            value={displayName}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Пароль:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {/* Отображение ошибки, если она есть */}
        {error && <p className="error">{error}</p>}

        <button type="submit">Зарегистрироваться</button>
      </form>

      <p>
        Уже есть аккаунт? <a href="/login">Войдите</a>
      </p>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 Библиотека Книг. Все права защищены.</p>
          <nav className="footer-nav">
            <a className="footer-link" href="/privacy">Политика конфиденциальности</a>
            <a className="footer-link" href="/terms">Условия использования</a>
            <a className="footer-link" href="/contact">Контакты</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default Signup;
