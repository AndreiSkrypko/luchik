'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

type Stage = 'settings' | 'countdown' | 'play' | 'answer' | 'result';

type BrothersSettings = {
  brother: number; // 1, 2, 3, или 4
  digitRange: string; // '1..10', '10..100', '100..1000', '1000..10000'
  count: number;
  speed: number;
};

type BrothersQuestion = {
  displayNumber: string; // '+11', '-21', etc.
  originalNumber: number;
  correctAnswer: number; // Результат после применения метода брата
  steps: number[];
  usedBrotherMethod: boolean;
};

type BrothersSession = {
  settings: BrothersSettings;
  questions: BrothersQuestion[];
  totalSum: number;
};

const RANGE_OPTIONS = [
  { key: '1..10', label: 'от 1 до 10' },
  { key: '10..100', label: 'от 10 до 100' },
  { key: '100..1000', label: 'от 100 до 1000' },
  { key: '1000..10000', label: 'от 1000 до 10000' },
];

const BROTHER_OPTIONS = [
  { value: 1, label: 'Брат 1' },
  { value: 2, label: 'Брат 2' },
  { value: 3, label: 'Брат 3' },
  { value: 4, label: 'Брат 4' },
];

const formatNumber = (value: number) => (value > 0 ? `+${value}` : value.toString());

// Функция для применения метода брата к числу
function applyBrotherMethod(number: number, brother: number): {
  result: number;
  steps: number[];
  usedBrotherMethod: boolean;
} {
  const absNumber = Math.abs(number);
  const lastDigit = absNumber % 10;
  const sign = number >= 0 ? 1 : -1;

  // Проверяем, заканчивается ли число на выбранного брата
  if (lastDigit === brother) {
    // Применяем метод брата только к последней цифре
    const basePart = Math.floor(absNumber / 10) * 10 * sign;

    // Разложение последней цифры через 5
    // +1 = +5-4, +2 = +5-3, +3 = +5-2, +4 = +5-1
    // -1 = -5+4, -2 = -5+3, -3 = -5+2, -4 = -5+1
    const step1 = sign * 5;
    const step2 = -sign * (5 - brother);

    // Результат: базовая часть + разложение последней цифры
    const result = basePart + step1 + step2;

    return {
      result: result,
      steps: basePart !== 0 ? [basePart, step1, step2] : [step1, step2],
      usedBrotherMethod: true,
    };
  } else {
    // Обычное число, не применяем метод брата
    return {
      result: number,
      steps: [number],
      usedBrotherMethod: false,
    };
  }
}

// Функция для генерации сессии
function generateSession(settings: BrothersSettings): BrothersSession {
  const tasks: BrothersQuestion[] = [];

  const ranges: Record<string, { min: number; max: number }> = {
    '1..10': { min: 1, max: 10 },
    '10..100': { min: 10, max: 100 },
    '100..1000': { min: 100, max: 1000 },
    '1000..10000': { min: 1000, max: 10000 },
  };

  const range = ranges[settings.digitRange];

  for (let i = 0; i < settings.count; i++) {
    // Генерируем число, которое заканчивается на выбранного брата
    let randomNumber: number;

    if (settings.digitRange === '1..10') {
      randomNumber = settings.brother;
    } else if (settings.digitRange === '10..100') {
      // Генерируем число от 10 до 100, заканчивающееся на брата
      const minTens = Math.ceil(range.min / 10);
      const maxTens = Math.floor(range.max / 10);
      const tens = Math.floor(Math.random() * (maxTens - minTens + 1)) + minTens;
      randomNumber = tens * 10 + settings.brother;
      // Корректируем, если вышли за границы
      if (randomNumber < range.min) {
        randomNumber = Math.ceil(range.min / 10) * 10 + settings.brother;
        if (randomNumber < range.min) randomNumber += 10;
      }
      if (randomNumber > range.max) {
        randomNumber = Math.floor(range.max / 10) * 10 + settings.brother;
        if (randomNumber > range.max) randomNumber -= 10;
      }
    } else if (settings.digitRange === '100..1000') {
      // Генерируем число от 100 до 1000, заканчивающееся на брата
      const minHundreds = Math.ceil(range.min / 100);
      const maxHundreds = Math.floor(range.max / 100);
      const hundreds = Math.floor(Math.random() * (maxHundreds - minHundreds + 1)) + minHundreds;
      const tens = Math.floor(Math.random() * 10); // 0-9
      randomNumber = hundreds * 100 + tens * 10 + settings.brother;
      // Корректируем, если вышли за границы
      if (randomNumber < range.min) {
        randomNumber = Math.ceil(range.min / 10) * 10 + settings.brother;
        if (randomNumber < range.min) randomNumber += 10;
      }
      if (randomNumber > range.max) {
        randomNumber = Math.floor(range.max / 10) * 10 + settings.brother;
        if (randomNumber > range.max) randomNumber -= 10;
      }
    } else if (settings.digitRange === '1000..10000') {
      // Генерируем число от 1000 до 10000, заканчивающееся на брата
      const minThousands = Math.ceil(range.min / 1000);
      const maxThousands = Math.floor(range.max / 1000);
      const thousands = Math.floor(Math.random() * (maxThousands - minThousands + 1)) + minThousands;
      const hundreds = Math.floor(Math.random() * 10); // 0-9
      const tens = Math.floor(Math.random() * 10); // 0-9
      randomNumber = thousands * 1000 + hundreds * 100 + tens * 10 + settings.brother;
      // Корректируем, если вышли за границы
      if (randomNumber < range.min) {
        randomNumber = Math.ceil(range.min / 10) * 10 + settings.brother;
        if (randomNumber < range.min) randomNumber += 10;
      }
      if (randomNumber > range.max) {
        randomNumber = Math.floor(range.max / 10) * 10 + settings.brother;
        if (randomNumber > range.max) randomNumber -= 10;
      }
    } else {
      randomNumber = settings.brother;
    }

    // Случайно выбираем знак
    const op = Math.random() < 0.5 ? '+' : '-';
    const signedNumber = op === '+' ? randomNumber : -randomNumber;

    // Применяем метод брата
    const result = applyBrotherMethod(signedNumber, settings.brother);

    tasks.push({
      displayNumber: `${op}${randomNumber}`,
      originalNumber: signedNumber,
      correctAnswer: result.result,
      steps: result.steps,
      usedBrotherMethod: result.usedBrotherMethod,
    });
  }

  const totalSum = tasks.reduce((sum, question) => sum + question.correctAnswer, 0);

  return {
    settings,
    questions: tasks,
    totalSum,
  };
}

