import React from 'react';
import styles from './StarRating.module.css';

// Компонент для отображения рейтинга в виде звезд
const StarRating = ({ rating, onRate }) => {
  return (
    <div className={styles.starsContainer}>
      {/* Отображаем 5 звезд */}
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          // Применяем класс 'filled', если звезда соответствует рейтингу
          className={`${styles.star} ${value <= rating ? styles.filled : ''}`}
          // Обрабатываем клик по звезде
          onClick={() => onRate && onRate(value)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
