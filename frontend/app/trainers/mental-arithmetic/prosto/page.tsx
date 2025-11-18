'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type Stage = 'settings' | 'countdown' | 'play' | 'answer' | 'result' | 'error';

type SimplySettings = {
  range_key: number;
  range_label: string;
  num_examples: number;
  speed: number;
  max_digit: number;
  max_sum: number;
};

type SimplyNumber = {
  index: number;
  value: number;
};

type SimplySession = {
  settings: SimplySettings;
  numbers: SimplyNumber[];
  total: number;
};

const RANGE_OPTIONS = [
  { key: 1, label: 'от 1 до 10' },
  { key: 2, label: 'от 10 до 100' },
  { key: 3, label: 'от 100 до 1000' },
  { key: 4, label: 'от 1000 до 10000' },
];

const formatNumber = (value: number) => (value > 0 ? `+${value}` : value.toString());

export default function SimplyTrainerPage() {
  const [stage, setStage] = useState<Stage>('settings');
  const [formState, setFormState] = useState({
    range_key: 2,
    num_examples: 10,
    speed: 1.5,
    max_digit: 9,
  });
  const [session, setSession] = useState<SimplySession | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [userIsCorrect, setUserIsCorrect] = useState<boolean | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentNumber = session?.numbers[currentIndex];
  const totalNumbers = session?.numbers.length ?? 0;

  const rangeDescription = useMemo(() => {
    const option = RANGE_OPTIONS.find((opt) => opt.key === formState.range_key);
    return option?.label ?? RANGE_OPTIONS[0].label;
  }, [formState.range_key]);

  const resetGame = useCallback(() => {
    setStage('settings');
    setSession(null);
    setCurrentIndex(0);
    setUserAnswer('');
    setUserIsCorrect(null);
    setShowBreakdown(false);
    setError(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const numberToWords = useCallback((num: number): string => {
    const ones = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
    const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
    const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
    const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];

    if (num === 0) return 'ноль';
    if (num < 0) return `минус ${numberToWords(Math.abs(num))}`;

    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      return num % 10 === 0 ? tens[Math.floor(num / 10)] : `${tens[Math.floor(num / 10)]} ${ones[num % 10]}`.trim();
    }
    if (num < 1000) {
      const remainder = num % 100;
      return remainder === 0
        ? hundreds[Math.floor(num / 100)]
        : `${hundreds[Math.floor(num / 100)]} ${numberToWords(remainder)}`.trim();
    }
    if (num < 10000) {
      const thousands = Math.floor(num / 1000);
      const tail = num % 1000;
      const thousandsWord =
        thousands === 1
          ? 'одна тысяча'
          : thousands < 5
          ? `${numberToWords(thousands)} тысячи`
          : `${numberToWords(thousands)} тысяч`;
      const tailWord = tail ? ` ${numberToWords(tail)}` : '';
      return `${thousandsWord}${tailWord}`.trim();
    }
    return num.toString();
  }, []);

  const speakNumber = useCallback(
    (value: number, speed?: number) => {
      if (!audioEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
      
      // Не озвучиваем, если скорость быстрее 1.5 секунд
      if (speed !== undefined && speed < 1.5) return;

      const utterance = new SpeechSynthesisUtterance();
      const text = value > 0 ? `плюс ${numberToWords(value)}` : numberToWords(value);
      utterance.text = text;
      utterance.lang = 'ru-RU';
      utterance.rate = 2.5;
      utterance.pitch = 1;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const russianVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('ru'));
      if (russianVoice) {
        utterance.voice = russianVoice;
      }

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [audioEnabled, numberToWords],
  );

  const handleInputChange = (field: keyof typeof formState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'speed' ? parseFloat(event.target.value) : parseInt(event.target.value, 10);
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const startSession = async () => {
    setError(null);
    setStage('settings');
    try {
      const response = await fetch(`${BASE_API_URL}/api/trainers/simply/session/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error('Не удалось запустить тренажёр. Попробуйте ещё раз.');
      }

      const data: SimplySession = await response.json();
      setSession(data);
      setCountdown(3);
      setStage('countdown');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка. Попробуйте позже.');
      setStage('error');
    }
  };

  const checkAnswer = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) return;

    const numericAnswer = parseInt(userAnswer, 10);
    if (Number.isNaN(numericAnswer)) {
      setError('Введите корректное число');
      return;
    }

    setUserIsCorrect(numericAnswer === session.total);
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
    if (session.numbers.length > 0) {
      speakNumber(session.numbers[0].value, session.settings.speed);
    }

    const scheduleNext = (index: number) => {
      timerRef.current = setTimeout(() => {
        const nextIndex = index + 1;
        if (!session || nextIndex >= session.numbers.length) {
          setStage('answer');
          return;
        }
        setCurrentIndex(nextIndex);
        speakNumber(session.numbers[nextIndex].value, session.settings.speed);
        scheduleNext(nextIndex);
      }, session.settings.speed * 1000);
    };

    scheduleNext(0);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Отменяем озвучку при размонтировании
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [session, stage, speakNumber]);

  const progressPercent = totalNumbers ? Math.round(((currentIndex + 1) / totalNumbers) * 100) : 0;

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
          <h1>Тренажер «Просто»</h1>
          <p className={styles.sectionLead}>
            Запустите последовательность чисел в выбранном диапазоне, удерживайте сумму в голове и введите результат. Режим отлично подходит для разминки перед более
            сложными заданиями.
          </p>
        </header>

        <section className={`${styles.layout} ${isSettingsOnly ? styles.layoutSingle : ''}`}>
          <div className={`${styles.settingsColumn} ${isSettingsOnly ? styles.settingsColumnWide : ''}`}>
            <div className={styles.panel}>
              {stage === 'error' && error && (
                <div className={styles.errorBanner}>
                  <p>{error}</p>
                  <button className={styles.secondaryButton} onClick={resetGame}>
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
                      <label htmlFor="range">
                        Сложность <span className={styles.settingValue}>{rangeDescription}</span>
                      </label>
                      <input
                        id="range"
                        type="range"
                        min={1}
                        max={4}
                        step={1}
                        value={formState.range_key}
                        className={styles.slider}
                        onChange={handleInputChange('range_key')}
                      />
                      <div className={styles.sliderLabels}>
                        {RANGE_OPTIONS.map((option) => (
                          <span key={option.key}>{option.label}</span>
                        ))}
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="examples">
                        Количество примеров <span className={styles.settingValue}>{formState.num_examples}</span>
                      </label>
                      <input
                        id="examples"
                        type="range"
                        min={2}
                        max={99}
                        value={formState.num_examples}
                        className={styles.slider}
                        onChange={handleInputChange('num_examples')}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="speed">
                        Скорость показа (сек.) <span className={styles.settingValue}>{formState.speed.toFixed(1)} сек</span>
                      </label>
                      <input
                        id="speed"
                        type="range"
                        min={0.5}
                        max={6}
                        step={0.1}
                        value={formState.speed}
                        className={styles.slider}
                        onChange={handleInputChange('speed')}
                      />
                      <p className={styles.helperText}>
                        {formState.speed >= 1.5 ? '🔊 Озвучка доступна на этой скорости' : '🔇 Озвучка отключена при скорости ниже 1.5 сек'}
                      </p>
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
                    <button
                      type="button"
                      className={audioEnabled ? styles.primaryButton : styles.dangerButton}
                      onClick={() => setAudioEnabled((prev) => !prev)}
                    >
                      {audioEnabled ? '🔊 Озвучка включена' : '🔇 Озвучка выключена'}
                    </button>

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
                <h3>Введите сумму всех чисел</h3>
                <p>Вспомните последовательность и укажите конечный результат.</p>
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
                  Правильный ответ: <strong>{session.total}</strong>
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
                      {session.numbers.map((item) => (
                        <span key={item.index}>{formatNumber(item.value)}</span>
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

        {stage === 'play' && session && currentNumber && (
          <div className={`${styles.fullscreenOverlay} ${styles.numberOverlay}`}>
            <div className={styles.numberContent}>
              <div className={styles.progress}>
                <span>
                  Число {currentNumber.index} из {session.numbers.length}
                </span>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <div className={`${styles.currentNumber} ${currentNumber.value < 0 ? styles.negativeNumber : styles.positiveNumber}`}>
                {formatNumber(currentNumber.value)}
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

