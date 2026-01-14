# TypeScript 移行計画

## 概要

このドキュメントは、基本情報技術者試験学習システムをJavaScriptからTypeScriptに移行するための計画書です。

---

## 目次

1. [移行の目的](#移行の目的)
2. [現状分析](#現状分析)
3. [型定義設計](#型定義設計)
4. [移行フェーズ](#移行フェーズ)
5. [ファイル別移行詳細](#ファイル別移行詳細)
6. [テスト戦略](#テスト戦略)
7. [リスクと対策](#リスクと対策)

---

## 移行の目的

### メリット

1. **型安全性の向上**
   - コンパイル時にバグを検出
   - nullやundefinedの安全な扱い
   - プロパティアクセスエラーの防止

2. **開発効率の向上**
   - IDEの補完・リファクタリング支援
   - ドキュメントとしての型定義
   - チーム開発時の意図伝達

3. **保守性の向上**
   - リファクタリング時の安全性
   - 依存関係の明確化
   - バグの早期発見

### 今回の移行で解決できた可能性のあるバグ例

```typescript
// 修正前: editingDialogIndexだけでは不十分だった
const [editingDialogIndex, setEditingDialogIndex] = useState<number | null>(null);

// 修正後: 型を明確に定義することで漏れを防げた可能性
interface EditingState {
  index: number | null;
  category: 'excellent' | 'good' | 'needsWork' | null;
}
const [editingState, setEditingState] = useState<EditingState>({ index: null, category: null });
```

---

## 現状分析

### ファイル構成（18ファイル）

| カテゴリ | ファイル | 行数(概算) | 複雑度 | 優先度 |
|---------|---------|-----------|--------|-------|
| **エントリ** | main.jsx | ~10 | 低 | Phase 1 |
| **API** | api.js | ~80 | 低 | Phase 1 |
| **設定** | config/presenters.js | ~50 | 低 | Phase 1 |
| **設定** | config/speechPatterns.js | ~200 | 中 | Phase 1 |
| **Hook** | hooks/useTheme.js | ~30 | 低 | Phase 1 |
| **Hook** | hooks/useQuizOptions.js | ~30 | 低 | Phase 1 |
| **Hook** | hooks/usePresenterMode.js | ~40 | 低 | Phase 1 |
| **Hook** | hooks/useCharacterSettings.js | ~370 | 高 | Phase 2 |
| **コンポーネント** | components/PresenterDialog.jsx | ~50 | 低 | Phase 2 |
| **コンポーネント** | components/ImageUploader.jsx | ~100 | 中 | Phase 2 |
| **コンポーネント** | components/ImageCropper.jsx | ~200 | 中 | Phase 2 |
| **コンポーネント** | components/Progress.jsx | ~150 | 中 | Phase 2 |
| **コンポーネント** | components/History.jsx | ~100 | 中 | Phase 2 |
| **コンポーネント** | components/Glossary.jsx | ~200 | 中 | Phase 2 |
| **コンポーネント** | components/QuestionList.jsx | ~150 | 中 | Phase 2 |
| **コンポーネント** | components/CharacterSettings.jsx | ~550 | 高 | Phase 3 |
| **コンポーネント** | components/Quiz.jsx | ~380 | 高 | Phase 3 |
| **メイン** | App.jsx | ~340 | 高 | Phase 3 |

### 依存関係

```
App.jsx
├── api.js
├── hooks/useCharacterSettings.js
│   └── config/speechPatterns.js
├── hooks/useTheme.js
├── hooks/useQuizOptions.js
└── components/
    ├── Quiz.jsx
    │   └── PresenterDialog.jsx
    ├── Progress.jsx
    ├── History.jsx
    ├── Glossary.jsx
    │   └── PresenterDialog.jsx
    ├── QuestionList.jsx
    └── CharacterSettings.jsx
        ├── ImageUploader.jsx
        │   └── ImageCropper.jsx
        └── config/speechPatterns.js
```

---

## 型定義設計

### Phase 0: 型定義ファイルの作成

`frontend/src/types/` ディレクトリを作成し、共通の型定義を配置。

#### `types/index.ts` - 共通型定義

```typescript
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
  choices: [string, string, string, string]; // 4択固定
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

/** 学習進捗 */
export interface Progress {
  totalAttempts: number;
  correctAttempts: number;
  overallCorrectRate: number;
  weakQuestionsCount: number;
  categoryProgress: CategoryProgress[];
}

export interface CategoryProgress {
  category: CategoryId;
  categoryName: string;
  attempts: number;
  correct: number;
  rate: number;
}

/** 履歴エントリ */
export interface HistoryEntry {
  questionId: string;
  question: string;
  isCorrect: boolean;
  timestamp: string;
  categoryName: string;
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
  | 'casual'
  | 'oresama'
  | 'ojousama'
  | 'samurai'
  | 'robot'
  | 'child'
  | 'sensei';

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

/** クイズ画面の状態 */
export interface QuizState {
  questions: ShuffledQuestion[];
  currentIndex: number;
  selectedAnswer: number | null;
  result: AnswerResult | null;
  score: {
    correct: number;
    total: number;
  };
  loading: boolean;
  finished: boolean;
  expandedTerms: Record<string, boolean>;
  introDialog: string;
  resultDialog: string;
  timeLeft: number | null;
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
export type DialogTabId = DialogType | 'quizComplete';

/** 編集中のダイアログ状態 */
export interface EditingDialogState {
  index: number | null;
  text: string;
  category: ScoreCategory | null;
}
```

#### `types/api.ts` - API型定義

```typescript
import type {
  Category,
  Question,
  GlossaryTerm,
  AnswerResult,
  Progress,
  HistoryEntry,
  CategoryId,
  Difficulty
} from './index';

// API レスポンス型
export type CategoriesResponse = Category[];
export type QuestionsResponse = Question[];
export type QuestionResponse = Question | null;
export type GlossaryResponse = GlossaryTerm[];
export type GlossaryTermResponse = GlossaryTerm | null;
export type AnswerResponse = AnswerResult;
export type ProgressResponse = Progress;
export type HistoryResponse = HistoryEntry[];
export type ResetResponse = { success: boolean };

// API パラメータ型
export interface FetchQuestionsParams {
  category?: CategoryId;
  count?: number;
}

export interface FetchGlossaryParams {
  category?: CategoryId;
  search?: string;
}

export interface FetchQuestionsListParams {
  category?: CategoryId;
  difficulty?: Difficulty;
  search?: string;
}

export interface SubmitAnswerParams {
  questionId: string;
  selectedAnswer: number;
}
```

---

## 移行フェーズ

### Phase 0: 環境構築（準備）

#### 0-1. TypeScript & 関連パッケージのインストール

```bash
cd frontend
npm install -D typescript @types/react @types/react-dom
```

#### 0-2. tsconfig.json の作成

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/types": ["src/types/index"],
      "@/components/*": ["src/components/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/config/*": ["src/config/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### 0-3. 型定義ファイルの作成

```
frontend/src/types/
├── index.ts      # 共通型定義
└── api.ts        # API関連型定義
```

---

### Phase 1: 基盤レイヤー（依存なし・低複雑度）

変換順序: 依存関係の末端から開始

#### 1-1. api.ts

```typescript
// frontend/src/api.ts
import type {
  CategoriesResponse,
  QuestionsResponse,
  QuestionResponse,
  // ...
} from './types/api';

const API_BASE = 'http://localhost:3001/api';

export async function fetchCategories(): Promise<CategoriesResponse> {
  const res = await fetch(`${API_BASE}/categories`);
  return res.json();
}

// ... 他の関数も同様に型付け
```

#### 1-2. config/speechPatterns.ts

```typescript
// frontend/src/config/speechPatterns.ts
import type { SpeechPatternId } from '../types';

export interface SpeechPattern {
  id: SpeechPatternId;
  name: string;
  description: string;
  transforms: Array<{
    pattern: RegExp;
    replacement: string;
  }>;
}

export const SPEECH_PATTERNS: Record<SpeechPatternId, SpeechPattern> = {
  polite: { /* ... */ },
  // ...
};
```

#### 1-3. config/presenters.ts

```typescript
// 既存コードの型付け
```

#### 1-4. hooks/useTheme.ts

```typescript
// frontend/src/hooks/useTheme.ts
interface UseThemeReturn {
  isDark: boolean;
  toggleTheme: () => void;
}

export function useTheme(): UseThemeReturn {
  // ...
}
```

#### 1-5. hooks/useQuizOptions.ts

```typescript
// frontend/src/hooks/useQuizOptions.ts
import type { QuizOptions } from '../types';

interface UseQuizOptionsReturn {
  options: QuizOptions;
  updateOption: <K extends keyof QuizOptions>(key: K, value: QuizOptions[K]) => void;
  resetOptions: () => void;
}

export function useQuizOptions(): UseQuizOptionsReturn {
  // ...
}
```

#### 1-6. main.tsx

```typescript
// frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### Phase 2: 中間レイヤー（中程度の依存・中複雑度）

#### 2-1. hooks/useCharacterSettings.ts

最も複雑なhook。段階的に型を追加。

```typescript
// frontend/src/hooks/useCharacterSettings.ts
import type {
  Character,
  CharacterSettingsState,
  CharacterDialogs,
  CharacterAvatars,
  DialogType,
  ScoreCategory
} from '../types';

interface UseCharacterSettingsReturn {
  // 状態
  characters: Character[];
  activeCharacter: Character;
  activeCharacterId: string;

  // アクション
  setActiveCharacter: (id: string) => void;
  addCharacter: (character: Partial<Character>) => string;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  resetToDefault: (id: string) => void;

  // ヘルパー
  getRandomDialog: (type: DialogType, scorePercentage?: number) => string;
  transformExplanation: (text: string) => string;

  // バリデーション
  validateName: (name: string) => string | null;
  validateDialog: (dialog: string) => string | null;
  VALIDATION: typeof VALIDATION;
}
```

#### 2-2. components/PresenterDialog.tsx

```typescript
// frontend/src/components/PresenterDialog.tsx
import type { Character, PresenterMode } from '../types';

interface PresenterDialogProps {
  message: string;
  presenter: PresenterMode;
  type: 'intro' | 'correct' | 'incorrect' | 'complete';
  activeCharacter?: Character;
}

function PresenterDialog({
  message,
  presenter,
  type,
  activeCharacter
}: PresenterDialogProps): JSX.Element | null {
  // ...
}

export default PresenterDialog;
```

#### 2-3. components/ImageCropper.tsx

```typescript
interface ImageCropperProps {
  imageUrl: string;
  onCrop: (croppedBase64: string) => void;
  onCancel: () => void;
}
```

#### 2-4. components/ImageUploader.tsx

```typescript
interface ImageUploaderProps {
  currentImage: string | null;
  onImageChange: (base64: string) => void;
  onImageRemove: () => void;
}
```

#### 2-5. components/Progress.tsx, History.tsx, Glossary.tsx, QuestionList.tsx

各コンポーネントのProps型を定義して移行。

---

### Phase 3: アプリケーションレイヤー（高依存・高複雑度）

#### 3-1. components/CharacterSettings.tsx

```typescript
interface CharacterSettingsProps {
  characters: Character[];
  activeCharacter: Character;
  onClose: () => void;
  onSave: (character: Character) => void;
  onAddCharacter: (character: Partial<Character>) => string;
  onDeleteCharacter: (id: string) => void;
  onResetToDefault: (id: string) => void;
  validateName: (name: string) => string | null;
  validateDialog: (dialog: string) => string | null;
}

// 内部状態の型
interface CharacterSettingsState {
  editingCharacter: Character | null;
  selectedCharacterId: string;
  activeDialogTab: DialogTabId;
  errors: Record<string, string | null>;
  editingDialog: EditingDialogState;
}
```

#### 3-2. components/Quiz.tsx

```typescript
interface QuizProps {
  mode: QuizMode;
  category?: CategoryId | null;
  questionId?: string | null;
  options: QuizOptions;
  onComplete: () => void;
  onBackToList?: () => void;
  presenterMode: PresenterMode;
  activeCharacter: Character;
  getRandomDialog: (type: DialogType, score?: number) => string;
  transformExplanation: (text: string) => string;
}
```

#### 3-3. App.tsx

```typescript
// メインコンポーネント
function App(): JSX.Element {
  const [view, setView] = useState<ViewName>('menu');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  // ...
}
```

---

## ファイル別移行詳細

### チェックリスト

| Phase | ファイル | 状態 | 備考 |
|-------|---------|------|------|
| 0 | tsconfig.json | [ ] | |
| 0 | types/index.ts | [ ] | |
| 0 | types/api.ts | [ ] | |
| 1 | api.ts | [ ] | |
| 1 | config/speechPatterns.ts | [ ] | |
| 1 | config/presenters.ts | [ ] | |
| 1 | hooks/useTheme.ts | [ ] | |
| 1 | hooks/useQuizOptions.ts | [ ] | |
| 1 | hooks/usePresenterMode.ts | [ ] | 削除候補（useCharacterSettingsに統合済み） |
| 1 | main.tsx | [ ] | |
| 2 | hooks/useCharacterSettings.ts | [ ] | |
| 2 | components/PresenterDialog.tsx | [ ] | |
| 2 | components/ImageCropper.tsx | [ ] | |
| 2 | components/ImageUploader.tsx | [ ] | |
| 2 | components/Progress.tsx | [ ] | |
| 2 | components/History.tsx | [ ] | |
| 2 | components/Glossary.tsx | [ ] | |
| 2 | components/QuestionList.tsx | [ ] | |
| 3 | components/CharacterSettings.tsx | [ ] | |
| 3 | components/Quiz.tsx | [ ] | |
| 3 | App.tsx | [ ] | |

---

## テスト戦略

### TypeScript移行後に追加すべきテスト

#### 1. 型テスト（型の整合性確認）

```typescript
// types/__tests__/types.test.ts
import type { Question, Character } from '../index';

// 型の互換性テスト
const validQuestion: Question = {
  id: 'test_001',
  category: 'technology',
  // ...
};
```

#### 2. ユニットテスト（Vitest推奨）

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

優先度の高いテスト対象:
- `useCharacterSettings` - 状態管理ロジック
- `speechPatterns` - 口調変換ロジック
- `api` - APIレスポンスのパース

#### 3. コンポーネントテスト

```typescript
// components/__tests__/Quiz.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Quiz from '../Quiz';

describe('Quiz', () => {
  it('シャッフル時に正解位置が正しく表示される', () => {
    // ...
  });
});
```

---

## リスクと対策

### リスク1: 移行中の機能破壊

**対策:**
- Phase毎にコミット
- 各Phase完了後に手動テスト
- `.jsx`と`.tsx`の共存期間を最小化

### リスク2: any型の乱用

**対策:**
- `strict: true` を維持
- `// @ts-ignore` は原則禁止
- やむを得ない場合は `// TODO: 型定義追加` コメント

### リスク3: 過剰な型定義

**対策:**
- 推論可能な箇所は型注釈を省略
- ジェネリクスは必要最小限
- ユーティリティ型の活用

---

## 移行コマンド（参考）

```bash
# Phase 0: 環境構築
cd frontend
npm install -D typescript @types/react @types/react-dom
npx tsc --init

# ファイル名変更（例: api.js → api.ts）
mv src/api.js src/api.ts

# 型チェック
npx tsc --noEmit

# Viteでの開発確認
npm run dev
```

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-15 | 初版作成 |
