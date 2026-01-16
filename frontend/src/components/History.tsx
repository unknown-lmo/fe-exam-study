import { useState, useEffect } from 'react';
import { fetchHistory } from '../api';
import type { HistoryEntry } from '../types';
import styles from './History.module.css';

interface HistoryProps {
  onBack: () => void;
}

function History({ onBack }: HistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      const data = await fetchHistory(50);
      setHistory(data);
    } catch (error) {
      console.error('履歴の取得に失敗:', error);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>学習履歴</h2>

      {history.length === 0 ? (
        <p className={styles.empty}>まだ学習履歴がありません</p>
      ) : (
        <div className={styles.list}>
          {history.map((item, index) => (
            <div
              key={index}
              className={`${styles.item} ${item.isCorrect ? styles.correct : styles.incorrect}`}
            >
              <div className={styles.result}>
                {item.isCorrect ? '○' : '×'}
              </div>
              <div className={styles.content}>
                {item.question ? (
                  <>
                    <div className={styles.category}>
                      {item.question.categoryName} / {item.question.subcategory}
                    </div>
                    <div className={styles.question}>
                      {item.question.questionText}
                    </div>
                  </>
                ) : (
                  <div className={styles.question}>問題ID: {item.questionId}</div>
                )}
                <div className={styles.time}>
                  {new Date(item.answeredAt).toLocaleString('ja-JP')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.backButton} onClick={onBack}>戻る</button>
      </div>
    </div>
  );
}

export default History;
