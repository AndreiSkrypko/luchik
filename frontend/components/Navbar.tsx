'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import styles from './Navbar.module.css';

interface MenuItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  dropdownType?: 'courses' | 'default';
  dropdownItems?: { label: string; href: string }[];
}

interface AgeGroup {
  label: string;
  href: string;
  courses?: { label: string; href: string }[];
}

interface CourseCategory {
  label: string;
  ageGroups: AgeGroup[];
}

const courseCategories: CourseCategory[] = [
  {
    label: 'Дошкольники',
    ageGroups: [
      { label: 'От 1 года', href: 'https://robotlida.by/courses/age/1' },
      {
        label: 'От 2 лет',
        href: 'https://robotlida.by/courses_2_4/',
        courses: [
          { label: 'Лего-развивайка', href: 'https://robotlida.by/courses_2_4/' },
        ],
      },
      {
        label: 'От 3 лет',
        href: 'https://robotlida.by/courses_2_4/',
        courses: [
          { label: 'Лего-развивайка', href: 'https://robotlida.by/courses_2_4/' },
        ],
      },
      {
        label: 'От 4 лет',
        href: 'https://robotlida.by/courses_4_6/',
        courses: [
          { label: 'Лего-развивайка', href: 'https://robotlida.by/courses_2_4/' },
          { label: 'Лего с логопедом', href: 'https://robotlida.by/courses_4_6/' },
          { label: 'Лего-математика', href: 'https://robotlida.by/courses_4_6/' },
        ],
      },
      {
        label: 'От 5 лет',
        href: 'https://robotlida.by/courses_4_6/',
        courses: [
          { label: 'Лего с логопедом', href: 'https://robotlida.by/courses_4_6/' },
          { label: 'Лего-математика', href: 'https://robotlida.by/courses_4_6/' },
        ],
      },
    ],
  },
  {
    label: 'Начальная школа',
    ageGroups: [
      {
        label: 'От 6 лет',
        href: 'https://robotlida.by/courses_6_7/',
        courses: [
          { label: 'Лего с логопедом', href: 'https://robotlida.by/courses_4_6/' },
          { label: 'Лего-математика', href: 'https://robotlida.by/courses_4_6/' },
          { label: 'Программирование Minecraft', href: 'https://robotlida.by/courses_6_7/' },
          { label: 'Юные инженеры', href: 'https://robotlida.by/courses_6_7/' },
          { label: 'Программирование Scratch', href: 'https://robotlida.by/courses_6_7/' },
          { label: 'Электроника и схемотехника', href: 'https://robotlida.by/courses_6_7/' },
          { label: 'Шахматный интеллектуальный клуб', href: 'https://robotlida.by/courses_6_7/' },
          { label: '3D моделирование в TinkerCad', href: 'https://robotlida.by/courses_6_7/' },
          { label: 'Компьютерная грамотность', href: 'https://robotlida.by/courses_6_7/' },
        ],
      },
      {
        label: 'От 7 лет',
        href: 'https://robotlida.by/courses_6_7/',
        courses: [
          { label: 'Программирование Minecraft', href: 'https://robotlida.by/courses_6_7/' },
          { label: 'Юные инженеры', href: 'https://robotlida.by/courses_6_7/' },
          { label: 'Программирование Scratch', href: 'https://robotlida.by/courses_6_7/' },
          { label: 'Электроника и схемотехника', href: 'https://robotlida.by/courses_6_7/' },
          { label: 'Шахматный интеллектуальный клуб', href: 'https://robotlida.by/courses_6_7/' },
          { label: '3D моделирование в TinkerCad', href: 'https://robotlida.by/courses_6_7/' },
          { label: 'Компьютерная грамотность', href: 'https://robotlida.by/courses_6_7/' },
        ],
      },
      { label: 'От 8 лет', href: '/courses/age/8' },
      { label: 'От 9 лет', href: '/courses/age/9' },
      { label: 'От 10 лет', href: '/courses/age/10' },
    ],
  },
  {
    label: 'Средняя школа',
    ageGroups: [
      { label: 'От 11 лет', href: '/courses/age/11' },
      { label: 'От 12 лет', href: '/courses/age/12' },
      { label: 'От 13 лет', href: '/courses/age/13' },
      { label: 'От 14 лет', href: '/courses/age/14' },
    ],
  },
  {
    label: 'Старшая школа',
    ageGroups: [
      { label: 'От 15 лет', href: '/courses/age/15' },
      { label: 'От 16 лет', href: '/courses/age/16' },
      { label: 'От 17 лет', href: '/courses/age/17' },
    ],
  },
];

