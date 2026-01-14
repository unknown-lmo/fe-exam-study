// ========================================
// データモデル
// ========================================

/** カテゴリID */
export type CategoryId = 'technology' | 'management' | 'strategy';

/** 難易度 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** 問題データ */
export interface Question {
  id: string;
  category: CategoryId;
  categoryName: string;
  subcategory: string;
  question: string;
  choices: [string, string, string, string];
  correctAnswer: 0 | 1 | 2 | 3;
  explanation: string;
  relatedTerms: string[];
  difficulty?: Difficulty;
}

/** シャッフル済み問題（Quiz内部用） */
export interface ShuffledQuestion extends Question {
  originalCorrectAnswer?: 0 | 1 | 2 | 3;
  shuffleMap?: number[];
}

/** カテゴリ */
export interface Category {
  id: CategoryId;
  name: string;
  subcategories: string[];
}

/** 用語 */
export interface GlossaryTerm {
  id: string;
  term: string;
  fullName?: string;
  meaning: string;
  category: CategoryId;
  subcategory: string;
  description: string;
  examples?: string[];
  relatedTerms?: string[];
  tips?: string;
}

/** 回答結果 */
export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: 0 | 1 | 2 | 3;
  explanation: string;
  relatedTerms?: GlossaryTerm[];
}

/** カテゴリ統計（APIレスポンス） */
export interface CategoryStats {
  totalAttempts: number;
  correctCount: number;
  lastStudiedAt: string | null;
}

/** 学習進捗（APIレスポンス） */
export interface Progress {
  user: {
    id: string;
    createdAt: string;
    lastAccessedAt: string;
  };
  categoryStats: Record<CategoryId, CategoryStats>;
  totalAttempts: number;
  totalCorrect: number;
  overallCorrectRate: number | string;
  weakQuestionsCount: number;
}

/** カテゴリ別進捗（UI表示用） */
export interface CategoryProgress {
  category: CategoryId;
  categoryName: string;
  attempts: number;
  correct: number;
  rate: number;
}

/** 履歴内の問題情報 */
export interface HistoryQuestionInfo {
  id: string;
  category: CategoryId;
  categoryName: string;
  subcategory: string;
  questionText: string;
}

/** 履歴エントリ（APIレスポンス） */
export interface HistoryEntry {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  answeredAt: string;
  question: HistoryQuestionInfo | null;
}

// ========================================
// キャラクター関連
// ========================================

/** セリフタイプ */
export type DialogType =
  | 'questionIntro'
  | 'correct'
  | 'incorrect'
  | 'timeout'
  | 'quizStart'
  | 'quizComplete';

/** クイズ完了時のスコアカテゴリ */
export type ScoreCategory = 'excellent' | 'good' | 'needsWork';

/** セリフ定義 */
export interface CharacterDialogs {
  questionIntro: string[];
  correct: string[];
  incorrect: string[];
  timeout: string[];
  quizStart: string[];
  quizComplete: {
    excellent: string[];
    good: string[];
    needsWork: string[];
  };
}

/** アバター画像（状況別） */
export interface CharacterAvatars {
  default: string | null;
  correct: string | null;
  incorrect: string | null;
}

/** 口調パターンID */
export type SpeechPatternId =
  | 'polite'
  | 'oresama'
  | 'ojousama'
  | 'hakase'
  | 'gyaru'
  | 'genki1'
  | 'genki2'
  | 'ojisan';

/** キャラクター */
export interface Character {
  id: string;
  name: string;
  avatars: CharacterAvatars;
  speechPattern: SpeechPatternId;
  dialogs: CharacterDialogs;
  isPreset: boolean;
  createdAt: string;
  updatedAt: string;
}

/** キャラクター設定状態 */
export interface CharacterSettingsState {
  characters: Character[];
  activeCharacterId: string;
}

// ========================================
// クイズ関連
// ========================================

/** 問題ステータス */
export type QuestionStatus = 'correct' | 'incorrect' | 'unanswered';

/** 問題一覧アイテム（APIレスポンス） */
export interface QuestionListItem {
  id: string;
  category: CategoryId;
  categoryName: string;
  subcategory: string;
  question: string;
  difficulty: Difficulty;
  status: QuestionStatus;
  attempts: number;
  correctCount: number;
}

/** クイズモード */
export type QuizMode = 'normal' | 'weak' | 'single';

/** クイズオプション */
export interface QuizOptions {
  count: number;
  shuffle: boolean;
  timer: number | null;
}

/** プレゼンターモード（後方互換性用） */
export type PresenterMode = 'normal' | 'vegeta';

/** クイズスコア */
export interface QuizScore {
  correct: number;
  total: number;
}

// ========================================
// UI関連
// ========================================

/** ビュー名 */
export type ViewName =
  | 'menu'
  | 'quiz'
  | 'quiz-weak'
  | 'quiz-single'
  | 'progress'
  | 'history'
  | 'glossary'
  | 'question-list';

/** ダイアログタブ（CharacterSettings用） */
export type DialogTabId = DialogType;

/** 編集中のダイアログ状態 */
export interface EditingDialogState {
  index: number | null;
  text: string;
  category: ScoreCategory | null;
}

/** PresenterDialog の type */
export type PresenterDialogType = 'intro' | 'correct' | 'incorrect' | 'complete';

/** アバタータイプ */
export type AvatarType = 'default' | 'correct' | 'incorrect';
