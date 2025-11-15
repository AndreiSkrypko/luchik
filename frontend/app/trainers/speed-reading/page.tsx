'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

const modules = [
  {
    slug: 'fading-text',
    title: 'Тренажер «Исчезающий текст»',
    description:
      'Упражнение помогает развивать скорость и технику чтения: ребёнку нужно успеть прочитать фразу до того, как она исчезнет. Время показа каждого слова одинаковое, что тренирует внимательность и ускоряет восприятие.',
    mediaLabel: 'Изображение для тренажера «Исчезающий текст»',
    image: '/images/trainers/speed-reading/fading-text.svg',
    link: '/trainers/speed-reading/fading-text'
  },
  {
    slug: 'schulte-table',
    title: 'Тренажер «Таблица Шульте»',
    description:
      'Классическая таблица Шульте учит концентрироваться и держать взгляд на всей поверхности поля. Нужно последовательно нажимать числа по возрастанию — регулярные тренировки расширяют зрительный кругозор и повышают скорость чтения.',
    mediaLabel: 'Изображение для таблицы Шульте',
    image: '/images/trainers/speed-reading/schulte-table.svg',
    link: '/trainers/speed-reading/schulte-table'
  },
  {
    slug: 'stroop-test',
    title: 'Тренажер «Тест Струпа»',
    description:
      'Карточки с названиями цветов, написанными разными оттенками, заставляют мозг быстро подбирать правильный ответ. Это упражнение развивает переключаемость внимания и быстрое принятие решений при чтении.',
    mediaLabel: 'Изображение для теста Струпа',
    image: '/images/trainers/speed-reading/stroop-test.svg',
    link: '/trainers/speed-reading/stroop-test'
  },
  {
    slug: 'flash-words',
    title: 'Тренажер «Флеш-слова»',
    description:
      'На экране всплывают слова с заданной скоростью. Их нужно запомнить и воспроизвести в той же последовательности. Тренажер укрепляет кратковременную память, концентрацию и устойчивость внимания.',
    mediaLabel: 'Изображение для тренажера «Флеш-слова»',
    image: '/images/trainers/speed-reading/flash-words.svg',
    link: '/trainers/speed-reading/flash-words'
  },
  {
    slug: 'distribute-words',
    title: 'Тренажер «Распредели слова»',
    description:
      'Нужно быстро разложить слова по заданным категориям. Задание прокачивает умение анализировать, классифицировать информацию и принимать решения на скорости — навыки незаменимы и в учебе, и в жизни.',
    mediaLabel: 'Изображение для тренажера «Распредели слова»',
    image: '/images/trainers/speed-reading/distribute-words.svg',
    link: '/trainers/speed-reading/distribute-words'
  },
  {
    slug: 'brain-buttons',
    title: 'Тренажер «Кнопки мозга»',
    description:
      'На экране мелькают ладошки с разными жестами, которые нужно тут же повторять. Тренажер соединяет умственные и физические реакции, развивает ловкость, реактивность и координацию.',
    mediaLabel: 'Изображение для тренажера «Кнопки мозга»',
    image: '/images/trainers/speed-reading/brain-buttons.svg',
    link: '/trainers/speed-reading/brain-buttons'
  },
];

export default function SpeedReadingPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.badge}>Программа «Скорочтение»</p>
          <h1 className={styles.title}>Тренажеры для развития быстрого чтения</h1>
          <p className={styles.subtitle}>
            Эти упражнения помогают детям удерживать внимание, ускорять восприятие текста и укреплять память. Выберите
            тренажер, который хочется пройти сегодня, и попробуйте вместе с ребенком.
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
                   <Link href={`/trainers/speed-reading/${module.slug}`} className={styles.cardButton}>
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


