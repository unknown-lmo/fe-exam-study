import { useState, useEffect } from 'react';
import { fetchHistory } from '../api';

interface QuestionInfo {
  categoryName: string;
  subcategory: string;
  questionText: string;
}

interface HistoryItem {
  questionId: string;
  isCorrect: boolean;
  answeredAt: string;
  question?: QuestionInfo;
}

interface HistoryProps {
  onBack: () => void;
}

function History({ onBack }: HistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      const data = await fetchHistory(50) as unknown as HistoryItem[];
      setHistory(data);
    } catch (error) {
      console.error('履歴の取得に失敗:', error);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="history-loading">読み込み中...</div>;
  }

  return (
    <div className="history">
      <h2>学習履歴</h2>

      {history.length === 0 ? (
        <p className="history-empty">まだ学習履歴がありません</p>
      ) : (
        <div className="history-list">
          {history.map((item, index) => (
            <div
              key={index}
              className={`history-item ${item.isCorrect ? 'correct' : 'incorrect'}`}
            >
              <div className="history-result">
                {item.isCorrect ? '○' : '×'}
              </div>
              <div className="history-content">
                {item.question ? (
                  <>
                    <div className="history-category">
                      {item.question.categoryName} / {item.question.subcategory}
                    </div>
                    <div className="history-question">
                      {item.question.questionText}
                    </div>
                  </>
                ) : (
                  <div className="history-question">問題ID: {item.questionId}</div>
                )}
                <div className="history-time">
                  {new Date(item.answeredAt).toLocaleString('ja-JP')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="history-actions">
        <button onClick={onBack}>戻る</button>
      </div>
    </div>
  );
}

export default History;
