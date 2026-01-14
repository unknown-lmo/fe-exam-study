import { useState, useEffect } from 'react';
import { fetchProgress, resetProgress } from '../api';

function Progress({ onBack }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress() {
    setLoading(true);
    try {
      const data = await fetchProgress();
      setProgress(data);
    } catch (error) {
      console.error('進捗の取得に失敗:', error);
    }
    setLoading(false);
  }

  async function handleReset() {
    if (window.confirm('本当に進捗をリセットしますか？この操作は取り消せません。')) {
      await resetProgress();
      loadProgress();
    }
  }

  if (loading) {
    return <div className="progress-loading">読み込み中...</div>;
  }

  if (!progress) {
    return <div className="progress-error">進捗データの取得に失敗しました</div>;
  }

  const categoryNames = {
    technology: 'テクノロジ系',
    management: 'マネジメント系',
    strategy: 'ストラテジ系'
  };

  return (
    <div className="progress">
      <h2>学習進捗</h2>

      <div className="progress-overview">
        <div className="stat-card total">
          <h3>総合成績</h3>
          <div className="stat-value">{progress.overallCorrectRate}%</div>
          <div className="stat-detail">
            {progress.totalCorrect} / {progress.totalAttempts} 問正解
          </div>
        </div>

        <div className="stat-card weak">
          <h3>苦手問題</h3>
          <div className="stat-value">{progress.weakQuestionsCount}</div>
          <div className="stat-detail">問</div>
        </div>
      </div>

      <h3>分野別成績</h3>
      <div className="category-stats">
        {Object.entries(progress.categoryStats).map(([key, stats]) => {
          const rate = stats.totalAttempts > 0
            ? Math.round((stats.correctCount / stats.totalAttempts) * 100)
            : 0;
          return (
            <div key={key} className="category-stat-card">
              <h4>{categoryNames[key]}</h4>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${rate}%` }}
                />
              </div>
              <div className="category-stat-detail">
                <span className="rate">{rate}%</span>
                <span className="count">({stats.correctCount}/{stats.totalAttempts})</span>
              </div>
              {stats.lastStudiedAt && (
                <div className="last-studied">
                  最終学習: {new Date(stats.lastStudiedAt).toLocaleDateString('ja-JP')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="progress-actions">
        <button onClick={onBack}>戻る</button>
        <button onClick={handleReset} className="reset-button">
          進捗をリセット
        </button>
      </div>
    </div>
  );
}

export default Progress;
