import React from 'react';
import { useForm } from 'react-hook-form';
import { db, storage } from '../../index';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import './AddBook.css';

function AddBook() {
  // Хук useForm для управления формой
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Функция для обработки отправки формы
  const onSubmit = async (data) => {
    const { title, author, description, price, isFree, category, popularity, tags, coverImage, about } = data;

    // Загрузка обложки книги в Firebase Storage
    const file = coverImage[0];
    const storageRef = ref(storage, `covers/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      // Отслеживание состояния загрузки (можно добавить прогрессбар)
      () => {},
      (error) => {
        // Обработка ошибок загрузки
        console.error('Ошибка загрузки изображения:', error);
      },
      async () => {
        // Получение URL загруженного файла
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // Добавление книги в Firestore
        try {
          await addDoc(collection(db, 'books'), {
            title,
            author,
            description,
            price: parseFloat(price),
            isFree: isFree === 'true',
            coverImage: downloadURL,
            category,
            popularity: parseInt(popularity),
            tags: tags.split(',').map(tag => tag.trim()), // Преобразование тегов в массив
            about,
            reviews: [], // Начальные значения для отзывов
            views: 0, // Начальные значения для просмотров
            dateAdded: new Date(), // Дата добавления книги
            discount: 0 // Начальное значение для скидки
          });
          alert('Книга добавлена успешно!');
        } catch (error) {
          // Обработка ошибок добавления книги
          console.error('Ошибка добавления книги:', error);
        }
      }
    );
  };

  return (
    <div className="add-book">
      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        {/* Поле для ввода названия */}
        <label>
          Название:
          <input {...register('title', { required: 'Это поле обязательно' })} />
          {errors.title && <p className="error">{errors.title.message}</p>}
        </label>

        {/* Поле для ввода автора */}
        <label>
          Автор:
          <input {...register('author', { required: 'Это поле обязательно' })} />
          {errors.author && <p className="error">{errors.author.message}</p>}
        </label>

        {/* Поле для ввода описания */}
        <label>
          Описание:
          <textarea {...register('description', { required: 'Это поле обязательно' })} />
          {errors.description && <p className="error">{errors.description.message}</p>}
        </label>

        {/* Поле для ввода полного описания */}
        <label>
          Полное описание:
          <textarea {...register('about', { required: 'Это поле обязательно' })} />
          {errors.about && <p className="error">{errors.about.message}</p>}
        </label>

        {/* Поле для ввода цены */}
        <label>
          Цена (в рублях):
          <input type="number" {...register('price', { required: 'Это поле обязательно' })} />
          {errors.price && <p className="error">{errors.price.message}</p>}
        </label>

        {/* Поле для выбора бесплатности книги */}
        <label>
          Бесплатно:
          <select {...register('isFree')}>
            <option value="true">Да</option>
            <option value="false">Нет</option>
          </select>
        </label>

        {/* Поле для загрузки обложки книги */}
        <label>
          Обложка книги:
          <input type="file" {...register('coverImage', { required: 'Это поле обязательно' })} />
          {errors.coverImage && <p className="error">{errors.coverImage.message}</p>}
        </label>

        {/* Поле для ввода категории */}
        <label>
          Категория:
          <input {...register('category', { required: 'Это поле обязательно' })} />
          {errors.category && <p className="error">{errors.category.message}</p>}
        </label>

        {/* Поле для ввода популярности */}
        <label>
          Популярность (от 1 до 10):
          <input type="number" {...register('popularity', { required: 'Это поле обязательно' })} />
          {errors.popularity && <p className="error">{errors.popularity.message}</p>}
        </label>

        {/* Поле для ввода тегов */}
        <label>
          Теги (через запятую):
          <input {...register('tags', { required: 'Это поле обязательно' })} />
          {errors.tags && <p className="error">{errors.tags.message}</p>}
        </label>

        {/* Кнопка для отправки формы */}
        <button type="submit">Добавить книгу</button>
      </form>
    </div>
  );
}

export default AddBook;
