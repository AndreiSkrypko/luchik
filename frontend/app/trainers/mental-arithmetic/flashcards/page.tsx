'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import baseStyles from '../prosto/page.module.css';
import extraStyles from './page.module.css';

const styles = { ...baseStyles, ...extraStyles };

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type Stage = 'settings' | 'countdown' | 'play' | 'answer' | 'result' | 'error';

type FlashcardColumn = {
  upper_active: boolean;
  lower_active_count: number;
};

type FlashcardCard = {
  index: number;
  value: number;
  columns: FlashcardColumn[];
};

type FlashcardSession = {
  settings: {
    difficulty: number;
    difficulty_label: string;
    quantity: number;
    max_digit: number;
  };
  cards: FlashcardCard[];
  numbers: number[];
  total: number;
  speed: number;
};

const DIFFICULTY_LABELS = ['1–10', '10–100', '100–1000', '1000–10000'];

export default function FlashcardsTrainerPage() {
  const [stage, setStage] = useState<Stage>('settings');
  const [formState, setFormState] = useState({
    difficulty: 1,
    speed: 1,
    quantity: 6,
    max_digit: 6,
  });
  const [session, setSession] = useState<FlashcardSession | null>(null);
  const [countdownValue, setCountdownValue] = useState(3);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showExample, setShowExample] = useState(false);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentCard = session?.cards[currentCardIndex];
  const totalCards = session?.cards.length ?? 0;
  const progressPercent = totalCards ? Math.round(((currentCardIndex + 1) / totalCards) * 100) : 0;
  const isSettingsOnly = stage === 'settings';

  const difficultyLabel = useMemo(
    () => DIFFICULTY_LABELS[formState.difficulty - 1] ?? DIFFICULTY_LABELS[0],
    [formState.difficulty],
  );

  const resetSession = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
    }
    setStage('settings');
    setSession(null);
    setCountdownValue(3);
    setCurrentCardIndex(0);
    setUserAnswer('');
    setIsAnswerCorrect(null);
    setErrorMessage(null);
    setShowExample(false);
  }, []);

  const handleInputChange = (field: keyof typeof formState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'speed' ? parseFloat(event.target.value) : parseInt(event.target.value, 10);
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const startSession = async () => {
    setErrorMessage(null);
    try {
      const response = await fetch(`${BASE_API_URL}/api/trainers/flash-cards/abacus/session/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error('Не удалось запустить тренажёр. Попробуйте ещё раз.');
      }

      const data: FlashcardSession = await response.json();
      setSession(data);
      setStage('countdown');
      setCountdownValue(3);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Произошла ошибка. Попробуйте позже.');
      setStage('error');
    }
  };

  const submitAnswer = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) {
      return;
    }
    const numericAnswer = parseInt(userAnswer, 10);
    if (Number.isNaN(numericAnswer)) {
      setErrorMessage('Введите корректное число.');
      return;
    }
    setIsAnswerCorrect(numericAnswer === session.total);
    setStage('result');
  };

  useEffect(() => {
    if (stage !== 'countdown') {
      return undefined;
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdownValue((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          setStage('play');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [stage]);

  useEffect(() => {
    if (stage !== 'play' || !session) {
      return undefined;
    }

    setCurrentCardIndex(0);

    const proceed = (index: number) => {
      playTimeoutRef.current = setTimeout(() => {
        const nextIndex = index + 1;
        if (!session || nextIndex >= session.cards.length) {
          setStage('answer');
          return;
        }
        setCurrentCardIndex(nextIndex);
        proceed(nextIndex);
      }, session.speed * 1000);
    };

    proceed(0);

    return () => {
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
    };
  }, [session, stage]);

  const renderAbacus = () => {
    if (!currentCard) {
      return null;
    }

    return (
      <div className={styles.abacusWrapper}>
        <div className={styles.abacus}>
          <div className={styles.abacusSeparator} />
          {currentCard.columns.map((column, index) => (
            <div key={`${currentCard.value}-${index}`} className={styles.abacusColumn}>
              <div className={`${styles.upperBead} ${column.upper_active ? styles.beadActive : ''}`} />
              <div className={styles.lowerBeads}>
                {Array.from({ length: 4 }).map((_, beadIndex) => (
                  <div
                    key={`${index}-${beadIndex}`}
                    className={`${styles.lowerBead} ${
                      beadIndex < column.lower_active_count ? styles.beadActive : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
          <h1>Тренажёр «Флэшкарты»</h1>
          <p className={styles.sectionLead}>
            Настройте уровень сложности, скорость и количество карточек. Смотрите на абакус, удерживайте числа в памяти и введите итоговую сумму.
          </p>
        </header>

        <section className={`${styles.layout} ${isSettingsOnly ? styles.layoutSingle : ''}`}>
          <div className={`${styles.settingsColumn} ${isSettingsOnly ? styles.settingsColumnWide : ''}`}>
            <div className={styles.panel}>
              {stage === 'error' && errorMessage && (
                <div className={styles.errorBanner}>
                  <p>{errorMessage}</p>
                  <button type="button" className={styles.secondaryButton} onClick={resetSession}>
                    Попробовать ещё раз
                  </button>
                </div>
              )}

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
                      <label htmlFor="difficulty">
                        Сложность <span className={styles.settingValue}>{difficultyLabel}</span>
                      </label>
                      <input
                        id="difficulty"
                        type="range"
                        min={1}
                        max={4}
                        value={formState.difficulty}
                        className={styles.slider}
                        onChange={handleInputChange('difficulty')}
                      />
                      <div className={styles.sliderLabels}>
                        {DIFFICULTY_LABELS.map((label) => (
                          <span key={label}>{label}</span>
                        ))}
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="speed">
                        Скорость показа <span className={styles.settingValue}>{formState.speed.toFixed(1)} сек</span>
                      </label>
                      <input
                        id="speed"
                        type="range"
                        min={0.1}
                        max={10}
                        step={0.1}
                        value={formState.speed}
                        className={styles.slider}
                        onChange={handleInputChange('speed')}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="quantity">
                        Кол-во карточек <span className={styles.settingValue}>{formState.quantity}</span>
                      </label>
                      <input
                        id="quantity"
                        type="range"
                        min={2}
                        max={30}
                        value={formState.quantity}
                        className={styles.slider}
                        onChange={handleInputChange('quantity')}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="maxDigit">
                        Максимальная цифра <span className={styles.settingValue}>{formState.max_digit}</span>
                      </label>
                      <input
                        id="maxDigit"
                        type="range"
                        min={2}
                        max={9}
                        value={formState.max_digit}
                        className={styles.slider}
                        onChange={handleInputChange('max_digit')}
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
                  <p>Чтобы настроить параметры, завершите текущую попытку или сбросьте результат.</p>
                  <button type="button" className={styles.secondaryButton} onClick={resetSession}>
                    Сбросить и настроить заново
                  </button>
                </div>
              )}
            </div>
          </div>

          {!isSettingsOnly && session && (
            <div className={styles.stageColumn}>
              {stage === 'answer' && (
                <div className={styles.answerCard}>
                  <h3>Введите сумму всех увиденных чисел</h3>
                  <form onSubmit={submitAnswer}>
                    <input
                      type="number"
                      className={styles.answerInput}
                      value={userAnswer}
                      onChange={(event) => setUserAnswer(event.target.value)}
                      placeholder="Например, 248"
                      required
                    />
                    <button type="submit" className={styles.startButton}>
                      Проверить ответ
                    </button>
                  </form>
                </div>
              )}

              {stage === 'result' && (
                <div className={styles.resultCard}>
                  <h3>{isAnswerCorrect ? 'Отлично!' : 'Попробуйте ещё раз'}</h3>
                  <p>
                    Правильный ответ: <strong>{session.total}</strong>
                  </p>
                  <p>
                    Ваш ответ: <strong>{userAnswer || '—'}</strong>
                  </p>
                  <div className={styles.resultActions}>
                    <button type="button" className={styles.primaryButton} onClick={resetSession}>
                      Играть снова
                    </button>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => setShowExample((prev) => !prev)}
                    >
                      {showExample ? 'Скрыть пример' : 'Показать пример вычислений'}
                    </button>
                  </div>

                  {showExample && (
                    <div className={styles.breakdown}>
                      <h4>Последовательность</h4>
                      <div className={styles.expression}>
                        {session.numbers.map((value, index) => (
                          <span key={`${value}-${index}`}>{index === 0 ? value : ` + ${value}`}</span>
                        ))}
                        <span className={styles.equals}>=</span>
                        <span className={styles.total}>{session.total}</span>
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
                {countdownValue === 3 ? '🎯' : countdownValue === 2 ? '🚀' : '✨'}
              </div>
              <p className={styles.countdownText}>Игра начнётся через</p>
              <span className={`${styles.countdownNumber} ${styles.countdownPulse}`}>{countdownValue}</span>
              <p className={styles.countdownHint}>
                {countdownValue === 3 ? 'Приготовьтесь!' : countdownValue === 2 ? 'Внимание!' : 'Стартуем!'}
              </p>
              <button type="button" className={styles.secondaryButton} onClick={resetSession}>
                Выйти
              </button>
            </div>
          </div>
        )}

        {stage === 'play' && session && (
          <div className={`${styles.fullscreenOverlay} ${styles.numberOverlay}`}>
            <div className={styles.playOverlay}>
              <button type="button" className={`${styles.secondaryButton} ${styles.exitButton}`} onClick={resetSession}>
                Выйти
              </button>

              <div className={styles.cardCounter}>
                Карточка <span>{currentCardIndex + 1}</span> из {session.cards.length}
              </div>

              <div className={styles.progressDots}>
                {session.cards.map((card, index) => (
                  <span
                    key={card.index}
                    className={`${styles.dot} ${
                      index === currentCardIndex ? styles.dotActive : index < currentCardIndex ? styles.dotCompleted : ''
                    }`}
                  />
                ))}
              </div>

              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
              </div>

              {renderAbacus()}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

