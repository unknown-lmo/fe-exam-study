import type {
  Category,
  Question,
  QuestionListItem,
  GlossaryTerm,
  AnswerResult,
  Progress,
  HistoryEntry,
  CategoryId,
  Difficulty
} from './index';

// ========================================
// API レスポンス型
// ========================================

export type CategoriesResponse = Category[];
export type QuestionsResponse = Question[];
export type QuestionListResponse = QuestionListItem[];
export type QuestionResponse = Question | null;
export type GlossaryResponse = GlossaryTerm[];
export type GlossaryTermResponse = GlossaryTerm | null;
export type AnswerResponse = AnswerResult;
export type ProgressResponse = Progress;
export type HistoryResponse = HistoryEntry[];
export type ResetResponse = { success: boolean };

// ========================================
// API パラメータ型
// ========================================

export interface FetchQuestionsParams {
  category?: CategoryId | null;
  count?: number;
}

export interface FetchGlossaryParams {
  category?: CategoryId | null;
  search?: string | null;
}

export interface FetchQuestionsListParams {
  category?: CategoryId | null;
  difficulty?: Difficulty | null;
  search?: string | null;
}

export interface SubmitAnswerParams {
  questionId: string;
  selectedAnswer: number;
}
