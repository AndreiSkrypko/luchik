'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

const topInfo = [
  {
    lines: [
      { type: 'label', text: 'Часы работы :' },
      { type: 'value', text: 'с 9:00–20:00' },
    ],
  },
  {
    lines: [
      { type: 'link', text: 'info@detstvoclub.ru', href: 'mailto:info@detstvoclub.ru' },
    ],
    socials: [
      { href: 'https://instagram.com', label: 'Instagram', className: styles.socialInstagram, icon: styles.instagramIcon },
      { href: 'https://vk.com', label: 'VK', className: styles.socialVk, icon: styles.vkIcon },
      { href: 'https://ok.ru', label: 'Одноклассники', className: styles.socialOk, icon: styles.okIcon },
    ],
  },
];

const locations = [
  {
    city: 'г. Лида,',
    address: 'Замковая, 4',
    phone: '(8044) 552-3267',
    phoneLink: '+37580445523267',
  },
  {
    city: 'г. Лида,',
    address: 'Кооперативная, 36',
    phone: '(8029) 866-7663',
    phoneLink: '+37580298667663',
  },
];

const enrollmentHighlights = [
  'мини-сад',
  'раннее развитие',
  'изостудия',
  'музыка',
  'танцы',
  'робототехника',
  'логопед',
  'шахматы',
];

const heroBenefits = [
  {
    title: 'Программы от 1 года до 12 лет',
    description: 'Комплексные занятия для малышей и школьников, подготовка к школе и интенсивы.',
  },
  {
    title: 'Педагоги с опытом',
    description: 'Команда логопедов, педагогов раннего развития, наставников по STEM-направлениям.',
  },
  {
    title: 'Семейная атмосфера',
    description: 'Тёплое пространство, где детям спокойно, интересно и безопасно каждый день.',
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.topBar} data-top-bar>
        <div className={styles.topBarInner}>
          <Link href="/" className={styles.brandCell} aria-label="Вернуться на главную">
            <div className={styles.brandText}>
              <span className={styles.brandDescriptor}>Детский центр современных знаний</span>
              <span className={styles.brandName}>«Лучик»</span>
            </div>
          </Link>

          {topInfo.map((item, index) => (
            <div key={index} className={styles.infoCell}>
              <div className={styles.infoLines}>
                {item.lines.map((line) => {
                  if (line.type === 'label') {
                    return (
                      <span key={line.text} className={styles.infoLabel}>
                        {line.text}
                      </span>
                    );
                  }
                  if (line.type === 'value') {
                    return (
                      <span key={line.text} className={styles.infoValue}>
                        {line.text}
                      </span>
                    );
                  }
                  if (line.type === 'link') {
                    return (
                      <a key={line.text} href={line.href} className={styles.infoLink}>
                        {line.text}
                      </a>
                    );
                  }
                  return null;
                })}
                {item.socials && (
                  <div className={styles.socialLinks}>
                    {item.socials.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        className={`${styles.socialLink} ${social.className}`}
                        aria-label={social.label}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className={social.icon} aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {locations.map((location) => (
            <div key={location.address} className={styles.infoCell}>
              <div className={styles.infoLines}>
                <span className={styles.infoCity}>{location.city}</span>
                <span className={styles.infoAddress}>{location.address}</span>
                <a href={`tel:${location.phoneLink}`} className={styles.infoPhone}>
                  {location.phone}
                </a>
              </div>
            </div>
          ))}

          <div className={styles.actionsCell}>
            <a href="tel:+37580445523267" className={styles.callbackButton}>
              <span className={styles.callbackCircle}>
                <span className={styles.callbackIcon} aria-hidden="true" />
              </span>
              <span className={styles.callbackLabel}>Обратный звонок</span>
            </a>
          </div>
        </div>
      </header>

      <Navbar />

      <main className={styles.main}>
        <section className={styles.banner}>
          <div className={styles.bannerContainer}>
            <p className={styles.bannerTitle}>Открыт набор на новый учебный год 2025–2026 гг.</p>
            <ul className={styles.bannerList}>
              {enrollmentHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <div className={styles.heroCopy}>
              <span className={styles.heroBadge}>Клуб детства «Лучик»</span>
              <h1 className={styles.heroTitle}>Наши программы</h1>
              <p className={styles.heroSubtitle}>
                Комплексные развивающие занятия, мини-сад, творческие студии и современные технологии для детей от 1 до
                12 лет. Забота, внимание и тёплая атмосфера каждый день.
              </p>

              <ul className={styles.heroBenefits}>
                {heroBenefits.map((benefit) => (
                  <li key={benefit.title}>
                    <strong>{benefit.title}</strong>
                    <span>{benefit.description}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.heroActions}>
                <a
                  className={styles.primaryAction}
                  href="https://wa.me/37580445523267"
                  target="_blank"
                  rel="noreferrer"
                >
                  Записаться на пробное занятие
                </a>
                <Link href="/trainers" className={styles.secondaryAction}>
                  Тренажёры
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

