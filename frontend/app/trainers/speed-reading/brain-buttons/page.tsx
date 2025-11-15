'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

type GameState = 'idle' | 'running' | 'completed';

// Расширенный набор жестов для развития нейронных связей и координации
const GESTURES = [
  // Базовые жесты
  { id: 1, name: 'I love you', emoji: '🤟', label: 'I love you' },
  { id: 2, name: 'peace', emoji: '✌️', label: 'Мир' },
  { id: 3, name: 'fist', emoji: '✊', label: 'Кулак' },
  { id: 4, name: 'ok', emoji: '👌', label: 'OK' },
  { id: 5, name: 'point_down', emoji: '👇', label: 'Указать вниз' },
  { id: 6, name: 'call_me', emoji: '🤙', label: 'Позвони мне' },
  { id: 7, name: 'point_up', emoji: '👆', label: 'Указать вверх' },
  { id: 8, name: 'thumbs_up', emoji: '👍', label: 'Большой палец вверх' },
  { id: 9, name: 'point_right', emoji: '👉', label: 'Указать вправо' },
  { id: 10, name: 'rock_on', emoji: '🤘', label: 'Рок-н-ролл' },
  { id: 12, name: 'open_palm', emoji: '🖐️', label: 'Открытая ладонь' },
  { id: 13, name: 'fingers_crossed', emoji: '🤞', label: 'Скрещенные пальцы' },
  { id: 14, name: 'point_left', emoji: '👈', label: 'Указать влево' },
  { id: 15, name: 'thumbs_down', emoji: '👎', label: 'Большой палец вниз' },
  
  // Жесты с указательными пальцами
  { id: 16, name: 'index_up', emoji: '☝️', label: 'Один палец вверх' },
  { id: 17, name: 'index_down', emoji: '👇', label: 'Один палец вниз' },
  { id: 18, name: 'index_point', emoji: '👉', label: 'Указательный палец' },
  
  // Жесты с несколькими пальцами
  { id: 19, name: 'two_fingers', emoji: '✌️', label: 'Два пальца' },
  { id: 20, name: 'three_fingers', emoji: '🤟', label: 'Три пальца' },
  { id: 21, name: 'four_fingers', emoji: '🖖', label: 'Четыре пальца' },
  { id: 22, name: 'five_fingers', emoji: '🖐️', label: 'Пять пальцев' },
  
  // Сложные жесты для координации
  { id: 23, name: 'victory', emoji: '✌️', label: 'Победа' },
  { id: 24, name: 'pinch', emoji: '🤏', label: 'Щепотка' },
  { id: 25, name: 'writing', emoji: '✍️', label: 'Письмо' },
  { id: 26, name: 'wave', emoji: '👋', label: 'Махать' },
  { id: 27, name: 'muscle', emoji: '💪', label: 'Мышца' },
  
  // Жесты для развития мелкой моторики
  { id: 31, name: 'ok_circle', emoji: '👌', label: 'Круг OK' },
  { id: 32, name: 'peace_inverted', emoji: '✌️', label: 'Мир (обратно)' },
  { id: 33, name: 'thumbs_side', emoji: '👍', label: 'Палец в сторону' },
  { id: 34, name: 'finger_gun', emoji: '👉', label: 'Пистолет' },
  { id: 35, name: 'shaka', emoji: '🤙', label: 'Шака' },
  
  // Жесты для координации обеих рук (символические названия для одной руки)
  { id: 36, name: 'peace_right', emoji: '✌️', label: 'Мир' },
  { id: 37, name: 'thumbs_right', emoji: '👍', label: 'Большой палец' },
  { id: 38, name: 'ok_right', emoji: '👌', label: 'OK' },
  { id: 39, name: 'fist_right', emoji: '✊', label: 'Кулак' },
  { id: 40, name: 'rock_right', emoji: '🤘', label: 'Рок' },
  
  // Жесты для развития нейронных связей
  { id: 41, name: 'spider', emoji: '🤟', label: 'Паук' },
  { id: 42, name: 'crab', emoji: '🤏', label: 'Краб' },
  { id: 43, name: 'bird', emoji: '✌️', label: 'Птица' },
  { id: 44, name: 'fox', emoji: '🤘', label: 'Лиса' },
  { id: 45, name: 'snail', emoji: '👌', label: 'Улитка' },
  { id: 46, name: 'rabbit', emoji: '✌️', label: 'Кролик' },
  { id: 47, name: 'turtle', emoji: '✊', label: 'Черепаха' },
  
  // Дополнительные жесты одной рукой
  { id: 48, name: 'flex', emoji: '💪', label: 'Напрячь' },
  { id: 49, name: 'point_forward', emoji: '👉', label: 'Указать вперед' },
  { id: 50, name: 'come_here', emoji: '👆', label: 'Иди сюда' },
  { id: 51, name: 'stop_hand', emoji: '🖐️', label: 'Стоп ладонь' },
  { id: 52, name: 'palm_up', emoji: '🖐️', label: 'Ладонь вверх' },
  { id: 53, name: 'vulcan', emoji: '🖖', label: 'Вулкан' },
  { id: 54, name: 'point_up_right', emoji: '☝️', label: 'Указать вверх' },
  { id: 55, name: 'raised_hand', emoji: '✋', label: 'Поднятая рука' },
];

