'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

interface Difficulty {
  id: number;
  title: string;
  wordCount: number;
  sampleText: string;
  order: number;
}

interface RemoteDifficulty {
  id: number;
  title: string;
  word_count: number;
  sample_text: string;
  order: number;
  is_active: boolean;
}

interface RemoteTrainer {
  id: number;
  slug: string;
  title: string;
  lead: string;
  image: string;
  external_url: string;
  program: string;
  accent_color: string;
  position: number;
  is_active: boolean;
  difficulties: RemoteDifficulty[];
}

interface TrainerDetail {
  slug: string;
  title: string;
  description: string;
  image: string;
  link: string;
  program: string;
  difficulties: Difficulty[];
}

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  prompt: string;
  options: QuestionOption[];
}

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

const QUESTIONS_BY_DIFFICULTY: Record<string, Question[]> = {
  'Зимой — 10 слов(а)': [
    {
      id: 'q1',
      prompt: 'Что делает зайка в тексте?',
      options: [
        { id: 'q1o1', text: 'Спит на санках', isCorrect: true },
        { id: 'q1o2', text: 'Катится с горки', isCorrect: false },
        { id: 'q1o3', text: 'Несёт санки домой', isCorrect: false }
      ]
    },
    {
      id: 'q2',
      prompt: 'Кому принадлежат санки?',
      options: [
        { id: 'q2o1', text: 'Зайке', isCorrect: false },
        { id: 'q2o2', text: 'Зине', isCorrect: true },
        { id: 'q2o3', text: 'Соседу', isCorrect: false }
      ]
    },
    {
      id: 'q3',
      prompt: 'Какое время года описано в тексте?',
      options: [
        { id: 'q3o1', text: 'Зима', isCorrect: true },
        { id: 'q3o2', text: 'Весна', isCorrect: false },
        { id: 'q3o3', text: 'Осень', isCorrect: false }
      ]
    }
  ]
};

const MIN_QUESTION_COUNT = 3;
const MAX_QUESTION_COUNT = 10;
const DISTRACTOR_WORDS = ['книжка', 'огурец', 'машина', 'зебра', 'фонарик', 'чайник', 'пальма', 'струна'];
const ALT_NAMES = ['Маша', 'Петя', 'Игорь', 'Света', 'Ваня', 'Таня', 'Гоша', 'Лена'];
const DEFAULT_ACTIONS = ['катается на санках', 'читает книгу', 'наблюдает за птицами', 'играет в мяч', 'гуляет по парку'];
const STOP_WORDS = new Set([
  'в',
  'на',
  'и',
  'а',
  'но',
  'к',
  'у',
  'по',
  'за',
  'под',
  'через',
  'с',
  'со',
  'как',
  'если',
  'что',
  'это',
  'этот',
  'эта',
  'эту',
  'тот',
  'там',
  'тут',
  'у',
  'из',
  'во',
  'от',
  'для',
  'же'
]);

const randomFrom = <T,>(items: T[], fallback: T): T =>
  items.length > 0 ? items[Math.floor(Math.random() * items.length)] : fallback;

