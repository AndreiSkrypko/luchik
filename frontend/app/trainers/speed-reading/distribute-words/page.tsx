'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

type GameState = 'idle' | 'running' | 'completed';
type ThemeDifficulty = 'basic' | 'intermediate' | 'advanced';

interface Theme {
  id: string;
  title: string;
  leftLabel: string;
  rightLabel: string;
  leftIcon: string;
  rightIcon: string;
  description: string;
  leftWords: string[];
  rightWords: string[];
  difficulty: ThemeDifficulty;
}

interface FeedbackMessage {
  type: 'success' | 'error';
  message: string;
}

const THEMES: Theme[] = [
  {
    id: 'edible-inedible',
    title: 'Съедобное — несъедобное',
    leftLabel: 'Съедобное',
    rightLabel: 'Несъедобное',
    leftIcon: '🍽️',
    rightIcon: '🚫',
    description: 'Разложите продукты и предметы в верные колонки.',
    leftWords: ['яблоко', 'суп', 'хлеб', 'морковь', 'сыр', 'каша', 'клубника', 'компот', 'салат', 'омлет'],
    rightWords: ['пластилин', 'гвоздь', 'стекло', 'батарейка', 'песок', 'мыло', 'мел', 'пластик', 'пуговица', 'резинка'],
    difficulty: 'basic'
  },
  {
    id: 'winter-summer',
    title: 'Зима — лето',
    leftLabel: 'Зима',
    rightLabel: 'Лето',
    leftIcon: '❄️',
    rightIcon: '🌞',
    description: 'Ассоциируйте слова с холодным и тёплым временем года.',
    leftWords: ['санки', 'варежки', 'сугроб', 'ёлка', 'коньки', 'мороз', 'льдинка', 'снеговик', 'шарф', 'печенье с корицей'],
    rightWords: ['купальник', 'пляж', 'шляпа', 'велосипед', 'фонтан', 'каникулы', 'арбуз', 'крем от солнца', 'ягоды', 'палатка'],
    difficulty: 'basic'
  },
  {
    id: 'home-street',
    title: 'Дом — улица',
    leftLabel: 'Дома',
    rightLabel: 'На улице',
    leftIcon: '🏠',
    rightIcon: '🚦',
    description: 'Распределите предметы, которые встречаются дома или на улице.',
    leftWords: ['подушка', 'диван', 'ковёр', 'чайник', 'кровать', 'колонка', 'полка', 'штора', 'настольная лампа', 'телевизор'],
    rightWords: ['лавочка', 'фонарь', 'тротуар', 'скамейка', 'велодорожка', 'переход', 'детская площадка', 'урна', 'газон', 'парк'],
    difficulty: 'basic'
  },
  {
    id: 'bird-animal',
    title: 'Птица — животное',
    leftLabel: 'Птицы',
    rightLabel: 'Животные',
    leftIcon: '🕊️',
    rightIcon: '🦊',
    description: 'Пернатые и четвероногие — разделите представителей мира природы.',
    leftWords: ['ласточка', 'журавль', 'сова', 'воробей', 'чайка', 'голубь', 'аист', 'утка', 'скворец', 'попугай'],
    rightWords: ['тигр', 'лиса', 'собака', 'кошка', 'олень', 'ёж', 'белка', 'кенгуру', 'корова', 'медведь'],
    difficulty: 'intermediate'
  },
  {
    id: 'flower-tree',
    title: 'Цветок — дерево',
    leftLabel: 'Цветы',
    rightLabel: 'Деревья',
    leftIcon: '🌷',
    rightIcon: '🌳',
    description: 'Определите, где растения со стеблем, а где со стволом.',
    leftWords: ['роза', 'ромашка', 'тюльпан', 'лилия', 'василёк', 'пион', 'сирень', 'астра', 'георгин', 'нарцисс'],
    rightWords: ['дуб', 'берёза', 'сосна', 'ель', 'клён', 'липа', 'каштан', 'тополь', 'рябина', 'яблоня'],
    difficulty: 'intermediate'
  },
  {
    id: 'music-sport',
    title: 'Музыка — спорт',
    leftLabel: 'Музыка',
    rightLabel: 'Спорт',
    leftIcon: '🎵',
    rightIcon: '🏆',
    description: 'Отнесите слова к миру музыки или спорта.',
    leftWords: ['оркестр', 'нота', 'гитара', 'дирижёр', 'мелодия', 'пианино', 'концерт', 'скрипка', 'бас-гитара', 'метроном'],
    rightWords: ['турнир', 'матч', 'баскетбол', 'спортзал', 'команда', 'тренер', 'футбол', 'победа', 'старт', 'гимнастика'],
    difficulty: 'intermediate'
  },
  {
    id: 'solid-liquid',
    title: 'Твёрдое — жидкое',
    leftLabel: 'Твёрдое',
    rightLabel: 'Жидкое',
    leftIcon: '🧊',
    rightIcon: '💧',
    description: 'Разделите вещества по состоянию.',
    leftWords: ['камень', 'кирпич', 'стекло', 'мрамор', 'дерево', 'соль', 'сахар', 'мел', 'глина', 'бетон'],
    rightWords: ['вода', 'молоко', 'сок', 'бензин', 'масло', 'лимонад', 'чернила', 'кефир', 'сироп', 'суп'],
    difficulty: 'advanced'
  },
  {
    id: 'emotion-action',
    title: 'Эмоция — действие',
    leftLabel: 'Эмоции',
    rightLabel: 'Действия',
    leftIcon: '😊',
    rightIcon: '⚡',
    description: 'Определите, где чувства, а где активные действия.',
    leftWords: ['радость', 'грусть', 'злость', 'удивление', 'восхищение', 'усталость', 'интерес', 'спокойствие', 'тревога', 'вера'],
    rightWords: ['бежать', 'создавать', 'изучать', 'прыгать', 'помогать', 'направлять', 'убеждать', 'играть', 'обсуждать', 'мечтать'],
    difficulty: 'advanced'
  },
  {
    id: 'fact-opinion',
    title: 'Факт — мнение',
    leftLabel: 'Факты',
    rightLabel: 'Мнения',
    leftIcon: '📊',
    rightIcon: '💬',
    description: 'Разделите утверждения на проверяемые факты и субъективные мнения.',
    leftWords: ['вода кипит при 100°', 'Земля вращается', 'Москва столица', 'кошка — млекопитающее', 'снег белый', 'солнце — звезда', 'яблоко — фрукт', 'золото — металл', 'звук распространяется в воздухе', 'книги состоят из страниц'],
    rightWords: ['лучший фильм года', 'самая вкусная еда — пицца', 'зима красивее лета', 'утро лучше вечера', 'играть приятнее учиться', 'громкая музыка мешает', 'футбол интереснее баскетбола', 'осень — унылая пора', 'математика сложная', 'город лучше деревни'],
    difficulty: 'advanced'
  }
];

