import { useState, useEffect } from 'react';
import { fetchQuestionsList, fetchCategories } from '../api';
import { DIFFICULTY_LABELS } from '../constants';
import type { Category, CategoryId, Difficulty, QuestionListItem, QuestionStatus } from '../types';

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

  // 検索フィルタを適用した問題リスト
  const filteredQuestions = filter.search
    ? questions.filter(q =>
        q.question.toLowerCase().includes(filter.search.toLowerCase()) ||
        q.subcategory.toLowerCase().includes(filter.search.toLowerCase())
      )
    : questions;

  // 統計情報
  const stats = {
    total: filteredQuestions.length,
    correct: filteredQuestions.filter(q => q.status === 'correct').length,
    incorrect: filteredQuestions.filter(q => q.status === 'incorrect').length,
    unanswered: filteredQuestions.filter(q => q.status === 'unanswered').length
  };

  if (loading) {
    return <div className="question-list-loading">読み込み中...</div>;
  }

  return (
    <div className="question-list">
      <div className="question-list-header">
        <h2>問題一覧</h2>
        <div className="question-list-stats">
          <span className="stat-item">全{stats.total}問</span>
          <span className="stat-item correct">○{stats.correct}</span>
          <span className="stat-item incorrect">×{stats.incorrect}</span>
          <span className="stat-item unanswered">●{stats.unanswered}</span>
        </div>
      </div>

      <div className="question-list-filters">
        <div className="filter-row">
          <span className="filter-label">カテゴリ:</span>
          <div className="filter-buttons">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`filter-button ${filter.category === cat.id ? 'active' : ''}`}
                onClick={() => handleFilterChange('category', cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-row">
          <span className="filter-label">難易度:</span>
          <div className="filter-buttons">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
              <button
                key={diff}
                className={`filter-button difficulty-${diff} ${filter.difficulty === diff ? 'active' : ''}`}
                onClick={() => handleFilterChange('difficulty', diff)}
              >
                {DIFFICULTY_LABELS[diff]}
              </button>
            ))}
          </div>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="キーワードで検索..."
            value={filter.search}
            onChange={e => setFilter(prev => ({ ...prev, search: e.target.value }))}
            aria-label="問題をキーワードで検索"
          />
          <button type="submit">検索</button>
        </form>
      </div>

      <div className="question-list-items">
        {filteredQuestions.length === 0 ? (
          <div className="question-list-empty">
            該当する問題がありません
          </div>
        ) : (
          filteredQuestions.map(q => (
            <div
              key={q.id}
              className={`question-list-item status-${q.status}`}
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
              <span className={`status-icon ${q.status}`}>
                {STATUS_ICONS[q.status]}
              </span>
              <span className={`difficulty-badge ${q.difficulty}`}>
                {DIFFICULTY_LABELS[q.difficulty]}
              </span>
              <div className="question-info">
                <span className="question-id">{q.id}</span>
                <span className="question-category">{q.subcategory}</span>
              </div>
              <p className="question-text">{q.question}</p>
            </div>
          ))
        )}
      </div>

      <div className="question-list-actions">
        <button onClick={onBack}>メニューに戻る</button>
      </div>
    </div>
  );
}

export default QuestionList;