export default function BrothersTrainerPage() {
  const [stage, setStage] = useState<Stage>('settings');
  const [formState, setFormState] = useState<BrothersSettings>({
    brother: 1,
    digitRange: '1..10',
    count: 10,
    speed: 5,
  });
  const [session, setSession] = useState<BrothersSession | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [userIsCorrect, setUserIsCorrect] = useState<boolean | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = session?.questions[currentIndex];
  const totalQuestions = session?.questions.length ?? 0;

  const rangeDescription = useMemo(() => {
    const option = RANGE_OPTIONS.find((opt) => opt.key === formState.digitRange);
    return option?.label ?? RANGE_OPTIONS[0].label;
  }, [formState.digitRange]);

  const brotherDescription = useMemo(() => {
    const option = BROTHER_OPTIONS.find((opt) => opt.value === formState.brother);
    return option?.label ?? BROTHER_OPTIONS[0].label;
  }, [formState.brother]);

  const resetGame = useCallback(() => {
    setStage('settings');
    setSession(null);
    setCurrentIndex(0);
    setUserAnswer('');
    setUserIsCorrect(null);
    setShowBreakdown(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const startSession = () => {
    const newSession = generateSession(formState);
    setSession(newSession);
    setCountdown(3);
    setStage('countdown');
  };

  const checkAnswer = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) return;

    const numericAnswer = parseInt(userAnswer, 10);
    if (Number.isNaN(numericAnswer)) {
      return;
    }

    setUserIsCorrect(numericAnswer === session.totalSum);
    setStage('result');
  };

  useEffect(() => {
    if (stage !== 'countdown') return undefined;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setStage('play');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'play' || !session) return undefined;

    setCurrentIndex(0);

    const scheduleNext = (index: number) => {
      timerRef.current = setTimeout(() => {
        const nextIndex = index + 1;
        if (!session || nextIndex >= session.questions.length) {
          setStage('answer');
          return;
        }
        setCurrentIndex(nextIndex);
        scheduleNext(nextIndex);
      }, session.settings.speed * 1000);
    };

    scheduleNext(0);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [session, stage]);

  const progressPercent = totalQuestions ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  const isSettingsOnly = stage === 'settings';

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.topBar}>
          <Link href="/trainers/mental-arithmetic" className={styles.backLink}>
            ← Назад к тренажерам
          </Link>
          <span className={styles.programBadge}>Программа «Ментальная арифметика»</span>
        </div>

        <header className={styles.sectionHeader}>
          <h1>Тренажер «Братья»</h1>
          <p className={styles.sectionLead}>
            Изучайте метод разложения чисел через «братьев» — простой способ упростить вычисления. Выберите брата для изучения, и все числа будут заканчиваться на эту цифру.
          </p>
        </header>

        <section className={`${styles.layout} ${isSettingsOnly ? styles.layoutSingle : ''}`}>
          <div className={`${styles.settingsColumn} ${isSettingsOnly ? styles.settingsColumnWide : ''}`}>
            <div className={styles.panel}>
              {stage === 'settings' ? (
                <form
                  className={styles.settingsForm}
                  onSubmit={(event) => {
                    event.preventDefault();
                    startSession();
                  }}
                >
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="brother">Выберите брата для изучения</label>
                      <div className={styles.radioGroup}>
                        {BROTHER_OPTIONS.map((option) => (
                          <label key={option.value} className={styles.radioLabel}>
                            <input
                              type="radio"
                              name="brother"
                              value={option.value}
                              checked={formState.brother === option.value}
                              onChange={(e) => setFormState((prev) => ({ ...prev, brother: parseInt(e.target.value, 10) }))}
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                      <p className={styles.helperText}>
                        Брат {formState.brother}: +{formState.brother} = +5-{5 - formState.brother}, -{formState.brother} = -5+{5 - formState.brother}
                      </p>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="range">
                        Диапазон чисел <span className={styles.settingValue}>{rangeDescription}</span>
                      </label>
                      <div className={styles.radioGroup}>
                        {RANGE_OPTIONS.map((option) => (
                          <label key={option.key} className={styles.radioLabel}>
                            <input
                              type="radio"
                              name="digitRange"
                              value={option.key}
                              checked={formState.digitRange === option.key}
                              onChange={(e) => setFormState((prev) => ({ ...prev, digitRange: e.target.value }))}
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="count">
                        Количество примеров <span className={styles.settingValue}>{formState.count}</span>
                      </label>
                      <input
                        id="count"
                        type="range"
                        min={2}
                        max={99}
                        value={formState.count}
                        className={styles.slider}
                        onChange={(e) => setFormState((prev) => ({ ...prev, count: parseInt(e.target.value, 10) }))}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="speed">
                        Время на пример (сек.) <span className={styles.settingValue}>{formState.speed} сек</span>
                      </label>
                      <input
                        id="speed"
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={formState.speed}
                        className={styles.slider}
                        onChange={(e) => setFormState((prev) => ({ ...prev, speed: parseInt(e.target.value, 10) }))}
                      />
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button type="submit" className={styles.startButton}>
                      🚀 Начать игру
                    </button>
                  </div>
                </form>
              ) : (
                <div className={styles.panelPlaceholder}>
                  <p>Чтобы изменить параметры, завершите текущую серию или сбросьте тренировку.</p>
                  <button className={styles.secondaryButton} onClick={resetGame}>
                    Сбросить и настроить заново
                  </button>
                </div>
              )}
            </div>
          </div>

          {!isSettingsOnly && (
            <div className={styles.stageColumn}>
              {stage === 'answer' && session && (
                <div className={styles.answerCard}>
                  <h3>Введите сумму всех результатов</h3>
                  <p>Вспомните все числа, которые вы видели, примените к каждому метод выбранного брата и введите общую сумму результатов.</p>
                  <form onSubmit={checkAnswer}>
                    <input
                      type="number"
                      className={styles.answerInput}
                      value={userAnswer}
                      onChange={(event) => setUserAnswer(event.target.value)}
                      placeholder="Например, 42"
                      required
                    />
                    <button type="submit" className={styles.startButton}>
                      Проверить ответ
                    </button>
                  </form>
                </div>
              )}

              {stage === 'result' && session && (
                <div className={styles.resultCard}>
                  <h3>{userIsCorrect ? 'Отлично!' : 'Есть над чем поработать'}</h3>
                  <p>
                    Правильный ответ: <strong>{session.totalSum}</strong>
                  </p>
                  <p>
                    Ваш ответ: <strong>{userAnswer}</strong>
                  </p>
                  <div className={styles.resultActions}>
                    <button className={styles.primaryButton} onClick={resetGame}>
                      Сыграть ещё раз
                    </button>
                    <button className={styles.secondaryButton} onClick={() => setShowBreakdown((prev) => !prev)}>
                      {showBreakdown ? 'Скрыть пример' : 'Показать пример вычислений'}
                    </button>
                  </div>

                  {showBreakdown && (
                    <div className={styles.breakdown}>
                      <h4>Последовательность</h4>
                      <div className={styles.expression}>
                        {session.questions.map((item, idx) => (
                          <span key={idx}>{item.displayNumber}</span>
                        ))}
                        <span className={styles.equals}>=</span>
                        <span className={styles.total}>{session.totalSum}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {stage === 'countdown' && (
          <div className={styles.fullscreenOverlay}>
            <div className={styles.countdownContent}>
              <div className={styles.countdownEmoji}>
                {countdown === 3 ? '🎯' : countdown === 2 ? '🚀' : '✨'}
              </div>
              <p className={styles.countdownText}>Игра начнётся через</p>
              <span className={`${styles.countdownNumber} ${styles.countdownPulse}`}>{countdown}</span>
              <p className={styles.countdownHint}>
                {countdown === 3 ? 'Приготовься!' : countdown === 2 ? 'Внимание!' : 'Начинаем!'}
              </p>
              <button className={styles.secondaryButton} onClick={resetGame}>
                Выйти
              </button>
            </div>
          </div>
        )}

        {stage === 'play' && session && currentQuestion && (
          <div className={`${styles.fullscreenOverlay} ${styles.numberOverlay}`}>
            <div className={styles.numberContent}>
              <div className={styles.progress}>
                <span>
                  Пример {currentIndex + 1} из {session.questions.length}
                </span>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <div className={`${styles.currentNumber} ${currentQuestion.originalNumber < 0 ? styles.negativeNumber : styles.positiveNumber}`}>
                {currentQuestion.displayNumber}
              </div>
              <button className={styles.secondaryButton} onClick={resetGame}>
                Выйти из игры
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

