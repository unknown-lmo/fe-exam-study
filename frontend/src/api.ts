import type {
  CategoriesResponse,
  QuestionsResponse,
  QuestionListResponse,
  QuestionResponse,
  GlossaryResponse,
  GlossaryTermResponse,
  AnswerResponse,
  ProgressResponse,
  HistoryResponse,
  ResetResponse
} from './types/api';
import type { CategoryId, Difficulty } from './types';
import { API_BASE, DEFAULT_HISTORY_LIMIT } from './constants';

// APIエラーをハンドリングするヘルパー関数
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`API error ${res.status}: ${errorText}`);
  }
  return res.json();
}

export async function fetchCategories(): Promise<CategoriesResponse> {
  const res = await fetch(`${API_BASE}/categories`);
  return handleResponse<CategoriesResponse>(res);
}

export async function fetchQuestions(category: CategoryId | null = null): Promise<QuestionsResponse> {
  const url = category
    ? `${API_BASE}/questions?category=${category}`
    : `${API_BASE}/questions`;
  const res = await fetch(url);
  return handleResponse<QuestionsResponse>(res);
}

export async function fetchRandomQuestions(
  category: CategoryId | null = null,
  count: number = 5
): Promise<QuestionsResponse> {
  const params = new URLSearchParams({ count: count.toString() });
  if (category) params.append('category', category);
  const res = await fetch(`${API_BASE}/questions/random?${params}`);
  return handleResponse<QuestionsResponse>(res);
}

export async function fetchWeakQuestions(): Promise<QuestionsResponse> {
  const res = await fetch(`${API_BASE}/questions/weak`);
  return handleResponse<QuestionsResponse>(res);
}

export async function submitAnswer(
  questionId: string,
  selectedAnswer: number
): Promise<AnswerResponse> {
  const res = await fetch(`${API_BASE}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId, selectedAnswer })
  });
  return handleResponse<AnswerResponse>(res);
}

export async function fetchProgress(): Promise<ProgressResponse> {
  const res = await fetch(`${API_BASE}/progress`);
  return handleResponse<ProgressResponse>(res);
}

export async function fetchHistory(limit: number = DEFAULT_HISTORY_LIMIT): Promise<HistoryResponse> {
  const res = await fetch(`${API_BASE}/history?limit=${limit}`);
  return handleResponse<HistoryResponse>(res);
}

export async function resetProgress(): Promise<ResetResponse> {
  const res = await fetch(`${API_BASE}/progress/reset`, { method: 'POST' });
  return handleResponse<ResetResponse>(res);
}

export async function fetchGlossary(
  category: CategoryId | null = null,
  search: string | null = null
): Promise<GlossaryResponse> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  const query = params.toString();
  const res = await fetch(`${API_BASE}/glossary${query ? '?' + query : ''}`);
  return handleResponse<GlossaryResponse>(res);
}

export async function fetchGlossaryTerm(id: string): Promise<GlossaryTermResponse> {
  const res = await fetch(`${API_BASE}/glossary/${id}`);
  return handleResponse<GlossaryTermResponse>(res);
}

export async function fetchQuestionsList(
  category: CategoryId | null = null,
  difficulty: Difficulty | null = null,
  search: string | null = null
): Promise<QuestionListResponse> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (difficulty) params.append('difficulty', difficulty);
  if (search) params.append('search', search);
  const query = params.toString();
  const res = await fetch(`${API_BASE}/questions/list${query ? '?' + query : ''}`);
  return handleResponse<QuestionListResponse>(res);
}

export async function fetchQuestionById(id: string): Promise<QuestionResponse> {
  const res = await fetch(`${API_BASE}/questions/${id}`);
  return handleResponse<QuestionResponse>(res);
}
