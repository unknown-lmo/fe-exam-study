import { useState, useEffect } from 'react';
import Quiz from './components/Quiz';
import Progress from './components/Progress';
import History from './components/History';
import Glossary from './components/Glossary';
import { fetchCategories, fetchProgress } from './api';
import { usePresenterMode } from './hooks/usePresenterMode';
import './App.css';

function App() {
  const [view, setView] = useState('menu');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [quickStats, setQuickStats] = useState(null);
  const { presenterMode, togglePresenterMode, isVegetaMode } = usePresenterMode();

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

      <div className="presenter-toggle-section">
        <button
          className={`presenter-toggle-button ${isVegetaMode ? 'vegeta-active' : ''}`}
          onClick={togglePresenterMode}
        >
          <span className="toggle-icon">{isVegetaMode ? '👑' : '📚'}</span>
          <span className="toggle-label">
            {isVegetaMode ? 'ベジータモード' : 'ノーマルモード'}
          </span>
        </button>
      </div>

      <main className="menu">
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
