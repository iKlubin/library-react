import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../index'; // Импортируем экземпляр Firebase Auth
import { signInWithEmailAndPassword } from 'firebase/auth';
import './Auth.css';

function Login() {
  // Состояния для хранения email, пароля и ошибки
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Хук для навигации

  // Функция обработки отправки формы
  const handleLogin = async (e) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы
    setError(null); // Сброс ошибки перед попыткой входа

    try {
      // Пытаемся войти с помощью email и пароля
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/profile'); // Перенаправляем пользователя на страницу профиля
    } catch (error) {
      // Устанавливаем сообщение об ошибке при неудачном входе
      setError('Ошибка входа. Пожалуйста, проверьте ваши данные.');
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

      <h1>Вход</h1>
      <form onSubmit={handleLogin}>
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

        <button type="submit">Войти</button>
      </form>

      <p>
        Нет аккаунта? <a href="/signup">Зарегистрируйтесь</a>
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

export default Login;