const menuItems: MenuItem[] = [
  { label: 'Главная', href: '/' },
  {
    label: 'О нас',
    href: '/about',
    hasDropdown: true,
    dropdownItems: [
      { label: 'О центре', href: '/about' },
      { label: 'Наша команда', href: '/about/team' },
      { label: 'История', href: '/about/history' },
      { label: 'Достижения', href: '/about/achievements' },
    ],
  },
  { label: 'Занятия', href: '/courses', hasDropdown: true, dropdownType: 'courses' },
  { label: 'Летний клуб', href: '/summer-club' },
  { label: 'Мини-сад', href: '/mini-kindergarten' },
  { label: 'Расписание', href: '/schedule' },
  { label: 'Тренажёры', href: '/trainers' },
  {
    label: 'Галерея',
    href: '/gallery',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Фото', href: '/gallery/photos' },
      { label: 'Видео', href: '/gallery/videos' },
      { label: 'Мероприятия', href: '/gallery/events' },
    ],
  },
  {
    label: 'Статьи',
    href: '/articles',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Все статьи', href: '/articles' },
      { label: 'Развитие детей', href: '/articles/development' },
      { label: 'Советы родителям', href: '/articles/parents' },
      { label: 'Образование', href: '/articles/education' },
    ],
  },
  {
    label: 'Цены',
    href: '/pricing',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Тарифы', href: '/pricing' },
      { label: 'Абонементы', href: '/pricing/subscriptions' },
      { label: 'Скидки', href: '/pricing/discounts' },
    ],
  },
  { label: 'Контакты', href: '/contacts' },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [isStuck, setIsStuck] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredAgeGroup, setHoveredAgeGroup] = useState<string | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const categoryCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ageGroupCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      if (categoryCloseTimeoutRef.current) {
        clearTimeout(categoryCloseTimeoutRef.current);
      }
      if (ageGroupCloseTimeoutRef.current) {
        clearTimeout(ageGroupCloseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.navRoot} style={isStuck ? { height: navHeight } : undefined}>
      <nav ref={navRef} className={`${styles.navbar} ${isStuck ? styles.sticky : ''}`}>
        <div className={styles.container}>
          <ul className={styles.menu}>
            {menuItems.map((item, index) => (
              <li
                key={item.label}
                className={styles.menuItem}
                onMouseEnter={() => {
                  if (item.hasDropdown) {
                    if (closeTimeoutRef.current) {
                      clearTimeout(closeTimeoutRef.current);
                      closeTimeoutRef.current = null;
                    }
                    setHoveredItem(item.label);
                  }
                }}
                onMouseLeave={() => {
                  if (item.hasDropdown) {
                    closeTimeoutRef.current = setTimeout(() => {
                      setHoveredItem(null);
                      setHoveredCategory(null);
                      setHoveredAgeGroup(null);
                    }, 300);
                  }
                }}
              >
                <Link href={item.href} className={styles.menuLink}>
                  <span>{item.label}</span>
                  {item.hasDropdown && <span className={styles.menuCaret} aria-hidden="true" />}
                </Link>
                {item.hasDropdown && hoveredItem === item.label && (
                  <>
                    {item.dropdownType === 'courses' ? (
                      <div
                        className={styles.coursesDropdown}
                        onMouseEnter={() => {
                          if (closeTimeoutRef.current) {
                            clearTimeout(closeTimeoutRef.current);
                            closeTimeoutRef.current = null;
                          }
                        }}
                        onMouseLeave={() => {
                          closeTimeoutRef.current = setTimeout(() => {
                            setHoveredItem(null);
                            setHoveredCategory(null);
                            setHoveredAgeGroup(null);
                          }, 300);
                        }}
                      >
                        <div className={styles.categoriesList}>
                          {courseCategories.map((category) => (
                            <div
                              key={category.label}
                              className={styles.categoryItem}
                              onMouseEnter={() => {
                                if (categoryCloseTimeoutRef.current) {
                                  clearTimeout(categoryCloseTimeoutRef.current);
                                  categoryCloseTimeoutRef.current = null;
                                }
                                setHoveredCategory(category.label);
                              }}
                              onMouseLeave={() => {
                                categoryCloseTimeoutRef.current = setTimeout(() => {
                                  setHoveredCategory(null);
                                  setHoveredAgeGroup(null);
                                }, 250);
                              }}
                            >
                              <span className={styles.categoryLabel}>{category.label}</span>
                              {hoveredCategory === category.label && (
                                <div
                                  className={styles.ageGroupsList}
                                  onMouseEnter={() => {
                                    if (categoryCloseTimeoutRef.current) {
                                      clearTimeout(categoryCloseTimeoutRef.current);
                                      categoryCloseTimeoutRef.current = null;
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    categoryCloseTimeoutRef.current = setTimeout(() => {
                                      setHoveredCategory(null);
                                      setHoveredAgeGroup(null);
                                    }, 250);
                                  }}
                                >
                                  {category.ageGroups.map((ageGroup) => (
                                    <div
                                      key={ageGroup.label}
                                      className={styles.ageGroupItem}
                                      onMouseEnter={() => {
                                        if (ageGroup.courses && ageGroup.courses && ageGroup.courses.length > 0) {
                                          if (ageGroupCloseTimeoutRef.current) {
                                            clearTimeout(ageGroupCloseTimeoutRef.current);
                                            ageGroupCloseTimeoutRef.current = null;
                                          }
                                          setHoveredAgeGroup(`${category.label}-${ageGroup.label}`);
                                        }
                                      }}
                                      onMouseLeave={() => {
                                        if (ageGroup.courses && ageGroup.courses.length > 0) {
                                          ageGroupCloseTimeoutRef.current = setTimeout(() => {
                                            setHoveredAgeGroup(null);
                                          }, 250);
                                        }
                                      }}
                                    >
                                      <a
                                        href={ageGroup.href}
                                        className={styles.ageGroupLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {ageGroup.label}
                                      </a>
                                      {ageGroup.courses && ageGroup.courses.length > 0 && hoveredAgeGroup === `${category.label}-${ageGroup.label}` && (
                                        <div
                                          className={styles.coursesSubmenu}
                                          onMouseEnter={() => {
                                            if (ageGroupCloseTimeoutRef.current) {
                                              clearTimeout(ageGroupCloseTimeoutRef.current);
                                              ageGroupCloseTimeoutRef.current = null;
                                            }
                                          }}
                                      onMouseLeave={() => {
                                        ageGroupCloseTimeoutRef.current = setTimeout(() => {
                                          setHoveredAgeGroup(null);
                                        }, 250);
                                      }}
                                        >
                                          {ageGroup.courses.map((course, idx) => (
                                            <a
                                              key={idx}
                                              href={course.href}
                                              className={styles.courseLink}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              {course.label}
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      item.dropdownItems && (
                        <div
                          className={styles.defaultDropdown}
                          onMouseEnter={() => {
                            if (closeTimeoutRef.current) {
                              clearTimeout(closeTimeoutRef.current);
                              closeTimeoutRef.current = null;
                            }
                          }}
                          onMouseLeave={() => {
                            closeTimeoutRef.current = setTimeout(() => {
                              setHoveredItem(null);
                            }, 300);
                          }}
                        >
                          <div className={styles.dropdownList}>
                            {item.dropdownItems.map((dropdownItem) => (
                              <Link
                                key={dropdownItem.href}
                                href={dropdownItem.href}
                                className={styles.dropdownLink}
                              >
                                {dropdownItem.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </>
                )}
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

