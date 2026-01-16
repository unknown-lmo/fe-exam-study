import { useState, useEffect } from 'react';
import { fetchProgress, resetProgress } from '../api';
import { CATEGORY_NAMES } from '../constants';
import type { CategoryId, CategoryStats, Progress as ProgressData } from '../types';
import styles from './Progress.module.css';

interface ProgressProps {
  onBack: () => void;
}

function Progress({ onBack }: ProgressProps) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
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
    return <div className={styles.loading}>読み込み中...</div>;
  }

  if (!progress) {
    return <div className={styles.error}>進捗データの取得に失敗しました</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>学習進捗</h2>

      <div className={styles.overview}>
        <div className={`${styles.statCard} ${styles.total}`}>
          <h3>総合成績</h3>
          <div className={styles.statValue}>{progress.overallCorrectRate}%</div>
          <div className={styles.statDetail}>
            {progress.totalCorrect} / {progress.totalAttempts} 問正解
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.weak}`}>
          <h3>苦手問題</h3>
          <div className={styles.statValue}>{progress.weakQuestionsCount}</div>
          <div className={styles.statDetail}>問</div>
        </div>
      </div>

      <h3 className={styles.sectionTitle}>分野別成績</h3>
      <div className={styles.categoryStats}>
        {(Object.entries(progress.categoryStats) as [CategoryId, CategoryStats][]).map(([key, stats]) => {
          const rate = stats.totalAttempts > 0
            ? Math.round((stats.correctCount / stats.totalAttempts) * 100)
            : 0;
          return (
            <div key={key} className={styles.categoryCard}>
              <h4>{CATEGORY_NAMES[key]}</h4>
              <div className={styles.progressBarContainer}>
                <div
                  className={styles.progressBar}
                  style={{ width: `${rate}%` }}
                />
              </div>
              <div className={styles.categoryDetail}>
                <span className={styles.rate}>{rate}%</span>
                <span className={styles.count}>({stats.correctCount}/{stats.totalAttempts})</span>
              </div>
              {stats.lastStudiedAt && (
                <div className={styles.lastStudied}>
                  最終学習: {new Date(stats.lastStudiedAt).toLocaleDateString('ja-JP')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        <button className={styles.backButton} onClick={onBack}>戻る</button>
        <button className={styles.resetButton} onClick={handleReset}>
          進捗をリセット
        </button>
      </div>
    </div>
  );
}

export default Progress;