const MIN_GESTURES = 5;
const MAX_GESTURES = 50;
const DEFAULT_GESTURES = 15;

const MIN_SPEED = 0.5;
const MAX_SPEED = 5;
const DEFAULT_SPEED = 2;

export default function BrainButtonsPage() {
  const [gestureCount, setGestureCount] = useState(DEFAULT_GESTURES);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [mirrorGestures, setMirrorGestures] = useState(true);
  const [showWords, setShowWords] = useState(true);
  const [state, setState] = useState<GameState>('idle');
  const [currentGestureIndex, setCurrentGestureIndex] = useState(0);
  const [sequence, setSequence] = useState<Array<{ left: typeof GESTURES[number]; right: typeof GESTURES[number] }>>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startTimestampRef = useRef<number | null>(null);
  const gameAreaRef = useRef<HTMLElement | null>(null);

  // Скорость в миллисекундах
  const speedMs = useMemo(() => {
    // Преобразуем скорость (секунды) в миллисекунды
    return speed * 1000;
  }, [speed]);

  // Генерация последовательности жестов
  const generateSequence = useCallback(() => {
    const shuffled = [...GESTURES].sort(() => Math.random() - 0.5);
    const gestures = shuffled.slice(0, Math.min(gestureCount, GESTURES.length));
    
    if (mirrorGestures) {
      // Зеркальные жесты: один жест для обеих рук
      return gestures.map(gesture => ({
        left: gesture,
        right: gesture,
      }));
    } else {
      // Разные жесты: разные жесты для левой и правой руки
      const shuffled2 = [...GESTURES].sort(() => Math.random() - 0.5);
      return gestures.map((gesture, index) => {
        // Берем другой жест, убеждаясь что он отличается
        let rightGesture = shuffled2.find(g => g.id !== gesture.id) || gesture;
        if (index < shuffled2.length && shuffled2[index].id !== gesture.id) {
          rightGesture = shuffled2[index];
        }
        return {
          left: gesture,
          right: rightGesture,
        };
      });
    }
  }, [gestureCount, mirrorGestures]);

  const handleStart = useCallback(() => {
    const newSequence = generateSequence();
    setSequence(newSequence);
    setCurrentGestureIndex(0);
    setElapsedMs(0);
    setCorrectCount(0);
    setMistakes(0);
    setState('running');
    startTimestampRef.current = performance.now();
  }, [generateSequence]);

  const handleReset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setState('idle');
    setCurrentGestureIndex(0);
    setSequence([]);
    setElapsedMs(0);
    setCorrectCount(0);
    setMistakes(0);
    startTimestampRef.current = null;
  }, []);

  // Автоматическая смена жестов во время игры
  useEffect(() => {
    if (state !== 'running' || !sequence.length) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (currentGestureIndex >= sequence.length) {
      setState('completed');
      if (startTimestampRef.current) {
        setElapsedMs(performance.now() - startTimestampRef.current);
      }
      return;
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentGestureIndex((prev) => prev + 1);
    }, speedMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state, currentGestureIndex, sequence.length, speedMs]);

  // Прокрутка к области игры при начале игры
  useEffect(() => {
    if (state === 'running' || state === 'completed') {
      gameAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [state]);

  // Обновление времени
  useEffect(() => {
    if (state !== 'running' || !startTimestampRef.current) {
      return;
    }

    const interval = setInterval(() => {
      if (startTimestampRef.current) {
        setElapsedMs(performance.now() - startTimestampRef.current);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [state]);

  const currentGesturePair = useMemo(() => {
    if (!sequence.length || currentGestureIndex >= sequence.length) {
      return null;
    }
    return sequence[currentGestureIndex];
  }, [sequence, currentGestureIndex]);

  const formattedTime = useMemo(() => {
    const seconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds} сек.`;
  }, [elapsedMs]);

  const progress = useMemo(() => {
    if (!sequence.length) return 0;
    return Math.round(((currentGestureIndex + 1) / sequence.length) * 100);
  }, [currentGestureIndex, sequence.length]);

  const disabledControls = state === 'running';
  const showGameArea = state === 'running' || state === 'completed';

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
          <h1>Тренажер «Кнопки мозга»</h1>
          <p className={styles.sectionLead}>
            Тренажер представляет собой мелькающие изображения ладошек с различными жестами. Задача - моментально
            повторить каждый жест. Это упражнение не только улучшает способность следить за быстро изменяющимися
            событиями, но также способствует укреплению связи между умственными и физическими реакциями, развивая
            ловкость и реактивность.
          </p>
        </section>

        <section className={styles.controls}>
          <div className={styles.settingControl}>
            <label htmlFor="gesture-count" className={styles.settingLabel}>
              Количество жестов
            </label>
            <input
              id="gesture-count"
              type="range"
              min={MIN_GESTURES}
              max={MAX_GESTURES}
              step={1}
              value={gestureCount}
              disabled={disabledControls}
              onChange={(event) => setGestureCount(Number(event.target.value))}
              className={styles.settingSlider}
            />
            <span className={styles.settingValue}>Выбрано жестов: {gestureCount}</span>
          </div>

          <div className={styles.settingControl}>
            <label htmlFor="speed" className={styles.settingLabel}>
              Скорость
            </label>
              <input
                id="speed"
                type="range"
                min={MIN_SPEED}
                max={MAX_SPEED}
                step={0.1}
                value={speed}
                disabled={disabledControls}
                onChange={(event) => setSpeed(Number(event.target.value))}
                className={styles.settingSlider}
              />
              <span className={styles.settingValue}>Выбрана скорость: {speed.toFixed(1)} сек.</span>
          </div>

          <div className={styles.toggleControl}>
            <label htmlFor="mirror-gestures" className={styles.toggleLabel}>
              <span className={styles.toggleText}>Зеркальные жесты</span>
              <input
                id="mirror-gestures"
                type="checkbox"
                checked={mirrorGestures}
                disabled={disabledControls}
                onChange={(event) => setMirrorGestures(event.target.checked)}
                className={styles.toggleInput}
              />
              <span className={`${styles.toggleSwitch} ${mirrorGestures ? styles.toggleSwitchActive : ''}`} />
            </label>
          </div>

          <div className={styles.toggleControl}>
            <label htmlFor="show-words" className={styles.toggleLabel}>
              <span className={styles.toggleText}>Слова</span>
              <input
                id="show-words"
                type="checkbox"
                checked={showWords}
                disabled={disabledControls}
                onChange={(event) => setShowWords(event.target.checked)}
                className={styles.toggleInput}
              />
              <span className={`${styles.toggleSwitch} ${showWords ? styles.toggleSwitchActive : ''}`} />
            </label>
          </div>

          <div className={styles.actions}>
            {state !== 'running' ? (
              <button type="button" className={styles.primaryButton} onClick={handleStart}>
                Начать
              </button>
            ) : (
              <button type="button" className={styles.secondaryButton} onClick={handleReset}>
                Сбросить
              </button>
            )}
          </div>
        </section>

        {showGameArea && (
          <section ref={gameAreaRef} className={styles.gameArea}>
            {currentGesturePair ? (
              <div className={styles.gestureDisplay}>
                <div className={styles.timerDisplay}>{formattedTime}</div>
                <div className={styles.handsContainer}>
                  <div className={styles.handGesture}>
                    <div className={styles.gestureEmoji}>{currentGesturePair.left.emoji}</div>
                    {showWords && (
                      <div className={styles.gestureLabel}>{currentGesturePair.left.label}</div>
                    )}
                  </div>
                  <div className={styles.handGesture}>
                    <div className={`${styles.gestureEmoji} ${styles.gestureEmojiMirror}`}>{currentGesturePair.right.emoji}</div>
                    {showWords && (
                      <div className={styles.gestureLabel}>{currentGesturePair.right.label}</div>
                    )}
                  </div>
                </div>
                {!showWords && (
                  <div className={styles.centralWord}>
                    {mirrorGestures ? currentGesturePair.left.label : `${currentGesturePair.left.label} / ${currentGesturePair.right.label}`}
                  </div>
                )}
                <div className={styles.gameInfo}>
                  <span className={styles.gameInfoItem}>
                    Жест {currentGestureIndex + 1} из {sequence.length}
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : state === 'completed' ? (
              <div className={styles.completedDisplay}>
                <h2>Тренировка завершена!</h2>
                <div className={styles.statsGrid}>
                  <div className={styles.statBlock}>
                    <span className={styles.statLabel}>Время</span>
                    <span className={styles.statValue}>{formattedTime}</span>
                  </div>
                  <div className={styles.statBlock}>
                    <span className={styles.statLabel}>Жестов показано</span>
                    <span className={styles.statValue}>{sequence.length}</span>
                  </div>
                  <div className={styles.statBlock}>
                    <span className={styles.statLabel}>Правильно</span>
                    <span className={styles.statValue}>{correctCount}</span>
                  </div>
                  <div className={styles.statBlock}>
                    <span className={styles.statLabel}>Ошибок</span>
                    <span className={styles.statValue}>{mistakes}</span>
                  </div>
                </div>
                <button type="button" className={styles.primaryButton} onClick={handleReset}>
                  Начать заново
                </button>
              </div>
            ) : null}
          </section>
        )}

        {state === 'idle' && (
          <section className={styles.previewArea}>
            <p className={styles.previewText}>
              Настройте параметры и нажмите «Начать», чтобы начать тренировку. Повторяйте каждый жест как можно
              быстрее!
            </p>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