const ensureEnding = (sentence: string) => {
  const trimmed = sentence.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

const createOption = (id: string, text: string, isCorrect = false): QuestionOption => ({
  id,
  text: ensureEnding(text),
  isCorrect
});

const replaceNames = (sentence: string) => {
  const words = sentence.split(/\s+/);
  const replaced = words.map((word) => {
    const base = word.replace(/[«»"(),.?!;:]/g, '');
    if (!base) return word;
    if (/^[А-ЯЁ]/.test(base)) {
      const filtered = ALT_NAMES.filter((name) => name !== base);
      const replacement = randomFrom(filtered, ALT_NAMES[0]);
      return word.replace(base, replacement);
    }
    return word;
  });
  return replaced.join(' ');
};

const replaceKeyword = (sentence: string) => {
  const words = sentence.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const bare = words[i].replace(/[«»"(),.?!;:]/g, '').toLowerCase();
    if (bare.length > 3 && !STOP_WORDS.has(bare)) {
      const replacement = randomFrom(DISTRACTOR_WORDS, DISTRACTOR_WORDS[0]);
      words[i] = replacement;
      return words.join(' ');
    }
  }
  return sentence;
};

const fallbackStatement = () =>
  `В тексте говорится, что ${randomFrom(ALT_NAMES, ALT_NAMES[0])} ${randomFrom(DEFAULT_ACTIONS, DEFAULT_ACTIONS[0])}.`;

const buildQuestionsFromText = (difficulty: Difficulty): Question[] => {
  const sentences =
    difficulty.sampleText
      .match(/[^.!?]+[.!?]*/g)
      ?.map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 3) ?? [];

  if (!sentences.length) {
    return [];
  }

  const limit = Math.min(MAX_QUESTION_COUNT, Math.max(MIN_QUESTION_COUNT, sentences.length));
  const questions: Question[] = [];

  for (let i = 0; i < limit; i++) {
    const sentence = sentences[i % sentences.length];
    const correct = sentence;
    let optionB = replaceNames(sentence);
    if (optionB.trim() === correct.trim()) {
      optionB = fallbackStatement();
    }
    let optionC = replaceKeyword(sentence);
    if (optionC.trim() === correct.trim() || optionC.trim() === optionB.trim()) {
      optionC = fallbackStatement();
    }

    const options = [
      createOption(`${difficulty.id}-opt-${i}-a`, correct, true),
      createOption(`${difficulty.id}-opt-${i}-b`, optionB, false),
      createOption(`${difficulty.id}-opt-${i}-c`, optionC, false)
    ];

    questions.push({
      id: `${difficulty.id}-sense-${i}`,
      prompt: 'Выберите утверждение, которое соответствует тексту.',
      options
    });
  }

  return questions;
};

const resolveQuestionsForDifficulty = (difficulty: Difficulty) => {
  return QUESTIONS_BY_DIFFICULTY[difficulty.title] ?? buildQuestionsFromText(difficulty);
};

export default function TrainerDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [trainer, setTrainer] = useState<TrainerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeed] = useState<number>(2);
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, Set<string>>>({});
  const [score, setScore] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnimationRef = useRef<number | null>(null);

  const isReadingComplete = words.length > 0 && hiddenCount >= words.length;

  useEffect(() => {
    let isMounted = true;

    async function fetchTrainer() {
      if (!slug) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${BASE_API_URL}/api/trainers/`);

        if (!response.ok) {
          throw new Error('Не удалось загрузить данные тренажера');
        }

        const data: RemoteTrainer[] = await response.json();

        const sanitizeLink = (url?: string | null) => {
          if (!url) return '';
          if (url.includes('example.com')) return '';
          return url;
        };

        const normalizeDifficulties = (difficulties?: RemoteDifficulty[]): Difficulty[] => {
          if (!difficulties?.length) {
            return [];
          }

          return difficulties
            .filter((difficulty) => difficulty.is_active)
            .map((difficulty) => ({
              id: difficulty.id,
              title: difficulty.title,
              wordCount: difficulty.word_count,
              sampleText: difficulty.sample_text,
              order: difficulty.order
            }))
            .sort((a, b) => a.order - b.order || a.wordCount - b.wordCount);
        };

        const found = data.find((item) => item.slug === slug && item.is_active);

        if (!found) {
          throw new Error('Тренажер не найден или временно недоступен');
        }

        const normalized: TrainerDetail = {
          slug: found.slug,
          title: found.title,
          description: found.lead || '',
          image: found.image,
          link: sanitizeLink(found.external_url),
          program: found.program,
          difficulties: normalizeDifficulties(found.difficulties)
        };

        if (isMounted) {
          setTrainer(normalized);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Ошибка загрузки данных тренажера');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchTrainer();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const difficulties = useMemo(() => trainer?.difficulties ?? [], [trainer]);

  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSpeed(parseFloat(event.target.value));
  };

  const handleToggleQuestion = () => {
    if (!questions?.length) {
      return;
    }
    setShowQuestions(true);
  };

  const handleOptionToggle = (questionId: string, optionId: string) => {
    setSelectedOptions((prev) => {
      const current = new Set(prev[questionId] ?? []);
      if (current.has(optionId)) {
        current.delete(optionId);
      } else {
        current.add(optionId);
      }
      return { ...prev, [questionId]: current };
    });
  };

  const handleCheckAnswers = () => {
    if (!questions?.length) {
      return;
    }

    let correctCount = 0;

    questions.forEach((question) => {
      const correctIds = new Set(question.options.filter((option) => option.isCorrect).map((option) => option.id));
      const selected = selectedOptions[question.id] ?? new Set<string>();

      const correctArray = Array.from(correctIds);
      const selectedArray = Array.from(selected);

      const selectedMatchesCorrect =
        correctIds.size === selected.size &&
        correctArray.every((correctId) => selected.has(correctId)) &&
        selectedArray.every((selectedId) => correctIds.has(selectedId));

      if (selectedMatchesCorrect) {
        correctCount += 1;
      }
    });

    setScore(Math.round((correctCount / questions.length) * 100));
  };

  const splitIntoWords = (text: string) => text.trim().split(/\s+/);

  const beginDifficulty = (difficulty: Difficulty) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }

    setActiveDifficulty(difficulty);
    setWords(splitIntoWords(difficulty.sampleText));
    setHiddenCount(0);
    setIsRunning(true);
    setIsPaused(false);
    setIsModalOpen(true);
    setQuestions(resolveQuestionsForDifficulty(difficulty));
    setShowQuestions(false);
    setSelectedOptions({});
    setScore(null);
    requestAnimationFrame(() => {
      if (textContainerRef.current) {
        textContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
      }
    });
  };

  const handlePauseToggle = () => {
    if (!activeDifficulty) {
      return;
    }
    setIsPaused((prev) => !prev);
    setIsRunning(true);
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
  };

  const handleRestart = () => {
    if (!activeDifficulty) {
      return;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
    setHiddenCount(0);
    setIsRunning(true);
    setIsPaused(false);
    setShowQuestions(false);
    setSelectedOptions({});
    setScore(null);
    requestAnimationFrame(() => {
      if (textContainerRef.current) {
        textContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
      }
    });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
    return undefined;
  }, [isModalOpen]);

  useEffect(() => {
    if (!isRunning || isPaused || !words.length) {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
        scrollAnimationRef.current = null;
      }
      return;
    }

    if (hiddenCount >= words.length) {
      setIsRunning(false);
      return;
    }

    timerRef.current = setTimeout(() => {
      setHiddenCount((prev) => prev + 1);
    }, speed * 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isRunning, isPaused, hiddenCount, speed, words.length]);

  const closeModal = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsModalOpen(false);
    setIsRunning(false);
    setIsPaused(false);
    setActiveDifficulty(null);
    setHiddenCount(0);
    setWords([]);
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
    setQuestions(null);
    setShowQuestions(false);
    setSelectedOptions({});
    setScore(null);
  };

  useEffect(() => {
    if (!textContainerRef.current) {
      return;
    }

    const container = textContainerRef.current;
    const scrollHeight = container.scrollHeight - container.clientHeight;

    if (scrollHeight <= 0) {
      return;
    }

    const currentScroll = container.scrollTop;
    const progress = words.length ? hiddenCount / words.length : 0;
    const offset = container.clientHeight * 0.2;
    const rawTarget = Math.max(0, scrollHeight * progress - offset);
    const maxStep = container.clientHeight * 0.45;
    const targetScroll =
      rawTarget > currentScroll + maxStep ? currentScroll + maxStep : rawTarget;

    if (targetScroll <= currentScroll) {
      return;
    }

    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
    }

    const distance = targetScroll - currentScroll;
    const duration = Math.max(140, Math.min(speed * 1000 * 0.55, 520));
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      container.scrollTop = currentScroll + distance * t;

      if (t < 1) {
        scrollAnimationRef.current = requestAnimationFrame(animate);
      } else {
        scrollAnimationRef.current = null;
      }
    };

    scrollAnimationRef.current = requestAnimationFrame(animate);
  }, [hiddenCount, words.length, speed]);

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.topBar}>
          <Link href="/trainers/speed-reading" className={styles.backLink}>
            ← Назад к тренажерам
          </Link>
        </div>

        {loading && <div className={styles.statusBanner}>Загружаем уровни…</div>}

        {error && !loading && <div className={styles.errorBanner}>{error}</div>}

        {!loading && !error && trainer && (
          <>
            <section className={styles.difficultySection}>
              <header className={styles.sectionHeader}>
                <span className={styles.programBadge}>Программа «{trainer.program || 'Скорочтение'}»</span>
                <h1>{trainer.title}</h1>
                {trainer.description && <p>{trainer.description}</p>}
                <p className={styles.sectionLead}>
                  Выберите уровень сложности — каждый блок содержит готовый текст и количество слов для тренировки.
                </p>
              </header>

              <div className={styles.speedControl}>
                <label htmlFor="speed-slider" className={styles.speedLabel}>
                  Скорость исчезновения: <span className={styles.speedValue}>{speed.toFixed(1)} сек.</span>
                </label>
                <input
                  id="speed-slider"
                  type="range"
                  min={0.2}
                  max={4}
                  step={0.1}
                  value={speed}
                  onChange={handleSpeedChange}
                  className={styles.speedSlider}
                />
                <div className={styles.speedScale}>
                  <span>0.2</span>
                  <span>2.0</span>
                  <span>4.0</span>
                </div>
              </div>

              <div className={styles.difficultyList}>
                {difficulties.map((difficulty) => (
                  <article key={difficulty.id ?? difficulty.title} className={styles.difficultyCard}>
                    <div className={styles.difficultyHeading}>
                      <h3>{difficulty.title}</h3>
                      <span>{difficulty.wordCount} слов(а)</span>
                    </div>
                    <p className={styles.difficultySample} title={difficulty.sampleText}>
                      {difficulty.sampleText}
                    </p>
                    <div className={styles.difficultyActions}>
                      <button
                        type="button"
                        className={styles.startButton}
                        onClick={() => beginDifficulty(difficulty)}
                      >
                        Запустить тренажер
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {difficulties.length === 0 && (
                <div className={styles.emptyState}>
                  Уровни для этого тренажера появятся совсем скоро. Следите за обновлениями!
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {isModalOpen && activeDifficulty && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <header className={styles.modalHeader}>
              <div>
                <span className={styles.trainerBadge}>Выбранный уровень</span>
                <h2>{activeDifficulty.title}</h2>
                <p className={styles.modalMeta}>
                  {activeDifficulty.wordCount} слов(а) • скорость {speed.toFixed(1)} сек.
                </p>
              </div>
              <button type="button" className={styles.modalClose} onClick={closeModal} aria-label="Закрыть тренировку">
                ×
              </button>
            </header>

            <div className={styles.modalSpeed}>
              <label htmlFor="modal-speed-slider">
                Скорость исчезновения: <span>{speed.toFixed(1)} сек.</span>
              </label>
              <input
                id="modal-speed-slider"
                type="range"
                min={0.2}
                max={4}
                step={0.1}
                value={speed}
                onChange={handleSpeedChange}
              />
              <div className={styles.speedScale}>
                <span>0.2</span>
                <span>2.0</span>
                <span>4.0</span>
              </div>
            </div>

            <div className={styles.trainerText} ref={textContainerRef}>
              {words.map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className={`${styles.trainerWord} ${index < hiddenCount ? styles.trainerWordHidden : ''}`}
                >
                  {word}
                </span>
              ))}
            </div>

            <footer className={styles.trainerControls}>
              <button type="button" className={styles.controlButton} onClick={handlePauseToggle}>
                {isPaused ? 'Продолжить' : 'Пауза'}
              </button>
              <button type="button" className={styles.controlButtonSecondary} onClick={handleRestart}>
                Сначала
              </button>
              {isReadingComplete && questions?.length && (
                <button type="button" className={styles.controlButtonSecondary} onClick={handleToggleQuestion}>
                  Вопросы
                </button>
              )}
            </footer>

          </div>
        </div>
      )}

      {showQuestions && questions?.length && (
        <div className={styles.questionsOverlay} role="dialog" aria-modal="true">
          <div className={styles.questionsModal}>
            <header className={styles.questionsHeader}>
              <h3 className={styles.questionsTitle}>Проверь себя</h3>
              <button
                type="button"
                className={styles.questionsClose}
                onClick={() => {
                  setShowQuestions(false);
                  setSelectedOptions({});
                  setScore(null);
                }}
                aria-label="Закрыть вопросы"
              >
                ×
              </button>
            </header>
            <p className={styles.questionsHint}>
              Отметьте правильные ответы и нажмите «Проверить ответы», чтобы узнать результат.
            </p>
            <div className={styles.questionsList}>
              {questions.map((question) => (
                <article key={question.id} className={styles.questionCard}>
                  <h4>{question.prompt}</h4>
                  <ul>
                    {question.options.map((option) => {
                      const checked = selectedOptions[question.id]?.has(option.id) ?? false;
                      return (
                        <li key={option.id}>
                          <label>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleOptionToggle(question.id, option.id)}
                            />
                            <span>{option.text}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              ))}
            </div>
            <footer className={styles.questionsActions}>
              <button type="button" className={styles.controlButton} onClick={handleCheckAnswers}>
                Проверить ответы
              </button>
              {score !== null && <span className={styles.questionsScore}>Верно: {score}%</span>}
            </footer>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

