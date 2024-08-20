import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../../index';
import styles from './BookDetail.module.css';
import StarRating from './StarRating';

function BookDetails() {
  const { id } = useParams(); // Получаем ID книги из URL
  const [user] = useAuthState(auth); // Получаем информацию о текущем пользователе
  const [book, setBook] = useState(null); // Данные о книге
  const [loading, setLoading] = useState(true); // Статус загрузки
  const [error, setError] = useState(null); // Сообщение об ошибке
  const [newReview, setNewReview] = useState(''); // Новый отзыв
  const [rating, setRating] = useState(0); // Оценка
  const [reviewError, setReviewError] = useState(null); // Сообщение об ошибке при добавлении отзыва
  const [otherBooks, setOtherBooks] = useState([]); // Другие книги автора

  // Загружаем данные о книге
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const bookDoc = doc(db, 'books', id);
        const bookSnapshot = await getDoc(bookDoc);
        if (bookSnapshot.exists()) {
          const bookData = bookSnapshot.data();
          
          // Вычисляем средний рейтинг
          if (bookData.reviews && bookData.reviews.length > 0) {
            const totalRating = bookData.reviews.reduce((sum, review) => sum + review.rating, 0);
            bookData.rating = totalRating / bookData.reviews.length;
          } else {
            bookData.rating = 0;
          }

          setBook(bookData);

          // Обновляем количество просмотров
          await updateDoc(bookDoc, {
            views: increment(1)
          });
        } else {
          setError('Книга не найдена');
        }
      } catch (err) {
        setError('Ошибка при загрузке книги');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  // Загружаем другие книги автора
  useEffect(() => {
    const fetchOtherBooks = async () => {
      try {
        if (book && book.author) {
          const booksCollection = collection(db, 'books');
          const booksQuery = query(booksCollection, where('author', '==', book.author));
          const querySnapshot = await getDocs(booksQuery);
          
          const books = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(otherBook => otherBook.id !== id);
          
          setOtherBooks(books);
        }
      } catch (error) {
        console.error('Ошибка при загрузке других книг:', error);
      }
    };

    fetchOtherBooks();
  }, [book, id]);

  // Добавляем книгу в корзину (пока только выводим сообщение в консоль)
  const handleAddToCart = () => {
    console.log('Книга добавлена в корзину');
  };

  // Добавляем книгу в избранное
  const handleAddToFavorites = async () => {
    if (!user) {
      alert('Пожалуйста, войдите в систему');
      return;
    }

    try {
      const userDoc = doc(db, 'users', user.uid);
      await updateDoc(userDoc, {
        favorites: arrayUnion(id)
      });
      alert('Книга добавлена в избранное!');
    } catch (error) {
      console.error('Ошибка при добавлении книги в избранное:', error);
      alert('Ошибка при добавлении книги в избранное.');
    }
  };

  // Обрабатываем отправку отзыва
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (newReview.trim() === '' || rating === 0) {
      setReviewError('Отзыв и оценка не могут быть пустыми');
      return;
    }
    setReviewError(null);

    try {
      const bookDocRef = doc(db, 'books', id);

      const newReviewData = {
        name: user.displayName,
        text: newReview,
        rating: rating,
        createdAt: new Date(),
      };

      await updateDoc(bookDocRef, {
        reviews: arrayUnion(newReviewData),
      });

      setNewReview('');
      setRating(0);
      setBook((prevBook) => ({
        ...prevBook,
        reviews: [...prevBook.reviews, newReviewData],
        rating: ((prevBook.rating * prevBook.reviews.length) + rating) / (prevBook.reviews.length + 1), // обновляем рейтинг в состоянии
      }));
    } catch (error) {
      setReviewError('Ошибка при добавлении отзыва');
    }
  };

  if (loading) return <p className={styles.loading}>Загрузка...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

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
      
      <div className={styles.bookDetail}>
        {book && (
          <div className={styles.bookDetailContainer}>
            <img
              src={book.coverImage || 'https://via.placeholder.com/300x450'}
              alt={book.title}
              className={styles.bookCover}
            />
            <div className={styles.bookInfo}>
              <h1 className={styles.bookTitle}>{book.title}</h1>
              <p className={styles.bookAuthor}>Автор: {book.author}</p>
              <p className={styles.bookDescription}>{book.description}</p>
              <div className={styles.bookTags}>
                <h3>Теги:</h3>
                <div className={styles.tagsContainer}>
                  {book.tags && book.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.bookRating}>
                <h2 className={styles.ratingTitle}>Рейтинг</h2>
                <div className={styles.starRatingContainer}>
                  <StarRating rating={Math.round(book.rating)} />
                  <p className={styles.ratingNumber}>{book.rating.toFixed(1)}</p>
                </div>
              </div>
              <div className={styles.bookActions}>
                <div className={styles.bookPrice}>
                  {book.isFree ? (
                    <span className={styles.priceFree}>Бесплатно</span>
                  ) : (
                    <>
                      {book.discount > 0 && (
                        <>
                          <span className={styles.priceDiscounted}>
                            {((book.price - (book.price * book.discount) / 100).toFixed())} ₽
                          </span>
                          <span className={styles.priceOriginal}>{book.price.toFixed()} ₽</span>
                        </>
                      )}
                      {book.discount === 0 && <span>{book.price.toFixed()} ₽</span>}
                    </>
                  )}
                </div>
                <button onClick={handleAddToCart} className={styles.cartButton}>
                  В корзину
                </button>
                <button onClick={handleAddToFavorites} className={styles.favoriteButton}>
                  В избранное
                </button>
              </div>
              <div className={styles.bookAbout}>
                <h2>О книге</h2>
                <p>{book.about}</p>
              </div>
              {otherBooks.length > 0 && (
                <div className={styles.otherBooksContainer}>
                  <h2>Другие книги автора</h2>
                  <div className={styles.otherBooksGrid}>
                    {otherBooks.map((book) => (
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
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <div className={styles.bookReviews}>
                <h2>Отзывы</h2>
                {user && (
                  <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                    <textarea
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      placeholder="Напишите ваш отзыв..."
                      className={styles.reviewTextarea}
                    />
                    <div className={styles.ratingContainer}>
                      <label className={styles.ratingLabel}>Оценка:</label>
                      <StarRating rating={rating} onRate={setRating} />
                    </div>
                    <button type="submit" className={styles.submitReviewButton}>
                      Отправить отзыв
                    </button>
                    {reviewError && <p className={styles.error}>{reviewError}</p>}
                  </form>
                )}
                {book.reviews && book.reviews.length > 0 ? (
                  <div className={styles.reviewsContainer}>
                    {book.reviews.map((review, index) => (
                      <div key={index} className={styles.reviewBlock}>
                        <p className={styles.reviewName}><strong>{review.name}</strong></p>
                        <p className={styles.reviewText}>{review.text}</p>
                        <div className={styles.reviewRating}>
                          <StarRating rating={review.rating} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Отзывов пока нет</p>
                )}
              </div>
            </div>
          </div>
        )}
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

export default BookDetails;
