import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Link } from 'react-router-dom';
import { auth, db } from '../../index';
import { collection, query, where, getDocs, updateDoc, arrayRemove, doc } from 'firebase/firestore';
import './Profile.css';

function Profile() {
  const [user] = useAuthState(auth); // Получаем текущего пользователя
  const [favoriteBooks, setFavoriteBooks] = useState([]); // Состояние для избранных книг

  useEffect(() => {
    // Получаем избранные книги пользователя
    const fetchFavorites = async () => {
      if (user) {
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('uid', '==', user.uid));
          const userSnap = await getDocs(q);

          if (!userSnap.empty) {
            const userData = userSnap.docs[0].data();
            const favorites = userData.favorites || [];

            if (favorites.length > 0) {
              const booksQuery = query(collection(db, 'books'), where('__name__', 'in', favorites));
              const booksSnapshot = await getDocs(booksQuery);
              const books = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setFavoriteBooks(books);
            }
          }
        } catch (error) {
          console.error('Ошибка при загрузке избранного:', error);
        }
      }
    };

    fetchFavorites();
  }, [user]);

  // Обрабатываем удаление книги из избранного
  const handleRemoveFromFavorites = async (bookId) => {
    if (!user) return;

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', '==', user.uid));
      const userSnap = await getDocs(q);

      if (!userSnap.empty) {
        const userDocId = userSnap.docs[0].id;
        const userDocRef = doc(db, 'users', userDocId);

        // Удаляем книгу из избранного
        await updateDoc(userDocRef, {
          favorites: arrayRemove(bookId),
        });

        // Обновляем состояние после удаления
        setFavoriteBooks(favoriteBooks.filter(book => book.id !== bookId));
      }
    } catch (error) {
      console.error('Ошибка при удалении книги из избранного:', error);
    }
  };

  return (
    <div className="profile-page">
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

      <div className="profile-container">
        {user ? (
          <div className="profile-details">
            <h1>Профиль пользователя</h1>
            <img src={user.photoURL || 'https://via.placeholder.com/150'} alt="Avatar" className="profile-avatar" />
            <p><strong>Имя:</strong> {user.displayName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <button onClick={() => auth.signOut()} className="logout-button">Выйти</button>
          </div>
        ) : (
          <div className="auth-prompt">
            <h1>Вы не авторизованы</h1>
            <p>Пожалуйста, <Link to="/login" className="auth-link">войдите</Link> или <Link to="/signup" className="auth-link">зарегистрируйтесь</Link>.</p>
          </div>
        )}
      </div>

      {user && favoriteBooks.length > 0 && (
        <div className="favorites-section">
          <h2>Избранные книги</h2>
          <div className="favorites-grid">
            {favoriteBooks.map(book => (
              <div key={book.id} className="book-card">
                <Link to={`/book/${book.id}`} className="book-cover-link">
                  <img src={book.coverImage} alt={book.title} className="book-cover" />
                </Link>
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p className="author">{book.author}</p>
                  <button
                    onClick={() => handleRemoveFromFavorites(book.id)}
                    className="remove-favorite-button"
                  >
                    Удалить из избранного
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

export default Profile;
