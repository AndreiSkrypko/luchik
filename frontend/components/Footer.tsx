'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './Footer.module.css';

const phoneNumbers = [
  { label: 'Замковая, 4', value: '(8044) 5523267', tel: '+37580445523267', marker: 'blue' as const },
  { label: 'Кооперативная, 36', value: '(8029) 8667663', tel: '+37580298667663', marker: 'red' as const },
];

const schedule = [
  { title: 'Понедельник — Пятница', value: '09:00 – 20:00' },
  { title: 'Суббота — Воскресенье', value: '10:00 – 18:00' },
];

const socials = [
  { label: '@lu4ik_lida', href: 'https://www.instagram.com/lu4ik_lida', marker: 'pink' as const, caption: 'Instagram' },
  { label: 'vk.com/luchiklida', href: 'https://vk.com/luchiklida', marker: 'blue' as const, caption: 'VK' },
  { label: 'ok.ru/luchiklida', href: 'https://ok.ru/luchiklida', marker: 'orange' as const, caption: 'OK' },
];

const navLinks = [
  { label: 'Главная', href: '/' },
  { label: 'Курсы', href: '/courses' },
  { label: 'О нас', href: '/about' },
  { label: 'Контакты', href: '/contacts' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.background} />
      <div className={styles.container}>
        <motion.div
          className={styles.brandRow}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.brandText}>
            <span className={styles.brandDescriptor}>Детский центр современных знаний</span>
            <h2 className={styles.brandName}>«Лучик»</h2>
            <p>Наши программы помогают детям от 1 до 17 лет раскрыть таланты, найти друзей и полюбить знания.</p>
          </div>
        </motion.div>

        <motion.div
          className={styles.columns}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Контакты</h3>
            <div className={styles.phoneList}>
              {phoneNumbers.map((phone, index) => (
                  <motion.a
                    key={phone.value}
                    href={`tel:${phone.tel}`}
                    className={styles.phoneCard}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18, delay: index * 0.05 }}
                >
                  <span className={styles.phoneLabel}>{phone.label}</span>
                  <span className={styles.phoneValue}>{phone.value}</span>
                </motion.a>
              ))}
            </div>
            <div className={styles.schedule}>
              {schedule.map((item) => (
                <div key={item.title} className={styles.scheduleRow}>
                  <span>{item.title}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Навигация</h3>
            <ul className={styles.navList}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.navLink}>
                    <span className={`${styles.navMarker} ${styles.markerblue}`} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Мы в соцсетях</h3>
            <div className={styles.socialList}>
              {socials.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialCard}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <span className={styles.socialCaption}>{social.caption}</span>
                  <span className={styles.socialLabel}>{social.label}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className={styles.bottom}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p>© {currentYear} Детский центр «Лучик». С любовью к детям и знаниям.</p>
          <div className={styles.starRow}>
            {[...Array(4)].map((_, index) => (
              <motion.span
                key={index}
                className={styles.star}
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.2 }}
              >
                ⭐
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

