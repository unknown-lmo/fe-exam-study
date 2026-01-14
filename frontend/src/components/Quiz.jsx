import { useState, useEffect } from 'react';
import { fetchRandomQuestions, fetchWeakQuestions, submitAnswer } from '../api';
import PresenterDialog from './PresenterDialog';
import { getRandomDialog, transformExplanation } from '../config/presenters';

const defaultOptions = { count: 5, shuffle: false, timer: null };

// 配列をシャッフルするユーティリティ関数
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function Quiz({ mode, category, options = defaultOptions, onComplete, presenterMode = 'normal' }) {
  const { count, shuffle } = options;
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

  useEffect(() => {
    loadQuestions();
  }, [mode, category, count, shuffle]);

  // 問題が変わったら出題セリフを表示
  useEffect(() => {
    if (questions.length > 0 && !result) {
      const intro = getRandomDialog(presenterMode, 'questionIntro');
      setIntroDialog(intro);
    }
  }, [currentIndex, questions.length, presenterMode, result]);

  async function loadQuestions() {
    setLoading(true);
    try {
      let data;
      if (mode === 'weak') {
        data = await fetchWeakQuestions();
      } else {
        // count=0は全問出題
        const questionCount = count === 0 ? 1000 : count;
        data = await fetchRandomQuestions(category, questionCount);
      }

      if (data.length === 0) {
        setQuestions([]);
      } else {
        // 選択肢シャッフルが有効な場合
        const processedData = shuffle ? data.map(q => {
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

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setResult(null);
      setResultDialog('');
      setExpandedTerms({});
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
          <button onClick={onComplete}>メニューに戻る</button>
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
      </div>

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
