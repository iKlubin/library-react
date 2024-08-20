import React, { useEffect, useState } from 'react';
import { db, auth } from '../../index';
import { collection, getDocs, query, orderBy, doc, updateDoc, arrayUnion, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import styles from './Books.module.css';

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загружаем книги из Firestore при монтировании компонента
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Запрашиваем книги, отсортированные по количеству просмотров
        const booksQuery = query(collection(db, 'books'), orderBy('views', 'desc'));
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
  }, []);

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

  // Добавляем книгу в избранное для текущего пользователя
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

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className={styles.booksPage}>
      <header className={styles.navbar}>
        <div className={styles.navbarContainer}>
          <h1 className={styles.navbarTitle}>Все книги</h1>
          <nav className={styles.navbarNav}>
            <a className={styles.navbarLink} href="/">Главная</a>
            <a className={styles.navbarLink} href="/search">Поиск</a>
            <a className={styles.navbarLink} href="/profile">Профиль</a>
            <a className={styles.navbarLink} href="/cart">Корзина</a>
          </nav>
        </div>
      </header>

      <main className={styles.booksMain}>
        <section className={styles.booksList}>
          {books.map(book => (
            <div key={book.id} className={styles.bookCard}>
              <Link to={`/book/${book.id}`} className={styles.bookLink}>
                <img src={book.coverImage} alt={book.title} className={styles.bookCover} />
              </Link>
              <div className={styles.bookInfo}>
                <Link to={`/book/${book.id}`} className={styles.bookTitleLink}>
                  <h2>{book.title}</h2>
                </Link>
                
                <p className={styles.author}>Автор: {book.author}</p>
                <p className={styles.description}>{book.description}</p>
                <p className={styles.price}>
                  {book.isFree ? (
                    <span className={styles.priceFree}>Бесплатно</span>
                  ) : (
                    <>
                      {book.discount > 0 && (
                        <>
                          <span className={styles.priceDiscounted}>{book.price} руб.</span>
                          <span className={styles.priceOriginal}>{(book.price / (1 - book.discount / 100)).toFixed()} руб.</span>
                        </>
                      )}
                      {book.discount === 0 && <span>{book.price} руб.</span>}
                    </>
                  )}
                </p>
                <p className={styles.views}>Просмотры: {book.views}</p>
                <div className={styles.actions}>
                  <button 
                    onClick={() => addToCart(book)} 
                    className={styles.cartButton}
                  >
                    В корзину
                  </button>
                  <button 
                    onClick={() => addToFavorites(book.id)} 
                    className={styles.favoriteButton}
                  >
                    В избранное
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>&copy; 2024 Библиотека Книг. Все права защищены.</p>
          <nav className={styles.footerNav}>
            <a className={styles.footerLink} href="/privacy">Политика конфиденциальности</a>
            <a className={styles.footerLink} href="/terms">Условия использования</a>
            <a className={styles.footerLink} href="/contact">Контакты</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default Books;
