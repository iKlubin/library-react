import React, { useState, useEffect } from 'react';
import { db } from '../../index';
import { collection, getDocs, query, where } from 'firebase/firestore';
import './Search.css';

function Search() {
  const [searchQuery, setSearchQuery] = useState(''); // Хранит запрос поиска
  const [books, setBooks] = useState([]); // Хранит результаты поиска
  const [loading, setLoading] = useState(true); // Состояние загрузки

  useEffect(() => {
    // Функция для загрузки книг на основе поискового запроса
    const fetchBooks = async () => {
      try {
        let booksQuery = query(collection(db, 'books'));
        if (searchQuery) {
          // Запрос для поиска книг по заголовку
          booksQuery = query(
            collection(db, 'books'),
            where('title', '>=', searchQuery),
            where('title', '<=', searchQuery + '\uf8ff')
          );
        }

        const querySnapshot = await getDocs(booksQuery);
        const booksList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBooks(booksList);
      } catch (error) {
        console.error('Ошибка загрузки книг:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchQuery]); // Запуск эффекта при изменении поискового запроса

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value); // Обновление поискового запроса
  };

  if (loading) return <p>Загрузка...</p>; // Показываем сообщение о загрузке

  return (
    <div className="search">
      <header className="navbar">
        <div className="navbar-container">
          <h1 className="navbar-title">Поиск книг</h1>
          <nav className="navbar-nav">
            <a className="navbar-link" href="/">Главная</a>
            <a className="navbar-link" href="/profile">Профиль</a>
            <a className="navbar-link" href="/cart">Корзина</a>
          </nav>
        </div>
      </header>

      <main className="search-main">
        <input
          type="text"
          placeholder="Введите название книги..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />

        <section className="books-section">
          <h2>Результаты поиска</h2>
          <div className="books-list">
            {books.length > 0 ? (
              books.map(book => (
                <a key={book.id} href={`/book/${book.id}`} className="book-card">
                  {book.discount > 0 && (
                    <div className="discount-badge">-{book.discount}%</div>
                  )}
                  <img src={book.coverImage} alt={book.title} className="book-cover" />
                  <div className="book-info">
                    <h3>{book.title}</h3>
                    <p className="author">{book.author}</p>
                    <p className="price">
                      {book.isFree ? (
                        <span className="price-free">Бесплатно</span>
                      ) : (
                        <>
                          {book.discount > 0 && (
                            <>
                              <span className="price-discounted">{book.price} руб.</span>
                              <span className="price-original">{(book.price / (1 - book.discount / 100)).toFixed(2)} руб.</span>
                            </>
                          )}
                          {book.discount === 0 && <span>{book.price} руб.</span>}
                        </>
                      )}
                    </p>
                  </div>
                </a>
              ))
            ) : (
              <p>Книги не найдены</p> // Сообщение, если книги не найдены
            )}
          </div>
        </section>
      </main>

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

export default Search;
