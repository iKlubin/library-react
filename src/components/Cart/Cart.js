import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../../index'; // Импортируем Firebase
import { collection, addDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth'; // Импортируем хук для проверки авторизации
import './Cart.css'; // Импортируем стили для корзины

const Cart = () => {
  // Состояния для хранения элементов корзины и общей стоимости
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [user] = useAuthState(auth); // Хук для получения текущего пользователя

  useEffect(() => {
    // Загружаем элементы корзины из localStorage при монтировании компонента
    const items = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(items);
    calculateTotal(items); // Пересчитываем общую стоимость
  }, []);

  // Функция для пересчета общей стоимости корзины
  const calculateTotal = (items) => {
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalPrice(total);
  };

  // Функция для обновления количества товара в корзине
  const updateQuantity = (id, quantity) => {
    const updatedItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(quantity, 1) } : item
    );
    setCartItems(updatedItems);
    calculateTotal(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  // Функция для удаления товара из корзины
  const removeItem = (id) => {
    const updatedItems = cartItems.filter(item => item.id !== id);
    setCartItems(updatedItems);
    calculateTotal(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  // Функция для обработки оформления заказа
  const handleCheckout = async () => {
    if (!user) {
      alert('Пожалуйста, войдите в систему для оформления заказа.');
      return;
    }

    try {
      // Формируем данные заказа с идентификаторами книг и их количеством
      const order = {
        userId: user.uid,
        items: cartItems.map(item => ({
          bookId: item.id,
          quantity: item.quantity,
        })),
        totalPrice,
        createdAt: new Date(),
      };

      // Сохраняем заказ в базе данных
      await addDoc(collection(db, 'orders'), order);
      
      // Очистка корзины
      localStorage.removeItem('cartItems');
      setCartItems([]);
      setTotalPrice(0);
      
      alert('Ваш заказ оформлен!');
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      alert('Произошла ошибка при оформлении заказа.');
    }
  };

  // Если корзина пуста, отображаем сообщение и ссылку для продолжения покупок
  if (cartItems.length === 0) {
    return (
      <div>
        <header className="navbar">
          <div className="navbar-container">
            <h1 className="navbar-title">Библиотека Книг</h1>
            <nav className="navbar-nav">
              <Link className="navbar-link" to="/">Главная</Link>
              <Link className="navbar-link" to="/books">Книги</Link>
              <Link className="navbar-link" to="/profile">Профиль</Link>
              <Link className="navbar-link" to="/cart">Корзина</Link>
            </nav>
          </div>
        </header>
        <div className="cart">
          <h2>Корзина пуста</h2>
          <Link to="/" className="continue-shopping">Продолжить покупки</Link>
        </div>
        <footer className="footer">
          <div className="footer-content">
            <p>&copy; 2024 Библиотека Книг. Все права защищены.</p>
            <nav className="footer-nav">
              <Link className="footer-link" to="/privacy">Политика конфиденциальности</Link>
              <Link className="footer-link" to="/terms">Условия использования</Link>
              <Link className="footer-link" to="/contact">Контакты</Link>
            </nav>
          </div>
        </footer>
      </div>
    );
  }

  // Отображаем корзину с элементами и кнопками для управления
  return (
    <div>
      <header className="navbar">
        <div className="navbar-container">
          <h1 className="navbar-title">Библиотека Книг</h1>
          <nav className="navbar-nav">
            <Link className="navbar-link" to="/">Главная</Link>
            <Link className="navbar-link" to="/books">Книги</Link>
            <Link className="navbar-link" to="/profile">Профиль</Link>
            <Link className="navbar-link" to="/cart">Корзина</Link>
          </nav>
        </div>
      </header>
      <div className="cart">
        <h2>Корзина покупок</h2>
        <div className="cart-items">
          {cartItems.map(item => (
            <div className="cart-item" key={item.id}>
              <img src={item.coverImage} alt={item.title} className="cart-item-image" />
              <div className="cart-item-details">
                <h3>{item.title}</h3>
                <p>Автор: {item.author}</p>
                <div className="cart-item-actions">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    className="cart-item-quantity"
                  />
                  <button onClick={() => removeItem(item.id)} className="remove-item">Удалить</button>
                </div>
              </div>
              <div className="cart-item-price">
                <p>{item.price * item.quantity} руб.</p>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h3>Итого:</h3>
          <p>{totalPrice} руб.</p>
          <button onClick={handleCheckout} className="checkout-button">Оформить заказ</button>
          <Link to="/" className="continue-shopping">Продолжить покупки</Link>
        </div>
      </div>
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 Библиотека Книг. Все права защищены.</p>
          <nav className="footer-nav">
            <Link className="footer-link" to="/privacy">Политика конфиденциальности</Link>
            <Link className="footer-link" to="/terms">Условия использования</Link>
            <Link className="footer-link" to="/contact">Контакты</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Cart;
