import { useState, useEffect } from 'react';
import Quiz from './components/Quiz';
import Progress from './components/Progress';
import History from './components/History';
import Glossary from './components/Glossary';
import QuestionList from './components/QuestionList';
import CharacterSettings from './components/CharacterSettings';
import Menu from './components/Menu';
import { fetchCategories, fetchProgress } from './api';
import { useCharacterSettings } from './hooks/useCharacterSettings';
import { useTheme } from './hooks/useTheme';
import { useQuizOptions } from './hooks/useQuizOptions';
import type { Category, CategoryId, ViewName, PresenterMode, QuizMode } from './types';
import './App.css';

interface QuickStats {
  overallCorrectRate: number;
  totalAttempts: number;
  weakQuestionsCount: number;
}

function App() {
  const [view, setView] = useState<ViewName>('menu');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [showCharacterSettings, setShowCharacterSettings] = useState(false);
  const {
    characters,
    activeCharacter,
    activeCharacterId,
    setActiveCharacter,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    resetToDefault,
    getRandomDialog,
    transformExplanation,
    validateName,
    validateDialog
  } = useCharacterSettings();
  const { isDark, toggleTheme } = useTheme();
  const { options: quizOptions, updateOption } = useQuizOptions();

  // 後方互換性のため、presenterModeを生成
  const presenterMode: PresenterMode = activeCharacterId === 'vegeta' ? 'vegeta' : 'normal';
  const isVegetaMode = activeCharacterId === 'vegeta';

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
      setQuickStats(progress as QuickStats);
    } catch (error) {
      console.error('初期データの取得に失敗:', error);
    }
  }

  function startQuiz(category: CategoryId | null = null, mode: QuizMode = 'normal') {
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
          activeCharacter={activeCharacter}
          getRandomDialog={getRandomDialog}
          transformExplanation={transformExplanation}
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
        <Glossary
          onBack={() => setView('menu')}
          presenterMode={presenterMode}
          activeCharacter={activeCharacter}
          transformExplanation={transformExplanation}
        />
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
          options={quizOptions}
          onComplete={() => {
            setSelectedQuestionId(null);
            setView('menu');
          }}
          onBackToList={() => {
            setSelectedQuestionId(null);
            setView('question-list');
          }}
          presenterMode={presenterMode}
          activeCharacter={activeCharacter}
          getRandomDialog={getRandomDialog}
          transformExplanation={transformExplanation}
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
          onClick={() => {
            // 次のキャラクターに切り替え
            const currentIndex = characters.findIndex(c => c.id === activeCharacterId);
            const nextIndex = (currentIndex + 1) % characters.length;
            setActiveCharacter(characters[nextIndex].id);
          }}
        >
          <span className="toggle-icon">
            {activeCharacter.avatars?.default ? (
              <img src={activeCharacter.avatars.default} alt="" className="toggle-avatar" />
            ) : (
              isVegetaMode ? '👑' : '📚'
            )}
          </span>
          <span className="toggle-label">
            {activeCharacter.name}
          </span>
        </button>
        <button
          className="toggle-button settings-toggle"
          onClick={() => setShowCharacterSettings(true)}
        >
          <span className="toggle-icon">⚙️</span>
          <span className="toggle-label">設定</span>
        </button>
      </div>

      <Menu
        categories={categories}
        quickStats={quickStats}
        quizOptions={quizOptions}
        onUpdateOption={updateOption}
        onStartQuiz={startQuiz}
        onNavigate={setView}
      />

      <footer className="app-footer">
        <p>頑張って勉強しよう!</p>
      </footer>

      {showCharacterSettings && (
        <CharacterSettings
          characters={characters}
          activeCharacter={activeCharacter}
          onClose={() => setShowCharacterSettings(false)}
          onSave={(character) => updateCharacter(character.id, character)}
          onAddCharacter={addCharacter}
          onDeleteCharacter={deleteCharacter}
          onResetToDefault={resetToDefault}
          validateName={validateName}
          validateDialog={validateDialog}
        />
      )}
    </div>
  );
}

export default App;
