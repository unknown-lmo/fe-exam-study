import { useState, useEffect } from 'react';
import Quiz from './components/Quiz';
import Progress from './components/Progress';
import History from './components/History';
import Glossary from './components/Glossary';
import QuestionList from './components/QuestionList';
import { fetchCategories, fetchProgress } from './api';
import { usePresenterMode } from './hooks/usePresenterMode';
import { useTheme } from './hooks/useTheme';
import { useQuizOptions } from './hooks/useQuizOptions';
import './App.css';

function App() {
  const [view, setView] = useState('menu');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [quickStats, setQuickStats] = useState(null);
  const { presenterMode, togglePresenterMode, isVegetaMode } = usePresenterMode();
  const { isDark, toggleTheme } = useTheme();
  const { options: quizOptions, updateOption } = useQuizOptions();

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      const [cats, progress] = await Promise.all([
        fetchCategories(),
        fetchProgress()
      ]);
      setCategories(cats);
      setQuickStats(progress);
    } catch (error) {
      console.error('初期データの取得に失敗:', error);
    }
  }

  function startQuiz(category = null, mode = 'normal') {
    setSelectedCategory(category);
    setView(mode === 'weak' ? 'quiz-weak' : 'quiz');
  }

  function handleQuizComplete() {
    setView('menu');
    loadInitialData();
  }

  if (view === 'quiz' || view === 'quiz-weak') {
    return (
      <div className="app">
        <Quiz
          mode={view === 'quiz-weak' ? 'weak' : 'normal'}
          category={selectedCategory}
          options={quizOptions}
          onComplete={handleQuizComplete}
          presenterMode={presenterMode}
        />
      </div>
    );
  }

  if (view === 'progress') {
    return (
      <div className="app">
        <Progress onBack={() => { setView('menu'); loadInitialData(); }} />
      </div>
    );
  }

  if (view === 'history') {
    return (
      <div className="app">
        <History onBack={() => setView('menu')} />
      </div>
    );
  }

  if (view === 'glossary') {
    return (
      <div className="app app-glossary">
        <Glossary onBack={() => setView('menu')} presenterMode={presenterMode} />
      </div>
    );
  }

  if (view === 'question-list') {
    return (
      <div className="app">
        <QuestionList
          onSelectQuestion={(id) => {
            setSelectedQuestionId(id);
            setView('quiz-single');
          }}
          onBack={() => setView('menu')}
        />
      </div>
    );
  }

  if (view === 'quiz-single') {
    return (
      <div className="app">
        <Quiz
          mode="single"
          questionId={selectedQuestionId}
          options={{ ...quizOptions, shuffle: false }}
          onComplete={() => {
            setSelectedQuestionId(null);
            setView('menu');
          }}
          onBackToList={() => {
            setSelectedQuestionId(null);
            setView('question-list');
          }}
          presenterMode={presenterMode}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>基本情報技術者試験</h1>
        <h2>学習システム</h2>
      </header>

      {quickStats && (
        <div className="quick-stats">
          <div className="quick-stat">
            <span className="stat-label">正答率</span>
            <span className="stat-value">{quickStats.overallCorrectRate}%</span>
          </div>
          <div className="quick-stat">
            <span className="stat-label">回答数</span>
            <span className="stat-value">{quickStats.totalAttempts}</span>
          </div>
          <div className="quick-stat">
            <span className="stat-label">苦手問題</span>
            <span className="stat-value">{quickStats.weakQuestionsCount}</span>
          </div>
        </div>
      )}

      <div className="toggle-buttons-section">
        <button
          className="toggle-button theme-toggle"
          onClick={toggleTheme}
        >
          <span className="toggle-icon">{isDark ? '🌙' : '☀️'}</span>
          <span className="toggle-label">
            {isDark ? 'ダーク' : 'ライト'}
          </span>
        </button>
        <button
          className="toggle-button presenter-toggle"
          onClick={togglePresenterMode}
        >
          <span className="toggle-icon">{isVegetaMode ? '👑' : '📚'}</span>
          <span className="toggle-label">
            {isVegetaMode ? 'ベジータ' : 'ノーマル'}
          </span>
        </button>
      </div>

      <main className="menu">
        <section className="menu-section">
          <h3>クイズ設定</h3>
          <div className="quiz-options">
            <div className="option-group">
              <span className="option-label">問題数</span>
              <div className="option-buttons">
                {[5, 10, 20].map(count => (
                  <button
                    key={count}
                    className={`option-button ${quizOptions.count === count ? 'active' : ''}`}
                    onClick={() => updateOption('count', count)}
                  >
                    {count}問
                  </button>
                ))}
              </div>
            </div>
            <div className="option-group">
              <span className="option-label">選択肢</span>
              <button
                className={`option-toggle ${quizOptions.shuffle ? 'active' : ''}`}
                onClick={() => updateOption('shuffle', !quizOptions.shuffle)}
              >
                {quizOptions.shuffle ? 'シャッフル ON' : 'シャッフル OFF'}
              </button>
            </div>
            <div className="option-group">
              <span className="option-label">制限時間</span>
              <div className="option-buttons">
                {[null, 30, 60, 90].map(time => (
                  <button
                    key={time ?? 'none'}
                    className={`option-button ${quizOptions.timer === time ? 'active' : ''}`}
                    onClick={() => updateOption('timer', time)}
                  >
                    {time === null ? 'なし' : `${time}秒`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="menu-section">
          <h3>分野を選んで学習</h3>
          <div className="category-buttons">
            {categories.map(cat => (
              <button
                key={cat.id}
                className="category-button"
                onClick={() => startQuiz(cat.id)}
              >
                <span className="category-name">{cat.name}</span>
                <span className="category-sub">{cat.subcategories.length}分野</span>
              </button>
            ))}
            <button
              className="category-button all"
              onClick={() => startQuiz(null)}
            >
              <span className="category-name">全分野</span>
              <span className="category-sub">ランダム出題</span>
            </button>
          </div>
        </section>

        <section className="menu-section">
          <h3>復習・確認</h3>
          <div className="action-buttons">
            <button
              className="action-button weak"
              onClick={() => startQuiz(null, 'weak')}
            >
              苦手問題を復習
            </button>
            <button
              className="action-button progress"
              onClick={() => setView('progress')}
            >
              学習進捗を見る
            </button>
            <button
              className="action-button history"
              onClick={() => setView('history')}
            >
              学習履歴を見る
            </button>
            <button
              className="action-button glossary"
              onClick={() => setView('glossary')}
            >
              用語集を見る
            </button>
            <button
              className="action-button question-list"
              onClick={() => setView('question-list')}
            >
              問題一覧を見る
            </button>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>頑張って勉強しよう!</p>
      </footer>
    </div>
  );
}

export default App;
