'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

const SPEED_MIN = 0.05;
const SPEED_MAX = 4.0;
const SPEED_STEP = 0.05;
const SPEED_MID = 0.8;
const SPEED_SLIDER_MIN = SPEED_MIN / SPEED_STEP; // 1
const SPEED_SLIDER_MAX = SPEED_MAX / SPEED_STEP; // 80
const SPEED_SLIDER_STEP = 1;

const MIN_WORDS = 2;

const formatSeconds = (value: number): string => {
  if (value < 1) {
    return `${(value * 1000).toFixed(0)} мс`;
  }
  return `${value.toFixed(2)} сек.`;
};

const formatDuration = (milliseconds: number): string => {
  const totalSeconds = Math.round(milliseconds / 100) / 10;
  if (totalSeconds < 1) {
    return `${milliseconds.toFixed(0)} мс`;
  }
  return `${totalSeconds.toFixed(1)} сек.`;
};

type Stage = 'idle' | 'setup' | 'show' | 'recall' | 'result';

type SessionWord = {
  id: number;
  text: string;
};

type DeckCard = {
  id: number;
  front_text: string;
  back_text: string;
  hint: string;
  order: number;
};

type RecallWord = SessionWord & {
  status: 'idle' | 'correct' | 'incorrect';
};

type Deck = {
  id: number;
  slug: string;
  title: string;
  description: string;
  accent_color?: string | null;
  cards: DeckCard[];
};

type SessionPayload = {
  deck: {
    slug: string;
    title: string;
    accent_color?: string | null;
  };
  speed: number;
  word_count: number;
  sequence: SessionWord[];
  recall: SessionWord[];
};

const speedToSlider = (speed: number) => Math.round(speed / SPEED_STEP);
const sliderToSpeed = (value: number) => value * SPEED_STEP;

