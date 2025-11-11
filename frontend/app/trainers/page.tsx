'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

interface TrainerProps {
  id: string;
  title: string;
  subtitle: string;
  description: string[];
  icon: string;
  accent: string;
}

const trainers: TrainerProps[] = [
  {
    id: 'mental-arithmetic',
    title: 'Ментальная арифметика',
    subtitle: 'Развиваем скорость устного счёта и концентрацию',
    description: [
      'Занятия подходят детям 6-12 лет',
      'Авторская программа с игровыми элементами',
      'Улучшаем память и внимание через тренировки'
    ],
    icon: '🧠',
    accent: '#5c78d6'
  },
  {
    id: 'speed-reading',
    title: 'Скорочтение',
    subtitle: 'Учимся читать быстро и понимать прочитанное',
    description: [
      'Методика для школьников от 7 лет',
      'Развиваем технику чтения и грамотность',
      'Комбинируем упражнения для глаз и памяти'
    ],
    icon: '📖',
    accent: '#e96a12'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

export default function TrainersPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <motion.section
          className={styles.hero}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Тренажеры развития
          </motion.h1>
          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Здесь собраны программы, которые помогают детям тренировать мозг,
            расширять горизонты и верить в свои возможности. Мы постоянно
            добавляем новые тренажеры и обновляем методики.
          </motion.p>
        </motion.section>

        <motion.section
          className={styles.listSection}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {trainers.map((trainer, index) => (
            <motion.article
              key={trainer.id}
              className={styles.card}
              style={{
                borderColor: trainer.accent,
                boxShadow: `0 20px 40px ${trainer.accent}22`
              }}
              variants={itemVariants}
              whileHover={{
                y: -8,
                boxShadow: `0 28px 50px ${trainer.accent}35`
              }}
              transition={{ type: 'spring', stiffness: 120 }}
            >
              <div className={styles.cardHeader}>
                <div
                  className={styles.iconWrapper}
                  style={{ background: `${trainer.accent}22`, color: trainer.accent }}
                >
                  {trainer.icon}
                </div>
                <div className={styles.heading}>
                  <h2>{trainer.title}</h2>
                  <p>{trainer.subtitle}</p>
                </div>
              </div>

              <ul className={styles.features}>
                {trainer.description.map((line, i) => (
                  <li key={i}>
                    <span className={styles.bullet} style={{ backgroundColor: trainer.accent }} />
                    {line}
                  </li>
                ))}
              </ul>

              <Link
                href={`/trainers/${trainer.id}`}
                className={styles.cardLink}
                style={{ backgroundColor: `${trainer.accent}15`, color: trainer.accent }}
              >
                Перейти к тренажёрам
              </Link>
            </motion.article>
          ))}
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}