const THEME_GROUPS: Array<{ id: ThemeDifficulty; title: string }> = [
  { id: 'basic', title: 'Простые темы' },
  { id: 'intermediate', title: 'Посложнее' },
  { id: 'advanced', title: 'Сложные' }
];

const shuffle = <T,>(items: T[]): T[] => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const formatStopwatch = (ms: number): string => {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((safeMs % 1000) / 10);

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds
      .toString()
      .padStart(2, '0')} мин.`;
  }

  return `${seconds}.${centiseconds.toString().padStart(2, '0')} сек.`;
};

export default function DistributeWordsPage() {
  const [themeId, setThemeId] = useState<string>(THEMES[0].id);
  const [wordLimit, setWordLimit] = useState<number>(12);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [assignments, setAssignments] = useState<Record<string, 'left' | 'right'>>({});
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finalDuration, setFinalDuration] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [draggingWordId, setDraggingWordId] = useState<string | null>(null);
  const [shuffledWords, setShuffledWords] = useState<string[]>(() =>
    shuffle([...THEMES[0].leftWords, ...THEMES[0].rightWords]).slice(0, 12)
  );
  const stageRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimestampRef = useRef<number | null>(null);
  const gameStateRef = useRef<GameState>('idle');
 
  const theme = useMemo(() => THEMES.find((item) => item.id === themeId) ?? THEMES[0], [themeId]);

  const themeGroups = useMemo(
    () =>
      THEME_GROUPS.map((group) => ({
        ...group,
        items: THEMES.filter((item) => item.difficulty === group.id)
      })).filter((group) => group.items.length > 0),
    []
  );
 
  const activeLeftWords = useMemo(() => theme.leftWords, [theme]);
  const activeRightWords = useMemo(() => theme.rightWords, [theme]);
  const activeWords = useMemo(() => [...activeLeftWords, ...activeRightWords], [activeLeftWords, activeRightWords]);

  const maxSelectableWords = Math.min(20, activeWords.length);
  const minSelectableWords = maxSelectableWords === 0 ? 0 : Math.min(2, maxSelectableWords);
  const hasAvailableWords = maxSelectableWords > 0;

  useEffect(() => {
    if (!hasAvailableWords) {
      if (wordLimit !== 0) {
        setWordLimit(0);
      }
      return;
    }

    const clamped = Math.min(Math.max(wordLimit, minSelectableWords), maxSelectableWords);
    if (clamped !== wordLimit) {
      setWordLimit(clamped);
    }
  }, [hasAvailableWords, maxSelectableWords, minSelectableWords, wordLimit]);

  const effectiveWordLimit = hasAvailableWords
    ? Math.min(Math.max(wordLimit, minSelectableWords), maxSelectableWords)
    : 0;

  const effectiveTargetSeconds = useMemo(() => {
    if (!shuffledWords.length) {
      return 60;
    }
    return Math.max(30, Math.round((shuffledWords.length / activeWords.length) * 90));
  }, [activeWords.length, shuffledWords.length]);

  const assignedCount = useMemo(
    () =>
      shuffledWords.reduce((acc, word) => {
        return assignments[word] ? acc + 1 : acc;
      }, 0),
    [shuffledWords, assignments]
  );
  const correctCount = useMemo(
     () =>
       shuffledWords.reduce((acc, word) => {
         const source = activeLeftWords.includes(word) ? 'left' : 'right';
         return assignments[word] === source ? acc + 1 : acc;
       }, 0),
    [shuffledWords, assignments, activeLeftWords]
  );
  const incorrectPlaced = useMemo(
    () =>
      shuffledWords.filter((word) => {
        const source = activeLeftWords.includes(word) ? 'left' : activeRightWords.includes(word) ? 'right' : null;
        if (!source) {
          return false;
        }
        const assigned = assignments[word] || null;
        return assigned !== source;
      }),
    [shuffledWords, assignments, activeLeftWords, activeRightWords]
  );
  const remainingWords = useMemo(
    () => shuffledWords.filter((word) => !assignments[word]),
    [shuffledWords, assignments]
  );
  const wordPool = useMemo(
    () => shuffledWords.filter((word) => !assignments[word]),
    [shuffledWords, assignments]
  );
  const completionPercent = shuffledWords.length
    ? Math.round((assignedCount / shuffledWords.length) * 100)
    : 0;
  const remainingCount = Math.max(shuffledWords.length - assignedCount, 0);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'running') {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }
      startTimestampRef.current = null;
      setElapsedMs(0);
      return;
    }

    const tick = (timestamp: number) => {
      if (startTimestampRef.current == null) {
        startTimestampRef.current = timestamp;
      }
      setElapsedMs(timestamp - startTimestampRef.current);
      timerRef.current = requestAnimationFrame(tick);
    };

    timerRef.current = requestAnimationFrame(tick);

    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState]);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }
    const timeout = setTimeout(() => setFeedback(null), 2400);
    return () => clearTimeout(timeout);
  }, [feedback]);

  useEffect(() => {
    if (gameState === 'running') {
      stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }, [gameState]);

  useEffect(() => {
    if (gameStateRef.current === 'running') {
      return;
    }

    setGameState((current) => (current === 'running' ? current : 'idle'));
    setAssignments({});
    setSelectedWordId(null);
    setFeedback(null);
    setElapsedMs(0);
    setFinalDuration(0);
    setHoveredCategory(null);
    setDraggingWordId(null);
    startTimestampRef.current = null;

    const limit = hasAvailableWords ? effectiveWordLimit : 0;
    const nextWords = limit ? shuffle(activeWords).slice(0, limit) : [];
    setShuffledWords(nextWords);
  }, [activeWords, effectiveWordLimit, hasAvailableWords]);

  const formattedElapsed = gameState === 'completed' ? formatStopwatch(finalDuration) : formatStopwatch(elapsedMs);

  const evaluationActive = gameState === 'completed';
  const mistakesCount = evaluationActive ? incorrectPlaced.length : 0;
  const accuracyPercent = evaluationActive && shuffledWords.length
    ? Math.round(((shuffledWords.length - mistakesCount) / shuffledWords.length) * 100)
    : null;

  const performanceLabel = useMemo(() => {
    if (!evaluationActive) {
      return null;
    }
    const wrong = incorrectPlaced.length;
    const seconds = Math.round(finalDuration / 1000);

    if (wrong > 0) {
      return wrong <= Math.max(1, Math.floor(shuffledWords.length * 0.25))
        ? 'Внимательный исследователь'
        : 'Настойчивый практик';
    }

    if (seconds <= 60) {
      return 'Профессионал категорий';
    }
    if (seconds <= 90) {
      return 'Эксперт сортировки';
    }
    if (seconds <= 120) {
      return 'Уверенный сортировщик';
    }
    if (seconds <= 150) {
      return 'Уверенный сортировщик';
    }
    if (seconds <= 210) {
      return 'Настойчивый практик';
    }
    return 'Новичок классификации';
  }, [evaluationActive, finalDuration, incorrectPlaced.length, shuffledWords.length]);

  function finalizeGame() {
    if (gameState !== 'running') {
      return;
    }

    if (shuffledWords.length === 0 || assignedCount !== shuffledWords.length) {
      setFeedback({ type: 'error', message: 'Сначала распределите все слова по категориям.' });
      return;
    }

    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }

    const now = performance.now();
    const baseline = startTimestampRef.current != null ? now - startTimestampRef.current : elapsedMs;
    startTimestampRef.current = null;
    setElapsedMs(baseline);
    setFinalDuration(baseline);
    setGameState('completed');
    setSelectedWordId(null);

    const resultMistakes = incorrectPlaced.length;
    const durationMs = baseline;

    const durationSeconds = Math.round(durationMs / 1000);
    if (resultMistakes === 0) {
      const tone = durationSeconds <= 90 ? 'Блестящий результат! Все слова на месте.' : 'Готово! Все категории распределены верно.';
      setFeedback({ type: 'success', message: tone });
    } else {
      setFeedback({
        type: 'error',
        message: `Есть ${resultMistakes} ${resultMistakes === 1 ? 'слово' : resultMistakes < 5 ? 'слова' : 'слов'}, которое стоит пересмотреть.`
      });
    }
  }

  const handleStart = () => {
    if (gameState === 'running') {
      return;
    }

    if (effectiveWordLimit < 2) {
      setFeedback({
        type: 'error',
        message: 'Выберите настройки, чтобы в раунде было не меньше двух слов.'
      });
      return;
    }

    const nextWords = shuffle(activeWords).slice(0, effectiveWordLimit);

    setAssignments({});
    setSelectedWordId(null);
    setFeedback(null);
    setElapsedMs(0);
    setFinalDuration(0);
    setHoveredCategory(null);
    setDraggingWordId(null);
    startTimestampRef.current = null;
    setShuffledWords(nextWords);
    setGameState('running');
  };

  const handleReset = () => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    startTimestampRef.current = null;
    setAssignments({});
    setSelectedWordId(null);
    setFeedback(null);
    setElapsedMs(0);
    setFinalDuration(0);
    setHoveredCategory(null);
    setDraggingWordId(null);
    setGameState('idle');

    const nextWords = hasAvailableWords ? shuffle(activeWords).slice(0, effectiveWordLimit) : [];
    setShuffledWords(nextWords);
  };

  const handleWordAssign = (wordId: string, categoryId: 'left' | 'right') => {
    if (gameState !== 'running') {
      setFeedback({
        type: 'error',
        message: 'Нажмите «Начать тренировку», чтобы распределять слова.'
      });
      return;
    }
    setAssignments((prev) => ({ ...prev, [wordId]: categoryId }));
    setSelectedWordId(null);
  };

  const handleReturnToPool = (wordId: string) => {
    setAssignments((prev) => {
      if (!prev[wordId]) {
        return prev;
      }
      const next = { ...prev };
      delete next[wordId];
      return next;
    });
    setSelectedWordId(null);
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, wordId: string) => {
    if (gameState !== 'running') {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData('text/plain', wordId);
    event.dataTransfer.effectAllowed = 'move';
    setDraggingWordId(wordId);
  };

  const handleDragEnd = () => {
    setDraggingWordId(null);
    setHoveredCategory(null);
  };

  const handleDropToCategory = (event: React.DragEvent<HTMLDivElement>, categoryId: 'left' | 'right') => {
    event.preventDefault();
    const wordId = event.dataTransfer.getData('text/plain');
    setHoveredCategory(null);
    setDraggingWordId(null);
    if (!wordId) {
      return;
    }
    handleWordAssign(wordId, categoryId);
  };

  const handleDropToPool = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const wordId = event.dataTransfer.getData('text/plain');
    setDraggingWordId(null);
    if (!wordId) {
      return;
    }
    handleReturnToPool(wordId);
  };

  const handleWordClick = (wordId: string) => {
    if (gameState !== 'running') {
      return;
    }
    setSelectedWordId(wordId);
  };

  const handleWordKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, wordId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleWordClick(wordId);
    }
    if (event.key === 'Escape') {
      setSelectedWordId(null);
    }
  };

  const timeDeltaSeconds = Math.round(finalDuration / 1000 - effectiveTargetSeconds);

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.topBar}>
          <Link href="/trainers/speed-reading" className={styles.backLink}>
            ← Назад к тренажерам
          </Link>
          <span className={styles.targetBadge}>Цель: {effectiveTargetSeconds} сек.</span>
        </div>

        <section className={styles.sectionHeader}>
          <span className={styles.programBadge}>Программа «Скорочтение»</span>
          <h1>Тренажер «Распредели слова»</h1>
          <p className={styles.sectionLead}>
            Сортируйте слова по темам и прокачивайте скорость понимания текста. Чем быстрее и точнее распределите
            карточки, тем увереннее мозг переключается между контекстами.
          </p>
        </section>

        <section className={styles.controls}>
          <div className={styles.countRow}>
            <span className={styles.roundLabel}>Количество слов</span>
            <div className={styles.wordSliderRow}>
              <input
                type="range"
                min={minSelectableWords || 0}
                max={maxSelectableWords || 0}
                step={1}
                value={hasAvailableWords ? wordLimit : 0}
                disabled={!hasAvailableWords || gameState === 'running'}
                onChange={(event) => setWordLimit(Number(event.target.value))}
                className={styles.wordSlider}
              />
              <span className={styles.wordCountValue}>{hasAvailableWords ? `${effectiveWordLimit}` : '—'}</span>
            </div>
            <div className={styles.wordCountScale}>
              <span>{hasAvailableWords ? minSelectableWords : '—'}</span>
              <span>{hasAvailableWords ? maxSelectableWords : '—'}</span>
            </div>
          </div>

          <div className={styles.themeGrid}>
            {themeGroups.map((group) => (
              <div key={group.id} className={styles.themeColumn}>
                <h3 className={styles.themeColumnTitle}>{group.title}</h3>
                <div className={styles.roundTabOptions}>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`${styles.roundChip} ${item.id === themeId ? styles.roundChipActive : ''}`}
                      onClick={() => {
                        if (gameState === 'running') {
                          return;
                        }
                        setThemeId(item.id);
                      }}
                    >
                      <span className={styles.roundChipTitle}>{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.themeFooter}>
            <p className={styles.themeDescription}>{theme.description}</p>
            {gameState === 'running' ? (
              <div className={styles.inlineActions}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={finalizeGame}
                  disabled={shuffledWords.length === 0 || assignedCount !== shuffledWords.length}
                >
                  Проверить результат
                </button>
                <button type="button" className={styles.secondaryButton} onClick={handleReset}>
                  Сбросить
                </button>
              </div>
            ) : (
              <button type="button" className={styles.primaryButton} onClick={handleStart}>
                {gameState === 'completed' ? 'Играть ещё раз' : 'Начать тренировку'}
              </button>
            )}
          </div>
        </section>

        {feedback && (
          <div
            className={`${styles.feedback} ${
              feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError
            }`}
          >
            {feedback.message}
          </div>
        )}

        <section
          ref={stageRef}
          className={`${styles.stage} ${gameState !== 'idle' ? styles.stageActive : ''}`}
        >
          <div className={styles.stageContent}>
            <div
              className={styles.wordPanel}
              onDragOver={(event) => {
                if (gameState === 'running') {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                }
              }}
              onDrop={handleDropToPool}
            >
              <header className={styles.wordPanelHeader}>
                <h2>Нераспределённые слова</h2>
              </header>

              <div className={styles.wordBank}>
                {wordPool.length > 0 ? (
                  wordPool.map((word) => (
                    <div
                      key={word}
                      role="button"
                      tabIndex={0}
                      className={`${styles.wordCard} ${draggingWordId === word ? styles.wordCardDragging : ''} ${
                        selectedWordId === word ? styles.wordCardSelected : ''
                      }`}
                      draggable={gameState === 'running'}
                      onDragStart={(event) => handleDragStart(event, word)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleWordClick(word)}
                      onKeyDown={(event) => handleWordKeyDown(event, word)}
                    >
                      {word}
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    Все слова распределены! Проверьте карточки в колонках справа.
                  </div>
                )}
              </div>
              <p className={styles.poolHint}>Перетащите слово на колонку или нажмите, чтобы выбрать категорию.</p>
            </div>

            <div className={styles.categoriesGrid}>
              {['left', 'right'].map((side) => {
                const targetLabel = side === 'left' ? theme.leftLabel : theme.rightLabel;
                const targetIcon = side === 'left' ? theme.leftIcon : theme.rightIcon;
                const items = shuffledWords.filter((word) => assignments[word] === side);
                return (
                  <div
                    key={side}
                    className={`${styles.categoryColumn} ${
                      hoveredCategory === side ? styles.categoryColumnActive : ''
                    }`}
                    onDragOver={(event) => {
                      if (gameState === 'running') {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'move';
                        setHoveredCategory(side);
                      }
                    }}
                    onDragLeave={() => setHoveredCategory(null)}
                    onDrop={(event) => handleDropToCategory(event, side)}
                  >
                    <header className={styles.categoryHeader}>
                      <span className={styles.categoryBadge}>{targetIcon}</span>
                      <div>
                        <h3 className={styles.categoryTitle}>{targetLabel}</h3>
                      </div>
                      <span className={styles.categoryCount}>{items.length}</span>
                    </header>

                    <div className={styles.categoryWords}>
                      {items.length > 0 ? (
                        items.map((word) => {
                          const isCorrect = side === (activeLeftWords.includes(word) ? 'left' : 'right');
                          const isDragging = draggingWordId === word;
                          const statusClass = evaluationActive
                            ? isCorrect
                              ? styles.wordCardCorrect
                              : styles.wordCardIncorrect
                            : '';
                          return (
                            <div
                              key={word}
                              role="button"
                              tabIndex={0}
                              className={`${styles.wordCard} ${styles.wordCardAssigned} ${statusClass} ${
                                isDragging ? styles.wordCardDragging : ''
                              }`}
                              draggable={gameState === 'running'}
                              onDragStart={(event) => handleDragStart(event, word)}
                              onDragEnd={handleDragEnd}
                              onClick={() => handleWordClick(word)}
                              onKeyDown={(event) => handleWordKeyDown(event, word)}
                            >
                              <span>{word}</span>
                              {evaluationActive && !isCorrect && <span className={styles.wordCardTag}>?</span>}
                            </div>
                          );
                        })
                      ) : (
                        <div className={styles.categoryPlaceholder}>Перетащите сюда подходящие слова</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.stageActions}>
            <button type="button" className={styles.secondaryButton} onClick={handleReset}>
              Сбросить
            </button>
          </div>
        </section>

        <section className={styles.statistics}>
          <div className={styles.statBlock}>
            <span className={styles.statLabel}>Время</span>
            <span className={styles.statValue}>{formattedElapsed}</span>
          </div>
          <div className={styles.statBlock}>
            <span className={styles.statLabel}>Распределено</span>
            <span className={styles.statValue}>
              {assignedCount} / {shuffledWords.length}
            </span>
          </div>
          <div className={styles.statBlock}>
            <span className={styles.statLabel}>Готовность</span>
            <span className={styles.statValue}>{completionPercent}%</span>
          </div>
          {evaluationActive && (
            <div className={styles.statBlock}>
              <span className={styles.statLabel}>Ошибок</span>
              <span className={`${styles.statValue} ${mistakesCount === 0 ? styles.streakValue : ''}`}>
                {mistakesCount}
              </span>
            </div>
          )}
        </section>

        {evaluationActive && (
          <section className={`${styles.summary}`}>
            <div className={styles.summaryHeader}>
              <h2>Результаты раунда</h2>
              {performanceLabel ? <span className={styles.performanceBadge}>{performanceLabel}</span> : null}
            </div>

            <div className={styles.summaryMetrics}>
              <div className={styles.summaryMetric}>
                <span className={styles.summaryLabel}>Всего слов</span>
                <span className={styles.summaryValue}>{shuffledWords.length}</span>
              </div>
              <div className={styles.summaryMetric}>
                <span className={styles.summaryLabel}>Верно</span>
                <span className={styles.summaryValue}>{correctCount}</span>
              </div>
              <div className={styles.summaryMetric}>
                <span className={styles.summaryLabel}>Ошибки</span>
                <span className={styles.summaryValue}>{mistakesCount}</span>
              </div>
              <div className={styles.summaryMetric}>
                <span className={styles.summaryLabel}>Точность</span>
                <span className={styles.summaryValue}>
                  {accuracyPercent != null ? `${accuracyPercent}%` : '—'}
                </span>
              </div>
              <div className={styles.summaryMetric}>
                <span className={styles.summaryLabel}>Время</span>
                <span className={styles.summaryValue}>{formattedElapsed}</span>
              </div>
              <div className={styles.summaryMetric}>
                <span className={styles.summaryLabel}>Отклонение от цели</span>
                <span className={styles.summaryValue}>
                  {timeDeltaSeconds > 0 ? `+${timeDeltaSeconds} сек.` : `${timeDeltaSeconds} сек.`}
                </span>
              </div>
            </div>

            <div className={styles.summaryListWrapper}>
              {incorrectPlaced.length > 0 && (
                <div className={styles.summaryList}>
                  <h3>Нужно исправить</h3>
                  <ul>
                    {incorrectPlaced.map((word) => {
                      const correctSide = activeLeftWords.includes(word) ? theme.leftLabel : theme.rightLabel;
                      return (
                        <li key={`wrong-${word}`}>
                          <span>«{word}» — {correctSide}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {remainingWords.length > 0 && (
                <div className={styles.summaryList}>
                  <h3>Не распределены</h3>
                  <ul>
                    {remainingWords.map((word) => {
                      const correctSide = activeLeftWords.includes(word) ? theme.leftLabel : theme.rightLabel;
                      return (
                        <li key={`missing-${word}`}>
                          <span>«{word}» — {correctSide}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <p className={styles.performanceHint}>
              {timeDeltaSeconds > 0
                ? 'Попробуйте распределять слова быстрее, пока держите точность на том же уровне.'
                : 'Отличный темп! Увеличьте количество слов, чтобы усложнить тренировку.'}
            </p>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}