import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../../index';
import { collection, getDocs, query, orderBy, limit, where, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import './Home.css'; // Импортируем стили

function Home() {
  const [user] = useAuthState(auth); // Получаем текущего пользователя
  const [books, setBooks] = useState([]); // Состояние для популярных книг
  const [newArrivals, setNewArrivals] = useState([]); // Состояние для новинок
  const [recommendedBooks, setRecommendedBooks] = useState([]); // Состояние для рекомендаций
  const [loading, setLoading] = useState(true); // Состояние для загрузки
  const [userTags, setUserTags] = useState([]); // Состояние для тегов пользователя
  const [quotaExceeded, setQuotaExceeded] = useState(false); // Состояние для превышения квоты запросов Firebase

  // Загружаем теги пользователя при изменении состояния user
  useEffect(() => {
    const fetchUserTags = async () => {
      if (!user) return;

      try {
        const usersCollection = collection(db, 'users');
        const userQuery = query(usersCollection, where('uid', '==', user.uid));
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const userData = userDoc.data();
          setUserTags(userData.tags || []);
        }
      } catch (error) {
        if (error.code === 'quota-exceeded') {
          setQuotaExceeded(true);
        } else {
          console.error('Ошибка загрузки тегов пользователя:', error);
        }
      }
    };

    fetchUserTags();
  }, [user]);

  // Загружаем книги при изменении тегов пользователя или превышении квоты
  useEffect(() => {
    const fetchBooks = async () => {
      if (quotaExceeded) return;

      setLoading(true);
      try {
        const booksQuery = query(collection(db, 'books'), orderBy('popularity', 'desc'), limit(10));
        const querySnapshot = await getDocs(booksQuery);
        setBooks(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const newArrivalsQuery = query(collection(db, 'books'), orderBy('dateAdded', 'desc'), limit(20));
        const newArrivalsSnapshot = await getDocs(newArrivalsQuery);
        setNewArrivals(newArrivalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        let recommendationsQuery;
        if (userTags.length > 0) {
          recommendationsQuery = query(collection(db, 'books'), where('tags', 'array-contains-any', userTags), limit(6));
        } else {
          recommendationsQuery = query(collection(db, 'books'), limit(6));
        }

        const recommendationsSnapshot = await getDocs(recommendationsQuery);
        setRecommendedBooks(recommendationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        if (error.code === 'quota-exceeded') {
          setQuotaExceeded(true);
        } else {
          console.error('Ошибка загрузки книг:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    if (userTags.length >= 0) {
      fetchBooks();
    }
  }, [userTags, quotaExceeded]);

  // Добавляем книгу в корзину
  const addToCart = (book) => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const existingItem = cartItems.find(item => item.id === book.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartItems.push({ ...book, quantity: 1 });
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    alert('Книга добавлена в корзину!');
  };

  // Добавляем книгу в избранное
  const addToFavorites = async (bookId) => {
    const user = auth.currentUser;
    if (!user) {
      alert('Пожалуйста, войдите в систему, чтобы добавить книгу в избранное.');
      return;
    }
  
    try {
      const usersCollection = collection(db, 'users');
      const userQuery = query(usersCollection, where('uid', '==', user.uid));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        // Получаем ссылку на документ пользователя
        const userDoc = userSnapshot.docs[0];
        const userRef = doc(db, 'users', userDoc.id);

        // Обновляем документ пользователя, добавляя bookId в массив favorites
        await updateDoc(userRef, {
          favorites: arrayUnion(bookId)
        });
    
        alert('Книга добавлена в избранное!');
      }
    } catch (error) {
      console.error('Ошибка при добавлении книги в избранное:', error);
      alert('Произошла ошибка при добавлении книги в избранное.');
    }
  };

  if (quotaExceeded) {
    return <p>Превышен лимит запросов. Попробуйте позже.</p>;
  }

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="home">
      <header className="navbar">
        <div className="navbar-container">
          <h1 className="navbar-title">Библиотека Книг</h1>
          <nav className="navbar-nav">
            <a className="navbar-link" href="/books">Книги</a>
            <a className="navbar-link" href="/profile">Профиль</a>
            <a className="navbar-link" href="/cart">Корзина</a>
          </nav>
        </div>
      </header>

      <main className="home-main">
        <section className="home-hero">
          <h2>Добро пожаловать в нашу библиотеку!</h2>
          <p>Исследуйте нашу коллекцию книг и находите свои любимые произведения.</p>
          <Link to="/search" className="search-button">Поиск книг</Link>
        </section>

        <section className="books-section">
          <h2>Популярные книги</h2>
          <div className="books-list">
            {books.map(book => (
              <Link key={book.id} to={`/book/${book.id}`} className="book-card">
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
                            <span className="price-original">{(book.price / (1 - book.discount / 100)).toFixed()} руб.</span>
                          </>
                        )}
                        {book.discount === 0 && <span>{book.price} руб.</span>}
                      </>
                    )}
                  </p>
                  <div className="book-actions">
                    <button onClick={() => addToCart(book)} className="add-to-cart">В корзину</button>
                    <button 
                      className="add-to-favorites" 
                      onClick={() => addToFavorites(book.id)}
                    >
                      В избранное
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="recommended-section">
          <h2>Может понравиться</h2>
          <div className="books-list">
            {recommendedBooks.map(book => (
              <Link key={book.id} to={`/book/${book.id}`} className="book-card">
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
                            <span className="price-original">{(book.price / (1 - book.discount / 100)).toFixed()} руб.</span>
                          </>
                        )}
                        {book.discount === 0 && <span>{book.price} руб.</span>}
                      </>
                    )}
                  </p>
                  <div className="book-actions">
                    <button onClick={() => addToCart(book)} className="add-to-cart">В корзину</button>
                    <button 
                      className="add-to-favorites" 
                      onClick={() => addToFavorites(book.id)}
                    >
                      В избранное
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="new-arrivals">
          <h2>Новинки</h2>
          <div className="books-list">
            {newArrivals.map(book => (
              <Link key={book.id} to={`/book/${book.id}`} className="book-card">
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
                            <span className="price-original">{(book.price / (1 - book.discount / 100)).toFixed()} руб.</span>
                          </>
                        )}
                        {book.discount === 0 && <span>{book.price} руб.</span>}
                      </>
                    )}
                  </p>
                  <div className="book-actions">
                    <button onClick={() => addToCart(book)} className="add-to-cart">В корзину</button>
                    <button 
                      className="add-to-favorites" 
                      onClick={() => addToFavorites(book.id)}
                    >
                      В избранное
                    </button>
                  </div>
                </div>
              </Link>
            ))}
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

export default Home;