export default function FlashWordsTrainer() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeckSlug, setActiveDeckSlug] = useState<string | null>(null);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [deckError, setDeckError] = useState<string | null>(null);

  const [speedSliderValue, setSpeedSliderValue] = useState(speedToSlider(0.8));
  const speedSeconds = useMemo(() => sliderToSpeed(speedSliderValue), [speedSliderValue]);

  const [wordCount, setWordCount] = useState<number>(MIN_WORDS);
  const [stage, setStage] = useState<Stage>('idle');
  const [isTrainingView, setIsTrainingView] = useState(false);
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recallWords, setRecallWords] = useState<RecallWord[]>([]);
  const [expectedIndex, setExpectedIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [recallDurationMs, setRecallDurationMs] = useState(0);
  const recallStartRef = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const loadDecks = useCallback(async () => {
    setLoadingDecks(true);
    try {
      const response = await fetch(`${BASE_API_URL}/api/trainers/flash-cards/decks/`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить наборы слов.');
      }
      const payload = (await response.json()) as Deck[];
      setDecks(payload);
      setActiveDeckSlug((previous) => (previous && payload.some((deck) => deck.slug === previous) ? previous : null));
      setDeckError(null);
    } catch (error) {
      setDeckError(error instanceof Error ? error.message : 'Не удалось загрузить данные.');
    } finally {
      setLoadingDecks(false);
    }
  }, []);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  useEffect(() => {
    if (stage !== 'show' && stage !== 'recall') {
      return;
    }
    stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [stage]);

  const activeDeck = useMemo(() => decks.find((deck) => deck.slug === activeDeckSlug) ?? null, [activeDeckSlug, decks]);
  const maxWordCount = useMemo(() => (activeDeck ? Math.max(MIN_WORDS, activeDeck.cards.length) : MIN_WORDS), [activeDeck]);
  const midWordMark = useMemo(() => {
    const max = Math.max(MIN_WORDS, maxWordCount);
    return Math.max(MIN_WORDS, Math.round((MIN_WORDS + max) / 2));
  }, [maxWordCount]);

  useEffect(() => {
    if (!activeDeck) {
      setWordCount(MIN_WORDS);
      return;
    }
    if (wordCount > activeDeck.cards.length) {
      setWordCount(Math.max(MIN_WORDS, activeDeck.cards.length));
    }
  }, [activeDeck, wordCount]);

  const applyDeckSelection = useCallback((deck: Deck) => {
    setActiveDeckSlug(deck.slug);
    setWordCount((previous) => {
      const limit = Math.max(MIN_WORDS, deck.cards.length);
      return Math.min(limit, Math.max(MIN_WORDS, previous));
    });
  }, []);

  const handleSelectDeck = useCallback(
    (deck: Deck) => {
      if (stage === 'show' || stage === 'recall') {
        return;
      }
      applyDeckSelection(deck);
    },
    [applyDeckSelection, stage],
  );

  const startSession = useCallback(
    async (deckSlug?: string, options?: { wordCount?: number }) => {
      const targetSlug = deckSlug ?? activeDeckSlug;
      if (!targetSlug) {
        return;
      }

      const targetDeck = decks.find((deck) => deck.slug === targetSlug) ?? null;
      if (!targetDeck) {
        setDeckError('Уровень не найден. Попробуйте обновить страницу.');
        return;
      }
      if (!targetDeck.cards.length) {
        setDeckError('Для выбранного уровня пока нет слов.');
        return;
      }

      const deckLimit = Math.max(MIN_WORDS, targetDeck.cards.length);
      const resolvedWordCount = Math.min(deckLimit, Math.max(MIN_WORDS, options?.wordCount ?? wordCount));

      applyDeckSelection(targetDeck);

      try {
        const response = await fetch(`${BASE_API_URL}/api/trainers/flash-cards/session/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deck_slug: targetSlug, speed: speedSeconds, word_count: resolvedWordCount }),
        });
        if (!response.ok) {
          throw new Error('Не удалось начать тренировку. Попробуйте ещё раз.');
        }
        const payload = (await response.json()) as SessionPayload;
        setSession(payload);
        setStage('show');
        setCurrentIndex(0);
        setExpectedIndex(0);
        setMistakes(0);
        setRecallDurationMs(0);
        setRecallWords([]);
        recallStartRef.current = null;
        setDeckError(null);
        setWordCount(resolvedWordCount);
        setIsTrainingView(true);
      } catch (error) {
        setDeckError(error instanceof Error ? error.message : 'Произошла ошибка. Попробуйте позже.');
      }
    },
    [activeDeckSlug, applyDeckSelection, decks, speedSeconds, wordCount],
  );

  const handleApplyTrainingSettings = useCallback(() => {
    if (!activeDeckSlug) {
      return;
    }
    startSession(activeDeckSlug, { wordCount });
  }, [activeDeckSlug, startSession, wordCount]);

  const handleRecallClick = useCallback(
    (word: RecallWord) => {
      if (stage !== 'recall' || !session) {
        return;
      }
      if (word.status === 'correct') {
        return;
      }

      const expectedWord = session.sequence[expectedIndex];
      if (!expectedWord) {
        return;
      }

      if (word.id === expectedWord.id) {
        setRecallWords((prev) =>
          prev.map((item) => {
            if (item.id === word.id) {
              return { ...item, status: 'correct' };
            }
            if (item.status === 'incorrect') {
              return { ...item, status: 'idle' };
            }
            return item;
          })
        );

        const nextIndex = expectedIndex + 1;
        setExpectedIndex(nextIndex);

        if (nextIndex >= session.sequence.length) {
          setStage('result');
          if (recallStartRef.current != null) {
            setRecallDurationMs(performance.now() - recallStartRef.current);
          }
        }
      } else {
        setMistakes((prev) => prev + 1);
        setRecallWords((prev) =>
          prev.map((item) => (item.id === word.id ? { ...item, status: 'incorrect' } : item))
        );
      }
    },
    [expectedIndex, session, stage]
  );

  const handleStartDeck = useCallback(
    (deck: Deck) => {
      applyDeckSelection(deck);
      setSession(null);
      setStage('setup');
      setIsTrainingView(true);
      setCurrentIndex(0);
      setExpectedIndex(0);
      setMistakes(0);
      setRecallWords([]);
      setRecallDurationMs(0);
      recallStartRef.current = null;
    },
    [applyDeckSelection],
  );

  const resetSession = useCallback(() => {
    setStage('idle');
    setSession(null);
    setRecallWords([]);
    setCurrentIndex(0);
    setExpectedIndex(0);
    setMistakes(0);
    setRecallDurationMs(0);
    recallStartRef.current = null;
    setIsTrainingView(false);
  }, []);

  useEffect(() => {
    if (stage === 'idle') {
      setIsTrainingView(false);
    }
  }, [stage]);

  useEffect(() => {
    if (!isTrainingView) {
      return;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isTrainingView]);

  useEffect(() => {
    if (stage !== 'show' || !session) {
      return;
    }

    if (currentIndex >= session.sequence.length) {
      const shuffled = session.recall.map((word) => ({ ...word, status: 'idle' as const }));
      setRecallWords(shuffled);
      setStage('recall');
      setExpectedIndex(0);
      recallStartRef.current = performance.now();
      return;
    }

    const timer = window.setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, Math.max(10, session.speed * 1000));

    return () => window.clearTimeout(timer);
  }, [currentIndex, session, stage]);

  const displayedWord = useMemo(() => {
    if (stage !== 'show' || !session) {
      return null;
    }
    if (currentIndex >= session.sequence.length) {
      return null;
    }
    return session.sequence[currentIndex];
  }, [currentIndex, session, stage]);

  const totalShowDurationMs = useMemo(() => {
    if (!session) {
      return 0;
    }
    return session.speed * session.word_count * 1000;
  }, [session]);

  const accuracyPercent = useMemo(() => {
    if (!session) {
      return null;
    }
    const totalAttempts = session.word_count + mistakes;
    if (!totalAttempts) {
      return null;
    }
    return Math.round((session.word_count / totalAttempts) * 100);
  }, [mistakes, session]);

  const renderTrainingContent = () => {
    if (stage === 'setup') {
      return (
        <div className={styles.setupPlaceholder}>
          <p>Настройте скорость показа и количество слов, затем нажмите «Применить настройки», чтобы начать тренировку.</p>
          {activeDeck && <p className={styles.setupDetails}>В наборе «{activeDeck.title}» доступно {activeDeck.cards.length} слов.</p>}
        </div>
      );
    }

    if (!session) {
      return null;
    }

    if (stage === 'show') {
      return (
        <div className={styles.showStage}>
          <span className={styles.showHint}>Запомните слово № {Math.min(currentIndex + 1, session.word_count)}</span>
          <div className={styles.wordDisplay}>
            <span>{displayedWord ? displayedWord.text : '...'}</span>
          </div>
          <p className={styles.showFooter}>
            Осталось слов: {Math.max(0, session.word_count - currentIndex)} из {session.word_count}
          </p>
        </div>
      );
    }

    if (stage === 'recall') {
      return (
        <div className={styles.recallStage}>
          <h2>Восстановите последовательность слов</h2>
          <p>Нажимайте на карточки по порядку показа.</p>
          <div className={styles.recallGrid}>
            {recallWords.map((word) => (
              <button
                key={word.id}
                type="button"
                className={`${styles.recallCard} ${styles[`recallCard_${word.status}`]}`}
                onClick={() => handleRecallClick(word)}
              >
                {word.text}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (stage === 'result' && session) {
      return (
        <div className={styles.resultStage}>
          <h2>Результаты тренировки</h2>
          <div className={styles.resultStats}>
            <div className={styles.statBlock}>
              <span className={styles.statLabel}>Слов в показе</span>
              <span className={styles.statValue}>{session.word_count}</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statLabel}>Ошибок</span>
              <span className={styles.statValue}>{mistakes}</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statLabel}>Показ слов</span>
              <span className={styles.statValue}>{formatDuration(totalShowDurationMs)}</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statLabel}>Повторение</span>
              <span className={styles.statValue}>{formatDuration(recallDurationMs)}</span>
            </div>
            {accuracyPercent != null && (
              <div className={styles.statBlock}>
                <span className={styles.statLabel}>Точность</span>
                <span className={styles.statValue}>{accuracyPercent}%</span>
              </div>
            )}
          </div>

          <h3 className={styles.sequenceTitle}>Правильная последовательность</h3>
          <ol className={styles.sequenceList}>
            {session.sequence.map((word, index) => (
              <li key={word.id}>
                <span>{index + 1}.</span>
                {word.text}
              </li>
            ))}
          </ol>

          <div className={styles.resultActions}>
            <button type="button" className={styles.controlButton} onClick={() => startSession()}>
              Повторить тренировку
            </button>
            <button type="button" className={styles.flashControlSecondary} onClick={resetSession}>
              Настроить заново
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const trainingContent = renderTrainingContent();
  const shouldRenderOverlay = isTrainingView && (stage === 'setup' || Boolean(session));
  const overlayTitle = session?.deck.title ?? activeDeck?.title ?? 'Тренировка';
  const overlayWordCount = session?.word_count ?? wordCount;

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
          <h1>Тренажер «Флеш-слова»</h1>
          <p>
            Настраивайте скорость показа и количество слов. Запоминайте последовательность и восстановите её после
            демонстрации.
          </p>
          <p className={styles.sectionLead}>
            Сначала выберите уровень и настройте слайдеры — после запуска тренажёр покажет слова с заданной скоростью.
          </p>
        </section>

        <section className={styles.configSection}>
          <div className={styles.levelsBlock}>
            <span className={styles.sectionLabel}>Уровни</span>
            {loadingDecks ? (
              <div className={styles.loader}>Загружаем уровни...</div>
            ) : deckError ? (
              <div className={styles.error}>{deckError}</div>
            ) : decks.length ? (
              <div className={styles.difficultyList}>
                {decks.map((deck) => {
                  const preview = deck.cards
                    .slice(0, 8)
                    .map((card) => card.front_text)
                    .filter((word) => word.trim().length > 0)
                    .join(', ');
                  const isActive = activeDeckSlug === deck.slug;
                  return (
                    <article
                      key={deck.slug}
                      className={`${styles.difficultyCard} ${isActive ? styles.difficultyCardActive : ''}`}
                      onClick={() => handleSelectDeck(deck)}
                    >
                      <div className={styles.difficultyHeading}>
                        <h3>{deck.title}</h3>
                        <span>{deck.cards.length} слов</span>
                      </div>
                      <p className={styles.difficultySample} title={preview || 'Набор пока пустой'}>
                        {preview || 'Карточки для этого уровня появятся совсем скоро.'}
                      </p>
                      <div className={styles.difficultyActions}>
                        <button
                          type="button"
                          className={styles.startButton}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleStartDeck(deck);
                          }}
                          disabled={stage !== 'idle'}
                        >
                          Запустить тренажер
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className={styles.error}>Уровни для тренажера появятся совсем скоро.</div>
            )}
          </div>

          <div className={styles.settingsWrapper}>
            {activeDeck ? (
              <>
                <div className={styles.selectedDeckBanner}>
                  <span className={styles.selectedDeckLabel}>Выбран уровень</span>
                  <strong>{activeDeck.title}</strong>
                  <span className={styles.selectedDeckMeta}>{activeDeck.cards.length} слов в наборе</span>
                </div>

                <div className={styles.settingsPanel}>
                  <div className={styles.speedControl}>
                    <label htmlFor="flash-speed" className={styles.speedLabel}>
                      Скорость показа
                      <span className={styles.speedValue}>{formatSeconds(speedSeconds)}</span>
                    </label>
                    <input
                      id="flash-speed"
                      className={styles.speedSlider}
                      type="range"
                      min={SPEED_SLIDER_MIN}
                      max={SPEED_SLIDER_MAX}
                      step={SPEED_SLIDER_STEP}
                      value={speedSliderValue}
                      onChange={(event) => setSpeedSliderValue(Number(event.target.value))}
                      disabled={!activeDeck || stage !== 'idle'}
                    />
                    <div className={styles.speedScale}>
                      <span>{SPEED_MIN.toFixed(2)}</span>
                      <span>{SPEED_MID.toFixed(2)}</span>
                      <span>{SPEED_MAX.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className={styles.speedControl}>
                    <label htmlFor="flash-word-count" className={styles.speedLabel}>
                      Количество слов
                      <span className={styles.speedValue}>{wordCount}</span>
                    </label>
                    <input
                      id="flash-word-count"
                      className={styles.speedSlider}
                      type="range"
                      min={MIN_WORDS}
                      max={maxWordCount}
                      step={1}
                      value={wordCount}
                      onChange={(event) => setWordCount(Number(event.target.value))}
                      disabled={!activeDeck || stage !== 'idle'}
                    />
                    <div className={styles.speedScale}>
                      <span>{MIN_WORDS}</span>
                      <span>{midWordMark}</span>
                      <span>{maxWordCount}</span>
                    </div>
                  </div>

                  <div className={styles.actionPanel}>
                    <span className={styles.speedLabel}>Действие</span>
                    {stage === 'show' || stage === 'recall' ? (
                      <button type="button" className={styles.flashControlSecondary} onClick={resetSession}>
                        Прервать тренировку
                      </button>
                    ) : (
                      <p className={styles.speedHint}>Нажмите «Запустить тренажер» на выбранном уровне, чтобы начать.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.settingsPlaceholder}>
                <p>Сначала выберите уровень, чтобы настроить скорость и количество слов для показа.</p>
              </div>
            )}
          </div>
        </section>

        <section ref={stageRef} className={styles.stage}>
          {stage === 'idle' ? (
            <div className={styles.stagePlaceholder}>
              <p>Экран тренировки появится сразу после запуска уровня.</p>
            </div>
          ) : stage === 'setup' ? (
            <div className={styles.stagePlaceholder}>
              <p>Настройте параметры в открывшемся окне, затем начните тренировку.</p>
            </div>
          ) : (
            <div className={styles.stagePlaceholder}>
              <p>Тренировка отображается в отдельном окне выше.</p>
            </div>
          )}
        </section>
      </main>

      {shouldRenderOverlay && (
        <div className={styles.trainingOverlay} role="dialog" aria-modal="true">
          <div className={styles.trainingModal}>
            <header className={styles.trainingHeader}>
              <div>
                <span className={styles.trainingBadge}>Выбранный уровень</span>
                <h2>{overlayTitle}</h2>
                <p className={styles.trainingMeta}>
                  скорость {formatSeconds(speedSeconds)} • слов {overlayWordCount}
                </p>
              </div>
              <button type="button" className={styles.trainingClose} onClick={resetSession} aria-label="Закрыть тренировку">
                ×
              </button>
            </header>

            {activeDeck && (
              <div className={styles.trainingSettings}>
                <div className={styles.trainingControl}>
                  <label htmlFor="training-speed" className={styles.trainingLabel}>
                    Скорость показа
                    <span className={styles.trainingValue}>{formatSeconds(speedSeconds)}</span>
                  </label>
                  <input
                    id="training-speed"
                    type="range"
                    min={SPEED_SLIDER_MIN}
                    max={SPEED_SLIDER_MAX}
                    step={SPEED_SLIDER_STEP}
                    value={speedSliderValue}
                    onChange={(event) => setSpeedSliderValue(Number(event.target.value))}
                  />
                  <div className={styles.speedScale}>
                    <span>{SPEED_MIN.toFixed(2)}</span>
                    <span>{SPEED_MID.toFixed(2)}</span>
                    <span>{SPEED_MAX.toFixed(1)}</span>
                  </div>
                </div>

                <div className={styles.trainingControl}>
                  <label htmlFor="training-word-count" className={styles.trainingLabel}>
                    Количество слов
                    <span className={styles.trainingValue}>{wordCount}</span>
                  </label>
                  <input
                    id="training-word-count"
                    type="range"
                    min={MIN_WORDS}
                    max={maxWordCount}
                    step={1}
                    value={wordCount}
                    onChange={(event) => setWordCount(Number(event.target.value))}
                  />
                  <div className={styles.speedScale}>
                    <span>{MIN_WORDS}</span>
                    <span>{midWordMark}</span>
                    <span>{maxWordCount}</span>
                  </div>
                </div>

                <div className={styles.trainingActions}>
                  <button type="button" className={styles.controlButton} onClick={handleApplyTrainingSettings}>
                    Применить настройки
                  </button>
                  <button type="button" className={styles.flashControlSecondary} onClick={resetSession}>
                    Завершить тренировку
                  </button>
                </div>
              </div>
            )}

            <div className={styles.trainingBody}>{trainingContent}</div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
