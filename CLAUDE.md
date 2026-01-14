# 基本情報技術者試験 学習システム

## プロジェクト概要
基本情報技術者試験の学習用Webアプリケーション。クイズ形式で問題を出題し、学習進捗を管理する。

---

## 過去問・データ管理

### 問題データ状況
- **総問題数**: 35問
- **オリジナル問題**: 15問
- **過去問から追加**: 20問

### 過去問 取り込み状況

| 年度 | 試験 | PDFファイル | 問題数 | questions.json | glossary.json | 備考 |
|------|------|-------------|--------|----------------|---------------|------|
| 令和7年度 | 科目A公開問題 | `past_exams/2025r07_fe_kamoku_a_*.pdf` | 20問 | **追加済み** (r07_001〜r07_020) | **追加済み** (26語) | 2025/01/14追加 |

### 未取り込みの過去問（今後の予定）

IPAの公式サイトから以下の過去問を取り込み予定:
- [ ] 令和6年度 科目A サンプル問題
- [ ] 令和5年度 科目A サンプル問題
- [ ] 科目B（アルゴリズム・プログラミング）

---

## 過去問取り込み手順

### 概要
IPAの公式過去問PDFから問題・用語を抽出し、アプリに追加する手順。

### ステップ1: PDFの準備

1. **IPAから過去問PDFをダウンロード**
   - [IPA 過去問題](https://www.ipa.go.jp/shiken/mondai-kaiotu/index.html)
   - 問題PDF（`*_qs.pdf`）と解答PDF（`*_ans.pdf`）を取得

2. **PDFを `past_exams/` フォルダに保存**
   ```
   past_exams/
   └── 2025r07_fe_kamoku_a_qs.pdf   # 問題
   └── 2025r07_fe_kamoku_a_ans.pdf  # 解答
   ```

### ステップ2: 問題の取り込み

1. **PDFをClaudeに読ませる**
   ```
   past_exams/2025r07_fe_kamoku_a_qs.pdf を読んで
   past_exams/2025r07_fe_kamoku_a_ans.pdf を読んで
   ```

2. **問題をJSONに変換**
   - Claudeに依頼: `この問題をquestions.jsonの形式に変換して`
   - ID命名規則: `r07_001`, `r07_002` ...（年度_連番）

3. **data/questions.json に追加**
   - 新しい問題をquestionsの配列に追加
   - 必要に応じてcategoriesにサブカテゴリ追加

**問題のJSON形式:**
```json
{
  "id": "r07_001",
  "category": "technology",
  "categoryName": "テクノロジ系",
  "subcategory": "基礎理論",
  "question": "問題文...",
  "choices": ["ア選択肢", "イ選択肢", "ウ選択肢", "エ選択肢"],
  "correctAnswer": 0,
  "explanation": "解説文...",
  "relatedTerms": []
}
```

### ステップ3: 用語集の追加

1. **過去問から新規用語を抽出**
   ```
   この過去問に出てくる用語でglossary.jsonに追加すべきものをリストアップして
   ```

2. **用語をJSONに変換**
   ```
   これらの用語をglossary.jsonの形式で追加して。覚えやすいtipsも考えて
   ```

3. **data/glossary.json に追加**

**用語のJSON形式:**
```json
{
  "id": "fine_tuning",
  "term": "ファインチューニング",
  "fullName": "Fine-tuning",
  "meaning": "事前学習済みモデルを特定タスク向けに追加学習すること",
  "category": "technology",
  "subcategory": "基礎理論",
  "description": "詳細説明...",
  "examples": ["例1", "例2"],
  "relatedTerms": ["関連用語ID"],
  "tips": "覚え方のコツ"
}
```

### ステップ4: relatedTermsの紐づけ

1. **各問題に関連用語を紐づけ**
   ```
   r07_001〜r07_020の問題にrelatedTermsを紐づけて
   ```

2. **対応表を確認**
   ```bash
   node -e "
   const data = require('./data/questions.json');
   data.questions.filter(q => q.id.startsWith('r07_')).forEach(q => {
     console.log(q.id + ': ' + (q.relatedTerms.length > 0 ? q.relatedTerms.join(', ') : '(なし)'));
   });
   "
   ```

### ステップ5: 動作確認

1. **データ検証**
   ```bash
   # 問題数の確認
   node -e "console.log(require('./data/questions.json').questions.length)"

   # 用語数の確認
   node -e "console.log(require('./data/glossary.json').terms.length)"
   ```

2. **APIテスト**
   ```bash
   cd backend && node server.js &
   curl http://localhost:3001/api/questions/random?count=5
   curl http://localhost:3001/api/glossary
   ```

3. **フロントエンドで実際に問題を解く**
   ```bash
   cd frontend && npm run dev
   # ブラウザで http://localhost:5173 を開いて確認
   ```

### ステップ6: CLAUDE.mdの更新

1. **取り込み状況テーブルを更新**
   - 「過去問 取り込み状況」テーブルに行追加
   - 問題数、用語数、日付を記録

2. **用語追加状況テーブルを更新**
   - 追加した用語数を記録

3. **追加した用語の一覧を更新**
   - カテゴリ別に追加した用語をリストアップ

---

### チェックリスト

過去問取り込み時の確認項目:

- [ ] PDFを `past_exams/` に保存した
- [ ] 問題を `data/questions.json` に追加した
- [ ] 新しいサブカテゴリがあればcategoriesに追加した
- [ ] 用語を `data/glossary.json` に追加した
- [ ] 各問題にrelatedTermsを紐づけた
- [ ] APIで問題・用語が取得できることを確認した
- [ ] フロントエンドで正常に表示されることを確認した
- [ ] CLAUDE.mdの取り込み状況テーブルを更新した

### 用語集 追加状況

**総用語数: 40語**

| ソース | 追加済み用語数 | 備考 |
|--------|---------------|------|
| オリジナル | 14語 | FIFO, LIFO, スタック, キュー, Hz, bps等 |
| 令和7年度過去問 | 26語 | 2025/01/14追加 |

### 令和7年度から追加した用語一覧

- **基礎理論**: ファインチューニング、丸め誤差、桁落ち、情報落ち
- **アルゴリズム**: 2分探索木
- **コンピュータシステム**: MTBF、MTTR、稼働率
- **ソフトウェア**: ローコード開発、ノーコード開発、ポリモーフィズム
- **セキュリティ**: WAF、SIEM、UTM、暗号の危殆化
- **データベース**: E-Rモデル、エンティティ、アトリビュート
- **プロジェクトマネジメント**: スクラム、プロダクトオーナ、スクラムマスタ、クリティカルパス
- **経営戦略**: マーケットバスケット分析、ロングテール
- **法務**: オプトアウト
- **企業活動**: カーボンフットプリント

---

## 技術スタック

### フロントエンド (`/frontend`)
- **フレームワーク**: React 19 + Vite
- **言語**: JavaScript (JSX)
- **スタイル**: CSS (App.css)
- **起動**: `cd frontend && npm run dev`
- **ポート**: 5173

### バックエンド (`/backend`)
- **フレームワーク**: Express.js
- **言語**: Node.js
- **起動**: `cd backend && node server.js`
- **ポート**: 3001

### データ (`/data`)
- `questions.json` - 問題データベース
- `glossary.json` - 用語集
- `user_progress.json` - ユーザー進捗データ

## ディレクトリ構造

```
fe-exam-study/
├── CLAUDE.md                    # プロジェクト説明（このファイル）
├── frontend/
│   └── src/
│       ├── App.jsx              # メインアプリ・ルーター
│       ├── App.css              # 全スタイル
│       ├── api.js               # API通信レイヤー
│       ├── main.jsx             # Reactエントリーポイント
│       ├── config/
│       │   └── presenters.js    # 出題者キャラクター設定・口調変換
│       ├── hooks/
│       │   └── usePresenterMode.js  # プレゼンターモード管理（localStorage永続化）
│       └── components/
│           ├── Quiz.jsx         # クイズ画面（プレゼンターモード対応）
│           ├── Progress.jsx     # 学習進捗画面
│           ├── History.jsx      # 履歴画面
│           ├── Glossary.jsx     # 用語集画面（プレゼンターモード対応）
│           └── PresenterDialog.jsx  # セリフ表示コンポーネント
├── backend/
│   └── server.js                # Express APIサーバー
└── data/
    ├── questions.json
    ├── glossary.json
    └── user_progress.json
```

## 主要機能

### クイズモード
- **通常モード**: ランダム5問出題
- **苦手問題モード**: 過去に間違えた問題を復習
- **カテゴリ別**: テクノロジ/マネジメント/ストラテジ

### プレゼンター（出題者）モード
メインメニューのトグルボタンで切り替え可能。設定はlocalStorageに保存。

#### ノーマルモード
- 丁寧な口調で出題・解説

#### ベジータモード
- ベジータ風の口調で出題・解説
- **適用範囲**: クイズ画面、用語集画面
- **セリフ表示**: 問題出題時、正解/不正解時、結果発表時
- **口調変換ルール**:
  - 丁寧語: `です→だ`、`ます→る`
  - 意志形→命令形: `覚えよう→覚えろ`、`しよう→しろ`
  - 文末: `。→だ!/ぞ!` など
- **専用UIテーマ**: 紫/金のサイヤ人カラー（クイズ画面のみ）

### 用語集
- カテゴリフィルタ・検索対応
- スクロール表示（多数の用語に対応）
- プレゼンターモードで口調変換適用（説明・具体例・覚え方）

### その他機能
- 学習進捗トラッキング
- 回答履歴

## API エンドポイント

| エンドポイント | メソッド | 説明 |
|---------------|---------|------|
| `/api/categories` | GET | カテゴリ一覧取得 |
| `/api/questions/random` | GET | ランダム問題取得 |
| `/api/questions/weak` | GET | 苦手問題取得 |
| `/api/answer` | POST | 回答送信・採点 |
| `/api/progress` | GET | 学習進捗取得 |
| `/api/progress/reset` | POST | 進捗リセット |
| `/api/history` | GET | 回答履歴取得 |
| `/api/glossary` | GET | 用語集取得 |

## 開発時の注意

### スタイル変更
- 全スタイルは `frontend/src/App.css` に集約
- ベジータモード用スタイルは `.vegeta-mode` や `.vegeta` クラスで管理
- 用語集画面は `.app-glossary` クラスでスクロール制御

### プレゼンター追加
- `frontend/src/config/presenters.js` の `PRESENTERS` オブジェクトに新キャラクターを追加
- `dialogs` でセリフ定義、`transformExplanation` で口調変換関数を定義
- 口調変換は正規表現で実装（意志形→命令形、丁寧語→常体など）

### 問題追加
- `data/questions.json` に問題を追加
- カテゴリ: `technology`, `management`, `strategy`

#### 問題データ形式
```json
{
  "id": "tech_xxx",
  "category": "technology",
  "categoryName": "テクノロジ系",
  "subcategory": "サブカテゴリ名",
  "question": "問題文",
  "choices": ["ア", "イ", "ウ", "エ"],
  "correctAnswer": 0,
  "explanation": "解説文",
  "relatedTerms": ["関連用語ID"]
}
```

#### 問題追加ワークフロー（推奨）

**ステップ1: 公式過去問の取り込み**
1. IPAの公式サイトから過去問PDFをダウンロード
2. PDFから問題を抽出（Claudeに読ませる or 手動）
3. 上記JSON形式に整形

**ステップ2: 類似問題の生成（オプション）**
取り込んだ過去問を元に、Claudeが以下を生成：
- 数値を変えたバリエーション
- 同じ概念の別角度からの出題
- 選択肢のパターン違い

**Claudeへの依頼例:**
```
以下の過去問を元に、questions.jsonの形式で類似問題を3問生成して：
[過去問のテキストを貼り付け]
```

### 用語集追加
- `data/glossary.json` に用語を追加

#### 用語データ形式
```json
{
  "id": "term_id",
  "term": "用語名",
  "fullName": "正式名称（英語など）",
  "meaning": "短い意味（1行）",
  "category": "technology",
  "subcategory": "サブカテゴリ名",
  "description": "詳細な説明文",
  "examples": ["具体例1", "具体例2", "具体例3"],
  "relatedTerms": ["関連用語1", "関連用語2"],
  "tips": "覚え方のコツ"
}
```

#### 用語追加ワークフロー（推奨）

**Claudeへの依頼例:**
```
以下の用語をglossary.jsonの形式で追加して。覚えやすいtipsも考えて：
- CPU
- RAM
- ROM
```

---

## 現在のアーキテクチャ課題

### 良い点
- **API設計**: `fetchRandomQuestions(category, count)` - 既にcount対応済み
- **Hook分離**: `usePresenterMode` のパターンは再利用可能
- **Props設計**: presenterModeがQuiz/Glossaryに渡せる構造

### 改善が必要な点
- **Quiz.jsx**: stateが10個以上で肥大化。将来の機能追加で破綻リスク
- **startQuiz関数**: `(category, mode)` の2引数のみ。オプション追加のたびに引数増加
- **設定の分散**: 問題数(5)がQuiz.jsx内にハードコード（37行目）

---

## 実装予定機能

### 実装優先度

| Phase | 機能 | 優先度 | 実装難易度 | 拡張性影響 |
|-------|------|--------|-----------|-----------|
| 1 | クイズオプション基盤 + 問題数選択 | **最優先** | 簡単 | 低（将来の土台） |
| 1 | 選択肢シャッフル | **最優先** | 簡単 | 低 |
| 2 | タイマー機能 | 高 | 中 | 中 |
| 3 | 他キャラクターモード | 中 | 簡単 | 低 |
| 3 | 難易度表示 | 中 | 中 | 中（データ整備必要） |
| 4 | ダークモード | 低 | 高 | 高（CSS変数化が前提） |
| 4 | グラフ表示 | 低 | 高 | 高（外部依存追加） |

---

### Phase 1: 基盤整備（最優先）

#### クイズオプション基盤の導入

**目的**: 将来の機能追加を容易にするため、クイズ設定をオブジェクトで管理

**推奨設計:**
```javascript
// App.jsx
const [quizOptions, setQuizOptions] = useState({
  count: 5,        // 問題数
  shuffle: false,  // 選択肢シャッフル
  timer: null      // 制限時間（秒）、nullは無制限
});

// startQuiz関数を拡張
startQuiz(category, mode, quizOptions);

// Quiz.jsx
function Quiz({ mode, category, options, onComplete, presenterMode }) {
  const { count, shuffle, timer } = options;
  // ...
}
```

**変更箇所:**
- `App.jsx`: quizOptions state追加、startQuiz関数拡張、設定UI追加
- `Quiz.jsx`: props変更、loadQuestions()でoptions使用

#### 問題数選択
- 5問/10問/20問/全問から選択可能に
- **API**: 既に `fetchRandomQuestions(category, count)` で対応済み
- **UI**: カテゴリ選択後にモーダル or ボタン群で問題数選択

#### 選択肢シャッフル
- 選択肢の順番をランダム化（丸暗記防止）
- 正解インデックスの追従管理が必要

**実装方法:**
```javascript
// Quiz.jsx loadQuestions内
const shuffledQuestions = data.map(q => {
  if (!options.shuffle) return q;

  const indices = [0, 1, 2, 3];
  const shuffledIndices = shuffleArray(indices);
  return {
    ...q,
    choices: shuffledIndices.map(i => q.choices[i]),
    originalCorrectAnswer: q.correctAnswer,
    // シャッフル後の正解位置を記録
    correctAnswerIndex: shuffledIndices.indexOf(q.correctAnswer)
  };
});
```

---

### Phase 2: 学習効果向上

#### タイマー機能
- 本番試験を意識した時間制限モード
- **モード**: 1問あたり or 全体の制限時間
- **タイムアウト時**: 自動で不正解扱い or 次の問題へスキップ
- **UI**: 残り時間のプログレスバー表示

**実装時の注意:**
- Quiz.jsxのstateがさらに増えるため、useReducerへのリファクタリングを検討
- `options.timer` で制御

---

### Phase 3: コンテンツ拡充

#### 他のキャラクターモード追加
- 悟空モード、フリーザモード、ピッコロモードなど
- `frontend/src/config/presenters.js` の `PRESENTERS` オブジェクトに追加するだけ
- 実装難易度は低いが、セリフ・口調変換の品質確保が課題

#### 問題の難易度表示
- 易/中/難のラベルを問題に表示
- `questions.json` に `difficulty` フィールド追加が必要
- **課題**: 既存35問への難易度付与作業、基準の統一

```json
{
  "id": "r07_001",
  "difficulty": "medium",  // "easy" | "medium" | "hard"
  // ...
}
```

---

### Phase 4: 大規模リファクタ後

#### ダークモード対応
- 目に優しい暗いテーマ
- **前提**: CSS変数化リファクタリングが必要
- **課題**: ベジータモード（紫/金テーマ）との共存設計

**CSS変数化の例:**
```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #333333;
  /* ... */
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
}
```

#### 学習統計のグラフ表示
- 日別・週別の学習推移を可視化
- **ライブラリ候補**: Chart.js, Recharts, Victory
- **課題**: バンドルサイズ増加、データ構造の整理

---

## リファクタリング候補

### Quiz.jsx のstate整理
現在10個以上のstateがあり、肥大化している。useReducerパターンへの移行を検討。

```javascript
// 現状
const [questions, setQuestions] = useState([]);
const [currentIndex, setCurrentIndex] = useState(0);
const [selectedAnswer, setSelectedAnswer] = useState(null);
const [result, setResult] = useState(null);
const [score, setScore] = useState({ correct: 0, total: 0 });
// ... さらに5個以上

// 改善案: useReducer
const [state, dispatch] = useReducer(quizReducer, initialState);
```

### hooks/useQuizOptions.js の新規作成
クイズオプションの管理をカスタムフックに分離し、localStorageへの永続化も実装。

```javascript
export function useQuizOptions() {
  const [options, setOptions] = useState(() => {
    const stored = localStorage.getItem('quizOptions');
    return stored ? JSON.parse(stored) : defaultOptions;
  });

  // 変更時にlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('quizOptions', JSON.stringify(options));
  }, [options]);

  return { options, setOptions, resetOptions };
}
```