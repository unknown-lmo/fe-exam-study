import { useState, useEffect, useMemo } from 'react';
import { fetchQuestionsList, fetchCategories } from '../api';
import { DIFFICULTY_LABELS } from '../constants';
import { useDebounce } from '../hooks/useDebounce';
import type { Category, CategoryId, Difficulty, QuestionListItem, QuestionStatus } from '../types';
import styles from './QuestionList.module.css';

interface QuestionFilter {
  category: CategoryId | null;
  difficulty: Difficulty | null;
  search: string;
}

interface QuestionListProps {
  onSelectQuestion: (questionId: string) => void;
  onBack: () => void;
}

const STATUS_ICONS: Record<QuestionStatus, string> = {
  correct: '○',
  incorrect: '×',
  unanswered: '●'
};

function QuestionList({ onSelectQuestion, onBack }: QuestionListProps) {
  const [questions, setQuestions] = useState<QuestionListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<QuestionFilter>({
    category: null,
    difficulty: null,
    search: ''
  });

  // 検索テキストをデバウンス（300ms）
  const debouncedSearch = useDebounce(filter.search, 300);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [filter.category, filter.difficulty]);

  async function loadCategories() {
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (error) {
      console.error('カテゴリの取得に失敗:', error);
    }
  }

  async function loadQuestions() {
    setLoading(true);
    try {
      const data = await fetchQuestionsList(
        filter.category,
        filter.difficulty,
        filter.search || null
      );
      setQuestions(data);
    } catch (error) {
      console.error('問題一覧の取得に失敗:', error);
    }
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadQuestions();
  }

  function handleFilterChange<K extends keyof QuestionFilter>(key: K, value: QuestionFilter[K]) {
    setFilter(prev => ({
      ...prev,
      [key]: prev[key] === value ? null : value
    }));
  }

  // 検索フィルタを適用した問題リスト（メモ化）
  const filteredQuestions = useMemo(() => {
    if (!debouncedSearch) return questions;
    const searchLower = debouncedSearch.toLowerCase();
    return questions.filter(q =>
      q.question.toLowerCase().includes(searchLower) ||
      q.subcategory.toLowerCase().includes(searchLower)
    );
  }, [questions, debouncedSearch]);

  // 統計情報（メモ化）
  const stats = useMemo(() => ({
    total: filteredQuestions.length,
    correct: filteredQuestions.filter(q => q.status === 'correct').length,
    incorrect: filteredQuestions.filter(q => q.status === 'incorrect').length,
    unanswered: filteredQuestions.filter(q => q.status === 'unanswered').length
  }), [filteredQuestions]);

  if (loading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>問題一覧</h2>
        <div className={styles.stats}>
          <span className={styles.statItem}>全{stats.total}問</span>
          <span className={`${styles.statItem} ${styles.statCorrect}`}>○{stats.correct}</span>
          <span className={`${styles.statItem} ${styles.statIncorrect}`}>×{stats.incorrect}</span>
          <span className={`${styles.statItem} ${styles.statUnanswered}`}>●{stats.unanswered}</span>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>カテゴリ:</span>
          <div className={styles.filterButtons}>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`${styles.filterButton} ${filter.category === cat.id ? styles.active : ''}`}
                onClick={() => handleFilterChange('category', cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>難易度:</span>
          <div className={styles.filterButtons}>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
              <button
                key={diff}
                className={`${styles.filterButton} ${styles[`difficulty${diff.charAt(0).toUpperCase() + diff.slice(1)}`]} ${filter.difficulty === diff ? styles.active : ''}`}
                onClick={() => handleFilterChange('difficulty', diff)}
              >
                {DIFFICULTY_LABELS[diff]}
              </button>
            ))}
          </div>
        </div>

        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="キーワードで検索..."
            value={filter.search}
            onChange={e => setFilter(prev => ({ ...prev, search: e.target.value }))}
            aria-label="問題をキーワードで検索"
          />
          <button type="submit" className={styles.searchButton}>検索</button>
        </form>
      </div>

      <div className={styles.list}>
        {filteredQuestions.length === 0 ? (
          <div className={styles.empty}>
            該当する問題がありません
          </div>
        ) : (
          filteredQuestions.map(q => (
            <div
              key={q.id}
              className={`${styles.item} ${styles[`status${q.status.charAt(0).toUpperCase() + q.status.slice(1)}`]}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelectQuestion(q.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectQuestion(q.id);
                }
              }}
            >
              <span className={`${styles.statusIcon} ${styles[q.status]}`}>
                {STATUS_ICONS[q.status]}
              </span>
              <span className={`${styles.difficultyBadge} ${styles[q.difficulty]}`}>
                {DIFFICULTY_LABELS[q.difficulty]}
              </span>
              <div className={styles.itemContent}>
                <p className={styles.itemQuestion}>{q.question}</p>
                <div className={styles.itemMeta}>
                  <span>{q.id}</span>
                  <span>{q.subcategory}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.backButton} onClick={onBack}>メニューに戻る</button>
      </div>
    </div>
  );
}

export default QuestionList;
