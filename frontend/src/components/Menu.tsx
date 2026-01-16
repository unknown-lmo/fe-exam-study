import type { Category, CategoryId, QuizMode, QuizOptions } from '../types';
import styles from './Menu.module.css';

interface QuickStats {
  overallCorrectRate: number;
  totalAttempts: number;
  weakQuestionsCount: number;
}

interface MenuProps {
  categories: Category[];
  quickStats: QuickStats | null;
  quizOptions: QuizOptions;
  onUpdateOption: <K extends keyof QuizOptions>(key: K, value: QuizOptions[K]) => void;
  onStartQuiz: (category: CategoryId | null, mode?: QuizMode) => void;
  onNavigate: (view: 'progress' | 'history' | 'glossary' | 'question-list') => void;
}

/**
 * メインメニューコンポーネント
 */
function Menu({
  categories,
  quickStats,
  quizOptions,
  onUpdateOption,
  onStartQuiz,
  onNavigate,
}: MenuProps) {
  return (
    <main className={styles.menu}>
      {/* クイズ設定 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>クイズ設定</h3>
        <div className={styles.optionsGrid}>
          <div className={styles.optionGroup}>
            <span className={styles.optionLabel}>問題数</span>
            <div className={styles.optionButtons}>
              {[5, 10, 20].map(count => (
                <button
                  key={count}
                  className={`${styles.optionButton} ${quizOptions.count === count ? styles.active : ''}`}
                  onClick={() => onUpdateOption('count', count)}
                >
                  {count}問
                </button>
              ))}
            </div>
          </div>

          <div className={styles.optionGroup}>
            <span className={styles.optionLabel}>選択肢</span>
            <button
              className={`${styles.optionToggle} ${quizOptions.shuffle ? styles.active : ''}`}
              onClick={() => onUpdateOption('shuffle', !quizOptions.shuffle)}
            >
              {quizOptions.shuffle ? 'シャッフル ON' : 'シャッフル OFF'}
            </button>
          </div>

          <div className={styles.optionGroup}>
            <span className={styles.optionLabel}>制限時間</span>
            <div className={styles.optionButtons}>
              {[null, 30, 60, 90].map(time => (
                <button
                  key={time ?? 'none'}
                  className={`${styles.optionButton} ${quizOptions.timer === time ? styles.active : ''}`}
                  onClick={() => onUpdateOption('timer', time)}
                >
                  {time === null ? 'なし' : `${time}秒`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 分野選択 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>分野を選んで学習</h3>
        <div className={styles.categoryGrid}>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={styles.categoryButton}
              onClick={() => onStartQuiz(cat.id)}
            >
              <span className={styles.categoryName}>{cat.name}</span>
              <span className={styles.categorySub}>{cat.subcategories.length}分野</span>
            </button>
          ))}
          <button
            className={`${styles.categoryButton} ${styles.categoryAll}`}
            onClick={() => onStartQuiz(null)}
          >
            <span className={styles.categoryName}>全分野</span>
            <span className={styles.categorySub}>ランダム出題</span>
          </button>
        </div>
      </section>

      {/* 復習・確認 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>復習・確認</h3>
        <div className={styles.actionGrid}>
          <button
            className={`${styles.actionButton} ${styles.actionWeak}`}
            onClick={() => onStartQuiz(null, 'weak')}
          >
            <span className={styles.actionIcon}>🔥</span>
            <span className={styles.actionText}>苦手問題を復習</span>
            {quickStats && quickStats.weakQuestionsCount > 0 && (
              <span className={styles.actionBadge}>{quickStats.weakQuestionsCount}</span>
            )}
          </button>

          <button
            className={`${styles.actionButton} ${styles.actionProgress}`}
            onClick={() => onNavigate('progress')}
          >
            <span className={styles.actionIcon}>📊</span>
            <span className={styles.actionText}>学習進捗を見る</span>
          </button>

          <button
            className={`${styles.actionButton} ${styles.actionHistory}`}
            onClick={() => onNavigate('history')}
          >
            <span className={styles.actionIcon}>📝</span>
            <span className={styles.actionText}>学習履歴を見る</span>
          </button>

          <button
            className={`${styles.actionButton} ${styles.actionGlossary}`}
            onClick={() => onNavigate('glossary')}
          >
            <span className={styles.actionIcon}>📚</span>
            <span className={styles.actionText}>用語集を見る</span>
          </button>

          <button
            className={`${styles.actionButton} ${styles.actionList}`}
            onClick={() => onNavigate('question-list')}
          >
            <span className={styles.actionIcon}>📋</span>
            <span className={styles.actionText}>問題一覧を見る</span>
          </button>
        </div>
      </section>
    </main>
  );
}

export default Menu;
