import type { CategoryId, Difficulty } from './types';

// API設定
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

// LocalStorageキー
export const STORAGE_KEYS = {
  CHARACTER_SETTINGS: 'characterSettings',
  QUIZ_OPTIONS: 'quizOptions',
  THEME: 'theme',
  PRESENTER_MODE: 'presenterMode' // レガシー（後方互換性用）
} as const;

// クイズのデフォルト設定
export const DEFAULT_QUIZ_OPTIONS = {
  count: 5,
  shuffle: false,
  timer: null
} as const;

// クイズの問題数選択肢
export const QUIZ_COUNT_OPTIONS = [5, 10, 20] as const;

// タイマー選択肢（秒）
export const TIMER_OPTIONS = [null, 30, 60, 90] as const;

// 履歴取得のデフォルト件数
export const DEFAULT_HISTORY_LIMIT = 20;

// 画像アップローダー設定
export const IMAGE_UPLOAD = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  OUTPUT_SIZE: 200,
  OUTPUT_QUALITY: 0.9
} as const;

// キャラクター名のバリデーション
export const CHARACTER_NAME_LIMITS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 20
} as const;

// セリフのバリデーション
export const DIALOG_LIMITS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 100
} as const;

// カテゴリ名マッピング
export const CATEGORY_NAMES: Record<CategoryId, string> = {
  technology: 'テクノロジ系',
  management: 'マネジメント系',
  strategy: 'ストラテジ系'
} as const;

// 難易度ラベル
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '易',
  medium: '中',
  hard: '難'
} as const;
