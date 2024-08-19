import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../index';
import styles from './EditBook.css';

function EditBook() {
  const { id } = useParams(); // Получаем ID книги из URL
  const navigate = useNavigate(); // Для навигации после сохранения изменений
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    description: '',
    about: '',
    price: 0,
    discount: 0,
  });

  useEffect(() => {
    // Загружаем данные книги при монтировании компонента
    const fetchBookData = async () => {
      try {
        const bookDoc = doc(db, 'books', id); // Получаем ссылку на документ книги
        const bookSnapshot = await getDoc(bookDoc); // Получаем данные книги
        if (bookSnapshot.exists()) {
          setBookData(bookSnapshot.data()); // Устанавливаем данные книги в состояние
        } else {
          console.error('Книга не найдена');
          navigate('/'); // Перенаправляем на главную страницу, если книга не найдена
        }
      } catch (error) {
        console.error('Ошибка при загрузке книги:', error);
      }
    };

    fetchBookData();
  }, [id, navigate]);

  // Обрабатываем изменения в формах ввода
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Обрабатываем отправку формы
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookDoc = doc(db, 'books', id); // Получаем ссылку на документ книги
      await updateDoc(bookDoc, bookData); // Обновляем данные книги в Firestore
      navigate(`/books/${id}`); // Перенаправляем на страницу книги после успешного обновления
    } catch (error) {
      console.error('Ошибка при обновлении книги:', error);
    }
  };

  return (
    <div className={styles.editBook}>
      <h1>Редактировать книгу</h1>
      <form onSubmit={handleFormSubmit} className={styles.editForm}>
        <label>
          Название:
          <input
            type="text"
            name="title"
            value={bookData.title}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Автор:
          <input
            type="text"
            name="author"
            value={bookData.author}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Описание:
          <textarea
            name="description"
            value={bookData.description}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          О книге:
          <textarea
            name="about"
            value={bookData.about}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Цена:
          <input
            type="number"
            name="price"
            value={bookData.price}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Скидка (%):
          <input
            type="number"
            name="discount"
            value={bookData.discount}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit" className={styles.submitButton}>Сохранить изменения</button>
      </form>
    </div>
  );
}

export default EditBook;
