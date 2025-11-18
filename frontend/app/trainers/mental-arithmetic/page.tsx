'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

const modules = [
  {
    slug: 'prosto',
    title: 'Тренажер «Просто»',
    description:
      'Тренировки на базовые вычисления и уверенную работу с маленькими числами. Подходит для быстрого разогрева перед более сложными заданиями и укрепляет фундаментальные навыки счёта.',
    mediaLabel: 'Иконка режима «Просто»',
    image: '/images/trainers/mental-arithmetic/prosto.svg',
  },
  {
    slug: 'brothers',
    title: 'Тренажер «Братья»',
    description:
      'Учимся находить связи между соседними числами и быстро определять результат без механического пересчёта. Развивает математическую интуицию и помогает видеть закономерности.',
    mediaLabel: 'Иконка режима «Братья»',
    image: '/images/trainers/mental-arithmetic/brothers.svg',
  },
  {
    slug: 'friends',
    title: 'Тренажер «Друзья»',
    description:
      'Ищем пары чисел, которые составляют заданную сумму. Развивает внимательность и мгновенное узнавание комбинаций, тренирует память и ускоряет процесс сложения в уме.',
    mediaLabel: 'Иконка режима «Друзья»',
    image: '/images/trainers/mental-arithmetic/friends.svg',
  },
  {
    slug: 'friend-brother',
    title: 'Тренажер «Друг+брат»',
    description:
      'Комбинируем сразу две стратегии: находим «друзей» и «братьев» в одном задании. Тренирует переключение внимания и гибкость мышления при решении арифметических задач.',
    mediaLabel: 'Иконка режима «Друг+брат»',
    image: '/images/trainers/mental-arithmetic/friend-brother.svg',
  },
  {
    slug: 'multiplication-table',
    title: 'Тренажер «Таблица умножения»',
    description:
      'Повторяем классическую таблицу умножения в игровом формате. Закрепляем память и скорость воспроизведения фактов, делая умножение автоматическим навыком.',
    mediaLabel: 'Иконка режима «Таблица умножения»',
    image: '/images/trainers/mental-arithmetic/multiplication-table.svg',
  },
  {
    slug: 'multiplication',
    title: 'Тренажер «Умножение»',
    description:
      'Практикуем перемножение двузначных и трёхзначных чисел в уме. Укрепляем арифметику и концентрацию, помогая уверенно работать с большими числами без калькулятора.',
    mediaLabel: 'Иконка режима «Умножение»',
    image: '/images/trainers/mental-arithmetic/multiplication.svg',
  },
  {
    slug: 'multiplication-20',
    title: 'Тренажер «Умножение до 20»',
    description:
      'Особый тренажёр на быстрый счёт в пределах двадцати. Помогает уверенно переходить к большим числам и развивает точность вычислений в базовом диапазоне.',
    mediaLabel: 'Иконка режима «Умножение до 20»',
    image: '/images/trainers/mental-arithmetic/multiplication-20.svg',
  },
  {
    slug: 'base-multiplication',
    title: 'Тренажер «Умножение от базы»',
    description:
      'Осваиваем технику умножения от ближайшей базы (10, 50, 100). Идеально для олимпиадных задач и устных ответов, значительно ускоряет вычисления.',
    mediaLabel: 'Иконка режима «Умножение от базы»',
    image: '/images/trainers/mental-arithmetic/base-multiplication.svg',
  },
  {
    slug: 'tricks',
    title: 'Тренажер «Хитрости»',
    description:
      'Собираем математические лайфхаки: сокращения, приёмы и быстрые способы решений, чтобы считать непривычные примеры. Раскрывает секреты быстрого счёта.',
    mediaLabel: 'Иконка режима «Хитрости»',
    image: '/images/trainers/mental-arithmetic/tricks.svg',
  },
  {
    slug: 'squares',
    title: 'Тренажер «Квадраты»',
    description:
      'Запоминаем квадраты чисел и учимся находить их в голову. Поможет в алгебраических преобразованиях и оценках, ускоряя решение уравнений.',
    mediaLabel: 'Иконка режима «Квадраты»',
    image: '/images/trainers/mental-arithmetic/squares.svg',
  },
  {
    slug: 'flashcards',
    title: 'Тренажер «Флэшкарты»',
    description:
      'Комбинируем визуальные карточки с числами и ответами. Отличный способ отработать реакции и закрепить результаты, развивая зрительную память.',
    mediaLabel: 'Иконка режима «Флэшкарты»',
    image: '/images/trainers/mental-arithmetic/flashcards.svg',
  },
];

export default function MentalArithmeticPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.badge}>Программа «Ментальная арифметика»</p>
          <h1 className={styles.title}>Тренажеры для тренировки устного счёта</h1>
          <p className={styles.subtitle}>
            Выбирайте режим и прокачивайте владение числами. Тренировки помогают быстрее выполнять вычисления,
            удерживать концентрацию и развивать математическую интуицию.
          </p>
        </section>

        <section className={styles.trainers}>
          {modules.map((module) => (
            <article key={module.slug} className={styles.card}>
              <div className={styles.cardMedia}>
                <Image
                  src={module.image}
                  alt={module.mediaLabel ?? module.title}
                  fill
                  sizes="(max-width: 900px) 100vw, 480px"
                />
                <span className={styles.mediaTag}>Тренажер</span>
              </div>

              <div className={styles.cardBody}>
                <h2>{module.title}</h2>
                <p className={styles.cardSubtitle}>{module.description}</p>
                <div className={styles.cardFooter}>
                  <Link href={`/trainers/mental-arithmetic/${module.slug}`} className={styles.cardButton}>
                    Запустить тренажер
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}


