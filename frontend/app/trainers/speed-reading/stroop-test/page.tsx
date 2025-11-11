'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type GameState = 'idle' | 'running' | 'completed';

interface StroopColor {
  name: string;
  hex: string;
}

interface Challenge {
  target: StroopColor;
  promptHex: string;
  options: StroopColor[];
}

const DEFAULT_COLORS: StroopColor[] = [
  { name: 'красный', hex: '#E74C3C' },
  { name: 'синий', hex: '#277BC0' },
  { name: 'зелёный', hex: '#27AE60' },
  { name: 'жёлтый', hex: '#F1C40F' },
  { name: 'фиолетовый', hex: '#8E44AD' },
  { name: 'оранжевый', hex: '#F39C12' },
];

const MIN_DURATION = 10;
const MAX_DURATION = 180;
const DEFAULT_DURATION = 60;

const formatStopwatch = (milliseconds: number): string => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} сек.`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')} мин.`;
};

const shuffleArray = <T,>(input: T[]): T[] => {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const resolveCategory = (mistakes: number): string => {
  if (mistakes === 0) {
    return 'Профессионал';
  }
  if (mistakes <= 2) {
    return 'Эксперт';
  }
  if (mistakes <= 5) {
    return 'Продвинутый';
  }
  if (mistakes <= 8) {
    return 'Уверенный пользователь';
  }
  return 'Новичок';
};

export default function StroopTestPage() {
  const [colors, setColors] = useState<StroopColor[]>(DEFAULT_COLORS);
  const [recommendedSeconds, setRecommendedSeconds] = useState<number | null>(null);
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [state, setState] = useState<GameState>('idle');
  const [activeDurationMs, setActiveDurationMs] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimestampRef = useRef<number | null>(null);

  const loadPalette = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await fetch(`${BASE_API_URL}/api/trainers/stroop-test/session`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить цвета. Используем базовый набор.');
      }
      const payload = await response.json();

      if (Array.isArray(payload.available_colors) && payload.available_colors.length > 0) {
        setColors(payload.available_colors);
      }
      if (typeof payload.recommended_seconds === 'number') {
        const clamped = Math.min(Math.max(payload.recommended_seconds, MIN_DURATION), MAX_DURATION);
        setRecommendedSeconds(clamped);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить данные. Попробуйте позже.');
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    loadPalette();
  }, [loadPalette]);

  const createChallenge = useCallback((): Challenge | null => {
    if (!colors.length) {
      return null;
    }

    const palette = shuffleArray(colors);
    const target = palette[0];
    const otherColors = colors.filter((color) => color.name !== target.name);
    const promptHex =
      otherColors.length > 0
        ? otherColors[Math.floor(Math.random() * otherColors.length)].hex
        : target.hex;

    const sampleSize = Math.min(6, colors.length);
    let options = palette.slice(0, sampleSize);

    if (!options.some((color) => color.name === target.name)) {
      options[sampleSize - 1] = target;
    }

    options = shuffleArray(options);

    return {
      target,
      promptHex,
      options,
    };
  }, [colors]);

  const formattedElapsed = useMemo(() => {
    const effectiveElapsed = state === 'completed' ? activeDurationMs : elapsedMs;
    return formatStopwatch(effectiveElapsed);
  }, [activeDurationMs, elapsedMs, state]);

  const mainTimerDisplay = useMemo(() => {
    if (state === 'running') {
      return `${Math.max(0, Math.ceil(remainingMs / 1000))} сек.`;
    }
    if (state === 'completed') {
      return '0 сек.';
    }
    return `${duration} сек.`;
  }, [duration, remainingMs, state]);

  const accuracyPercent = useMemo(() => {
    if (!attempts) {
      return null;
    }
    return Math.round((correctCount / attempts) * 100);
  }, [attempts, correctCount]);

  const performanceLabel = useMemo(() => {
    if (state !== 'completed') {
      return null;
    }
    return resolveCategory(mistakes);
  }, [mistakes, state]);

  useEffect(() => {
    if (state === 'running' || state === 'completed') {
      stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [state]);

  useEffect(() => {
    if (state !== 'running' || !activeDurationMs) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const tick = (timestamp: number) => {
      if (startTimestampRef.current == null) {
        startTimestampRef.current = timestamp;
      }
      const elapsed = timestamp - startTimestampRef.current;
      const remaining = Math.max(0, activeDurationMs - elapsed);

      setElapsedMs(elapsed);
      setRemainingMs(remaining);

      if (remaining <= 0) {
        setElapsedMs(activeDurationMs);
        setRemainingMs(0);
        setState('completed');
        return;
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [activeDurationMs, state]);

  useEffect(
    () => () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    },
    []
  );

  const handleStart = () => {
    if (state === 'running') {
      return;
    }

    const newChallenge = createChallenge();
    if (!newChallenge) {
      setError('Не удалось подготовить задачу. Попробуйте обновить страницу.');
      return;
    }

    const durationMs = duration * 1000;

    setChallenge(newChallenge);
    setAttempts(0);
    setCorrectCount(0);
    setMistakes(0);
    setElapsedMs(0);
    setRemainingMs(durationMs);
    setActiveDurationMs(durationMs);
    setError(null);
    setState('running');
    startTimestampRef.current = null;
  };

  const handleReset = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    startTimestampRef.current = null;
    setState('idle');
    setChallenge(null);
    setElapsedMs(0);
    setRemainingMs(0);
    setActiveDurationMs(0);
    setAttempts(0);
    setCorrectCount(0);
    setMistakes(0);
    setError(null);
  };

  const handleColorSelect = (colorName: string) => {
    if (state !== 'running' || !challenge) {
      return;
    }

    setAttempts((prev) => prev + 1);

    if (colorName === challenge.target.name) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setMistakes((prev) => prev + 1);
    }

    const nextChallenge = createChallenge();
    if (nextChallenge) {
      setChallenge(nextChallenge);
    }
  };

  const disabledControls = state === 'running';
  const showInfoPanel = state === 'running' || state === 'completed';
  const showSummary = state === 'completed';

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.topBar}>
          <Link href="/trainers/speed-reading" className={styles.backLink}>
            ← Назад к тренажерам
          </Link>
        </div>

        <section className={styles.sectionHeader}>
          <span className={styles.programBadge}>Программа «Скорочтение»</span>
          <h1>Тренажер «Тест Струпа»</h1>
          <p className={styles.sectionLead}>
            Установите длительность тренировки и за время теста нажимайте на квадрат нужного цвета. Ищите оттенок,
            совпадающий с названием, а цвет текста игнорируйте — так тренируется переключение внимания.
          </p>
        </section>

        <section className={styles.controls}>
          <div className={styles.settingsGroup}>
            <div className={styles.durationControl}>
              <label htmlFor="stroop-duration" className={styles.durationLabel}>
                Длительность тренировки
              </label>
              <input
                id="stroop-duration"
                type="range"
                min={MIN_DURATION}
                max={MAX_DURATION}
                step={5}
                value={duration}
                disabled={disabledControls}
                onChange={(event) => setDuration(Number(event.target.value))}
                className={styles.durationSlider}
              />
              <div className={styles.durationScale}>
                <span>10 сек.</span>
                <span>180 сек.</span>
              </div>
            </div>
            <span className={styles.durationValue}>{duration} сек.</span>
          </div>

          {recommendedSeconds && (
            <span className={styles.recommendation}>Рекомендуем попробовать {recommendedSeconds} сек.</span>
          )}

          <div className={styles.actions}>
            {state !== 'running' ? (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleStart}
                disabled={isFetching}
              >
                {state === 'completed' ? 'Повторить' : 'Начать'}
              </button>
            ) : (
              <button type="button" className={styles.secondaryButton} onClick={handleReset}>
                Сбросить
              </button>
            )}
          </div>
        </section>

        <section
          ref={stageRef}
          className={`${styles.stage} ${state !== 'idle' ? styles.stageActive : ''}`}
        >
          {challenge ? (
            <div className={styles.stageContent}>
              <div className={styles.interactiveArea}>
                <div className={styles.prompt}>
                  <span className={styles.timerDisplay}>{mainTimerDisplay}</span>
                  <span className={styles.promptWord} style={{ color: challenge.promptHex }}>
                    {challenge.target.name.toUpperCase()}
                  </span>
                </div>

                <div className={styles.boardGrid}>
                  {challenge.options.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      className={styles.colorTile}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => handleColorSelect(color.name)}
                      disabled={state !== 'running'}
                      aria-label={`Цвет ${color.name}`}
                    />
                  ))}
                </div>
              </div>

              {showInfoPanel && (
                <aside className={styles.infoPanel}>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Прошло</span>
                    <span className={styles.infoValue}>{formattedElapsed}</span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Попадания</span>
                    <span className={styles.infoValue}>{correctCount}</span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Ошибки</span>
                    <span className={styles.infoValue}>{mistakes}</span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Всего попыток</span>
                    <span className={styles.infoValue}>{attempts}</span>
                  </div>
                  {accuracyPercent != null && (
                    <div className={styles.infoInline}>
                      <span className={styles.infoLabel}>Точность</span>
                      <span className={styles.inlineValue}>{accuracyPercent}%</span>
                    </div>
                  )}
                  {performanceLabel && (
                    <div className={styles.performanceBox}>
                      <span className={styles.performanceLabel}>Категория</span>
                      <span className={styles.performanceValue}>{performanceLabel}</span>
                    </div>
                  )}
                </aside>
              )}
            </div>
          ) : (
            <div className={styles.placeholder}>
              <p>
                Установите продолжительность тренировки от 10 до 180 секунд и нажмите «Начать». На экране появится
                название цвета — найдите квадрат с соответствующим оттенком, даже если слово окрашено иначе.
              </p>
            </div>
          )}
        </section>

        {showSummary && (
          <section className={styles.summary}>
            <h2>Результаты тренировки</h2>
            <div className={styles.summaryRow}>
              <div>
                <span className={styles.summaryLabel}>Отработанное время</span>
                <span className={styles.summaryValue}>{formattedElapsed}</span>
              </div>
              <div>
                <span className={styles.summaryLabel}>Попадания</span>
                <span className={styles.summaryValue}>{correctCount}</span>
              </div>
              <div>
                <span className={styles.summaryLabel}>Ошибки</span>
                <span className={styles.summaryValue}>{mistakes}</span>
              </div>
              <div>
                <span className={styles.summaryLabel}>Всего попыток</span>
                <span className={styles.summaryValue}>{attempts}</span>
              </div>
              {accuracyPercent != null && (
                <div>
                  <span className={styles.summaryLabel}>Точность</span>
                  <span className={styles.summaryValue}>{accuracyPercent}%</span>
                </div>
              )}
              {performanceLabel && (
                <div>
                  <span className={styles.summaryLabel}>Категория</span>
                  <span className={styles.summaryValue}>{performanceLabel}</span>
                </div>
              )}
            </div>
            <p className={styles.summaryHint}>
              Чем меньше ошибок и выше точность — тем увереннее мозг переключается между оттенками. Попробуйте снова и
              сократите время реакции!
            </p>
          </section>
        )}

        {error && <div className={styles.error}>{error}</div>}
      </main>

      <Footer />
    </div>
  );
}


