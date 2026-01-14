import { useState, useEffect } from 'react';
import { fetchRandomQuestions, fetchWeakQuestions, fetchQuestionById, submitAnswer } from '../api';
import PresenterDialog from './PresenterDialog';
import { getRandomDialog, transformExplanation } from '../config/presenters';

const defaultOptions = { count: 5, shuffle: false, timer: null };

const DIFFICULTY_LABELS = {
  easy: '易',
  medium: '中',
  hard: '難'
};

// 配列をシャッフルするユーティリティ関数
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function Quiz({ mode, category, questionId = null, options = defaultOptions, onComplete, onBackToList, presenterMode = 'normal' }) {
  const { count, shuffle, timer } = options;
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [expandedTerms, setExpandedTerms] = useState({});
  const [introDialog, setIntroDialog] = useState('');
  const [resultDialog, setResultDialog] = useState('');
  const [timeLeft, setTimeLeft] = useState(timer);

  useEffect(() => {
    loadQuestions();
  }, [mode, category, questionId, count, shuffle]);

  // 問題が変わったら出題セリフを表示
  useEffect(() => {
    if (questions.length > 0 && !result) {
      const intro = getRandomDialog(presenterMode, 'questionIntro');
      setIntroDialog(intro);
    }
  }, [currentIndex, questions.length, presenterMode, result]);

  // タイマーリセット（問題が変わったとき）
  useEffect(() => {
    if (timer) {
      setTimeLeft(timer);
    }
  }, [currentIndex, timer]);

  // タイマーカウントダウン
  useEffect(() => {
    if (!timer || result || loading || finished) return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, timeLeft, result, loading, finished]);

  async function loadQuestions() {
    setLoading(true);
    try {
      let data;
      if (mode === 'single' && questionId) {
        // 単問モード：特定の問題を取得
        const question = await fetchQuestionById(questionId);
        data = question ? [question] : [];
      } else if (mode === 'weak') {
        data = await fetchWeakQuestions();
      } else {
        // count=0は全問出題
        const questionCount = count === 0 ? 1000 : count;
        data = await fetchRandomQuestions(category, questionCount);
      }

      if (data.length === 0) {
        setQuestions([]);
      } else {
        // 選択肢シャッフルが有効な場合（単問モードでは無効）
        const processedData = (shuffle && mode !== 'single') ? data.map(q => {
          const indices = [0, 1, 2, 3];
          const shuffledIndices = shuffleArray(indices);
          const newCorrectIndex = shuffledIndices.indexOf(q.correctAnswer);
          return {
            ...q,
            choices: shuffledIndices.map(i => q.choices[i]),
            originalCorrectAnswer: q.correctAnswer,
            correctAnswer: newCorrectIndex,
            shuffleMap: shuffledIndices  // シャッフル後→元のインデックスマッピング
          };
        }) : data;
        setQuestions(processedData);
      }
    } catch (error) {
      console.error('問題の取得に失敗:', error);
    }
    setLoading(false);
  }

  async function handleSubmit() {
    if (selectedAnswer === null) return;

    const question = questions[currentIndex];
    // シャッフル時は元のインデックスに変換
    const originalAnswer = question.shuffleMap
      ? question.shuffleMap[selectedAnswer]
      : selectedAnswer;
    const response = await submitAnswer(question.id, originalAnswer);
    setResult(response);
    // 回答時にセリフを固定で保存
    setResultDialog(getRandomDialog(presenterMode, response.isCorrect ? 'correct' : 'incorrect'));
    setScore(prev => ({
      correct: prev.correct + (response.isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  }

  async function handleTimeout() {
    setTimeLeft(-1);  // 二重呼び出し防止
    const question = questions[currentIndex];
    // タイムアウト時は-1を送信（未回答）
    const response = await submitAnswer(question.id, -1);
    setResult(response);
    setResultDialog(getRandomDialog(presenterMode, 'timeout'));
    setScore(prev => ({
      correct: prev.correct,
      total: prev.total + 1
    }));
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setResult(null);
      setResultDialog('');
      setExpandedTerms({});
      if (timer) setTimeLeft(timer);  // タイマーをリセット
    } else {
      setFinished(true);
    }
  }

  function toggleTerm(termId) {
    setExpandedTerms(prev => ({
      ...prev,
      [termId]: !prev[termId]
    }));
  }

  function handleRestart() {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setResult(null);
    setResultDialog('');
    setScore({ correct: 0, total: 0 });
    setFinished(false);
    if (timer) setTimeLeft(timer);  // タイマーをリセット
    loadQuestions();
  }

  if (loading) {
    return <div className="quiz-loading">問題を読み込み中...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-empty">
        <p>{mode === 'weak' ? '苦手問題がありません' : '問題がありません'}</p>
        <button onClick={onComplete}>戻る</button>
      </div>
    );
  }

  if (finished) {
    const percentage = Math.round((score.correct / score.total) * 100);
    const finalMessage = getRandomDialog(presenterMode, 'quizComplete', percentage);
    return (
      <div className={`quiz-result ${presenterMode === 'vegeta' ? 'vegeta-mode' : ''}`}>
        <PresenterDialog
          message={finalMessage}
          presenter={presenterMode}
          type="complete"
        />
        <h2>結果発表</h2>
        <div className="score-display">
          <span className="score-number">{score.correct}</span>
          <span className="score-separator">/</span>
          <span className="score-total">{score.total}</span>
        </div>
        <div className="score-percentage">{percentage}%</div>
        <div className="result-actions">
          <button onClick={handleRestart}>もう一度</button>
          {mode === 'single' && onBackToList ? (
            <button onClick={onBackToList}>一覧に戻る</button>
          ) : (
            <button onClick={onComplete}>メニューに戻る</button>
          )}
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className={`quiz ${presenterMode === 'vegeta' ? 'vegeta-mode' : ''}`}>
      <div className="quiz-header">
        <span className="quiz-progress">
          問題 {currentIndex + 1} / {questions.length}
        </span>
        <span className="quiz-category">{question.categoryName}</span>
        <span className="quiz-subcategory">{question.subcategory}</span>
        {question.difficulty && (
          <span className={`quiz-difficulty ${question.difficulty}`}>
            {DIFFICULTY_LABELS[question.difficulty]}
          </span>
        )}
      </div>

      {timer && !result && (
        <div className="quiz-timer">
          <div className="timer-bar-container">
            <div
              className={`timer-bar ${timeLeft <= 10 ? 'warning' : ''} ${timeLeft <= 5 ? 'danger' : ''}`}
              style={{ width: `${(timeLeft / timer) * 100}%` }}
            />
          </div>
          <span className={`timer-text ${timeLeft <= 10 ? 'warning' : ''} ${timeLeft <= 5 ? 'danger' : ''}`}>
            {timeLeft}秒
          </span>
        </div>
      )}

      {!result && introDialog && (
        <PresenterDialog
          message={introDialog}
          presenter={presenterMode}
          type="intro"
        />
      )}

      <div className="quiz-question">
        <p>{question.question}</p>
      </div>

      <div className="quiz-choices">
        {question.choices.map((choice, index) => (
          <button
            key={index}
            className={`choice-button ${selectedAnswer === index ? 'selected' : ''} ${
              result !== null
                ? index === result.correctAnswer
                  ? 'correct'
                  : selectedAnswer === index
                  ? 'incorrect'
                  : ''
                : ''
            }`}
            onClick={() => !result && setSelectedAnswer(index)}
            disabled={result !== null}
          >
            <span className="choice-label">{['ア', 'イ', 'ウ', 'エ'][index]}</span>
            <span className="choice-text">{choice}</span>
          </button>
        ))}
      </div>

      {result && (
        <div className={`quiz-feedback ${result.isCorrect ? 'correct' : 'incorrect'}`}>
          <PresenterDialog
            message={resultDialog}
            presenter={presenterMode}
            type={result.isCorrect ? 'correct' : 'incorrect'}
          />
          <h3>{result.isCorrect ? '正解!' : '不正解'}</h3>
          <p className="explanation">{transformExplanation(presenterMode, result.explanation)}</p>

          {result.relatedTerms && result.relatedTerms.length > 0 && (
            <div className="related-terms-section">
              <h4>関連用語</h4>
              <div className="related-terms-list">
                {result.relatedTerms.map(term => (
                  <div key={term.id} className="related-term-item">
                    <div
                      className="related-term-header"
                      onClick={() => toggleTerm(term.id)}
                    >
                      <span className="term-name">{term.term}</span>
                      <span className="term-meaning">{term.meaning}</span>
                      <span className="expand-icon">
                        {expandedTerms[term.id] ? '▼' : '▶'}
                      </span>
                    </div>
                    {expandedTerms[term.id] && (
                      <div className="related-term-detail">
                        <p>{term.description}</p>
                        {term.tips && (
                          <div className="term-tips">
                            <strong>覚え方:</strong> {term.tips}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="quiz-actions">
        {!result ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="submit-button"
          >
            回答する
          </button>
        ) : mode === 'single' ? (
          <div className="single-mode-actions">
            <button onClick={handleRestart} className="retry-button">
              もう一度
            </button>
            {onBackToList && (
              <button onClick={onBackToList} className="back-to-list-button">
                一覧に戻る
              </button>
            )}
          </div>
        ) : (
          <button onClick={handleNext} className="next-button">
            {currentIndex < questions.length - 1 ? '次の問題' : '結果を見る'}
          </button>
        )}
      </div>

      <div className="quiz-score">
        現在のスコア: {score.correct} / {score.total}
      </div>
    </div>
  );
}

export default Quiz;
