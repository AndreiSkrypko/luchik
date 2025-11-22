'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import styles from './Navbar.module.css';

interface MenuItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
}

const menuItems: MenuItem[] = [
  { label: 'Главная', href: '/' },
  { label: 'О нас', href: '/about', hasDropdown: true },
  { label: 'Занятия', href: '/courses', hasDropdown: true },
  { label: 'Летний клуб', href: '/summer-club' },
  { label: 'Мини-сад', href: '/mini-kindergarten' },
  { label: 'Расписание', href: '/schedule' },
  { label: 'Тренажёры', href: '/trainers' },
  { label: 'Галерея', href: '/gallery', hasDropdown: true },
  { label: 'Статьи', href: '/articles', hasDropdown: true },
  { label: 'Цены', href: '/pricing', hasDropdown: true },
  { label: 'Контакты', href: '/contacts' },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [isStuck, setIsStuck] = useState(false);
  const [navHeight, setNavHeight] = useState(0);

  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) {
      return;
    }

    const updateNavHeight = () => {
      setNavHeight(navEl.offsetHeight);
    };

    const handleScroll = () => {
      const topBar = document.querySelector('[data-top-bar]') as HTMLElement | null;
      const topOffset = topBar ? topBar.offsetHeight : 0;
      const shouldStick = window.scrollY >= topOffset;

      setIsStuck((prev) => {
        if (prev === shouldStick) {
          return prev;
        }
        return shouldStick;
      });
    };

    updateNavHeight();
    handleScroll();

    window.addEventListener('resize', updateNavHeight);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', updateNavHeight);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={styles.navRoot} style={isStuck ? { height: navHeight } : undefined}>
      <nav ref={navRef} className={`${styles.navbar} ${isStuck ? styles.sticky : ''}`}>
        <div className={styles.container}>
          <ul className={styles.menu}>
            {menuItems.map((item, index) => (
              <li key={item.label} className={styles.menuItem}>
                <Link href={item.href} className={styles.menuLink}>
                  <span>{item.label}</span>
                  {item.hasDropdown && <span className={styles.menuCaret} aria-hidden="true" />}
                </Link>
                {index < menuItems.length - 1 && (
                  <span
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '20%',
                      bottom: '20%',
                      width: '1px',
                      background: 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.3) 20%, rgba(255, 255, 255, 0.3) 80%, transparent 100%)',
                      opacity: 0.5,
                    }}
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}

