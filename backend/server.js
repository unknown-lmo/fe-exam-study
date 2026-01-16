const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// データファイルのパス
const DATA_DIR = path.join(__dirname, '..', 'data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const PROGRESS_FILE = path.join(DATA_DIR, 'user_progress.json');
const GLOSSARY_FILE = path.join(DATA_DIR, 'glossary.json');

// データ読み込みヘルパー
function loadQuestions() {
  const data = fs.readFileSync(QUESTIONS_FILE, 'utf8');
  return JSON.parse(data);
}

function loadProgress() {
  const data = fs.readFileSync(PROGRESS_FILE, 'utf8');
  return JSON.parse(data);
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf8');
}

function loadGlossary() {
  const data = fs.readFileSync(GLOSSARY_FILE, 'utf8');
  return JSON.parse(data);
}

// ============================================
// API エンドポイント
// ============================================

// カテゴリ一覧取得
app.get('/api/categories', (req, res) => {
  try {
    const data = loadQuestions();
    res.json(data.categories);
  } catch (error) {
    res.status(500).json({ error: 'カテゴリの取得に失敗しました' });
  }
});

// 問題一覧取得（カテゴリ・難易度でフィルタ可能）
app.get('/api/questions', (req, res) => {
  try {
    const { category, subcategory, difficulty } = req.query;
    const data = loadQuestions();
    let questions = data.questions;

    if (category) {
      questions = questions.filter(q => q.category === category);
    }
    if (subcategory) {
      questions = questions.filter(q => q.subcategory === subcategory);
    }
    if (difficulty) {
      questions = questions.filter(q => q.difficulty === difficulty);
    }

    // 正解を含まない形で返す
    const questionsWithoutAnswer = questions.map(({ correctAnswer, explanation, ...rest }) => rest);
    res.json(questionsWithoutAnswer);
  } catch (error) {
    res.status(500).json({ error: '問題の取得に失敗しました' });
  }
});

// 問題一覧取得（回答履歴付き）
app.get('/api/questions/list', (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    const data = loadQuestions();
    const progress = loadProgress();
    let questions = data.questions;

    // フィルタリング
    if (category) {
      questions = questions.filter(q => q.category === category);
    }
    if (difficulty) {
      questions = questions.filter(q => q.difficulty === difficulty);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      questions = questions.filter(q =>
        q.question.toLowerCase().includes(searchLower) ||
        q.subcategory.toLowerCase().includes(searchLower)
      );
    }

    // 回答履歴を含めて返す
    const questionsWithStatus = questions.map(q => {
      const stats = progress.questionStats[q.id];
      let status = 'unanswered'; // 未回答
      if (stats && stats.attempts > 0) {
        const correctRate = stats.correctCount / stats.attempts;
        status = correctRate >= 0.5 ? 'correct' : 'incorrect';
      }
      return {
        id: q.id,
        category: q.category,
        categoryName: q.categoryName,
        subcategory: q.subcategory,
        question: q.question,
        difficulty: q.difficulty,
        status,
        attempts: stats ? stats.attempts : 0,
        correctCount: stats ? stats.correctCount : 0
      };
    });

    res.json(questionsWithStatus);
  } catch (error) {
    res.status(500).json({ error: '問題一覧の取得に失敗しました' });
  }
});

// ランダムに問題取得
app.get('/api/questions/random', (req, res) => {
  try {
    const { category, count = 5 } = req.query;
    const data = loadQuestions();
    let questions = data.questions;

    if (category) {
      questions = questions.filter(q => q.category === category);
    }

    // シャッフルして指定数取得
    const shuffled = questions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, parseInt(count));

    // 正解を含まない形で返す
    const questionsWithoutAnswer = selected.map(({ correctAnswer, explanation, ...rest }) => rest);
    res.json(questionsWithoutAnswer);
  } catch (error) {
    res.status(500).json({ error: '問題の取得に失敗しました' });
  }
});

// 苦手問題取得
app.get('/api/questions/weak', (req, res) => {
  try {
    const progress = loadProgress();
    const data = loadQuestions();

    // 苦手問題IDリストから問題を取得
    const weakQuestionIds = progress.weakQuestions || [];
    const weakQuestions = data.questions.filter(q => weakQuestionIds.includes(q.id));

    // 正解を含まない形で返す
    const questionsWithoutAnswer = weakQuestions.map(({ correctAnswer, explanation, ...rest }) => rest);
    res.json(questionsWithoutAnswer);
  } catch (error) {
    res.status(500).json({ error: '苦手問題の取得に失敗しました' });
  }
});

// 問題詳細取得
app.get('/api/questions/:id', (req, res) => {
  try {
    const data = loadQuestions();
    const question = data.questions.find(q => q.id === req.params.id);

    if (!question) {
      return res.status(404).json({ error: '問題が見つかりません' });
    }

    // 正解を含まない形で返す
    const { correctAnswer, explanation, ...questionWithoutAnswer } = question;
    res.json(questionWithoutAnswer);
  } catch (error) {
    res.status(500).json({ error: '問題の取得に失敗しました' });
  }
});

// 回答送信
app.post('/api/answer', (req, res) => {
  try {
    const { questionId, selectedAnswer } = req.body;
    const data = loadQuestions();
    const progress = loadProgress();

    const question = data.questions.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({ error: '問題が見つかりません' });
    }

    const isCorrect = question.correctAnswer === selectedAnswer;

    // 問題ごとの統計を更新
    if (!progress.questionStats[questionId]) {
      progress.questionStats[questionId] = {
        attempts: 0,
        correctCount: 0,
        lastAttemptAt: null
      };
    }
    progress.questionStats[questionId].attempts++;
    if (isCorrect) {
      progress.questionStats[questionId].correctCount++;
    }
    progress.questionStats[questionId].lastAttemptAt = new Date().toISOString();

    // カテゴリごとの統計を更新
    const category = question.category;
    if (progress.categoryStats[category]) {
      progress.categoryStats[category].totalAttempts++;
      if (isCorrect) {
        progress.categoryStats[category].correctCount++;
      }
      progress.categoryStats[category].lastStudiedAt = new Date().toISOString();
    }

    // 履歴に追加
    progress.history.push({
      questionId,
      selectedAnswer,
      isCorrect,
      answeredAt: new Date().toISOString()
    });

    // 最新100件のみ保持
    if (progress.history.length > 100) {
      progress.history = progress.history.slice(-100);
    }

    // 苦手問題の更新（正答率が50%未満の問題）
    const stats = progress.questionStats[questionId];
    const correctRate = stats.correctCount / stats.attempts;
    if (stats.attempts >= 2 && correctRate < 0.5) {
      if (!progress.weakQuestions.includes(questionId)) {
        progress.weakQuestions.push(questionId);
      }
    } else if (correctRate >= 0.7 && stats.attempts >= 3) {
      // 正答率70%以上で3回以上回答したら苦手から除外
      progress.weakQuestions = progress.weakQuestions.filter(id => id !== questionId);
    }

    // 最終アクセス日時更新
    progress.user.lastAccessedAt = new Date().toISOString();

    saveProgress(progress);

    // 関連用語を取得
    let relatedTermsData = [];
    if (question.relatedTerms && question.relatedTerms.length > 0) {
      try {
        const glossary = loadGlossary();
        relatedTermsData = question.relatedTerms
          .map(termId => glossary.terms.find(t => t.id === termId))
          .filter(t => t !== undefined);
      } catch (e) {
        // 用語集が見つからなくても続行
      }
    }

    res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      stats: progress.questionStats[questionId],
      relatedTerms: relatedTermsData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '回答の処理に失敗しました' });
  }
});

// ユーザー進捗取得
app.get('/api/progress', (req, res) => {
  try {
    const progress = loadProgress();

    // 全体の統計を計算
    const totalAttempts = Object.values(progress.categoryStats).reduce((sum, cat) => sum + cat.totalAttempts, 0);
    const totalCorrect = Object.values(progress.categoryStats).reduce((sum, cat) => sum + cat.correctCount, 0);

    res.json({
      user: progress.user,
      categoryStats: progress.categoryStats,
      totalAttempts,
      totalCorrect,
      overallCorrectRate: totalAttempts > 0 ? (totalCorrect / totalAttempts * 100).toFixed(1) : 0,
      weakQuestionsCount: progress.weakQuestions.length
    });
  } catch (error) {
    res.status(500).json({ error: '進捗の取得に失敗しました' });
  }
});

// 学習履歴取得
app.get('/api/history', (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const progress = loadProgress();
    const data = loadQuestions();

    // 履歴に問題情報を付加
    const historyWithDetails = progress.history
      .slice(-parseInt(limit))
      .reverse()
      .map(h => {
        const question = data.questions.find(q => q.id === h.questionId);
        return {
          ...h,
          question: question ? {
            id: question.id,
            category: question.category,
            categoryName: question.categoryName,
            subcategory: question.subcategory,
            questionText: question.question.substring(0, 50) + '...'
          } : null
        };
      });

    res.json(historyWithDetails);
  } catch (error) {
    res.status(500).json({ error: '履歴の取得に失敗しました' });
  }
});

// 進捗リセット
app.post('/api/progress/reset', (req, res) => {
  try {
    const initialProgress = {
      user: {
        id: 'default_user',
        createdAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString()
      },
      history: [],
      questionStats: {},
      categoryStats: {
        technology: { totalAttempts: 0, correctCount: 0, lastStudiedAt: null },
        management: { totalAttempts: 0, correctCount: 0, lastStudiedAt: null },
        strategy: { totalAttempts: 0, correctCount: 0, lastStudiedAt: null }
      },
      weakQuestions: []
    };

    saveProgress(initialProgress);
    res.json({ message: '進捗をリセットしました' });
  } catch (error) {
    res.status(500).json({ error: '進捗のリセットに失敗しました' });
  }
});

// ============================================
// 用語集 API
// ============================================

// 用語集一覧取得
app.get('/api/glossary', (req, res) => {
  try {
    const { category, search } = req.query;
    const data = loadGlossary();
    let terms = data.terms;

    if (category) {
      terms = terms.filter(t => t.category === category);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      terms = terms.filter(t =>
        t.term.toLowerCase().includes(searchLower) ||
        t.meaning.includes(search) ||
        t.description.includes(search)
      );
    }

    res.json(terms);
  } catch (error) {
    res.status(500).json({ error: '用語集の取得に失敗しました' });
  }
});

// 用語詳細取得
app.get('/api/glossary/:id', (req, res) => {
  try {
    const data = loadGlossary();
    const term = data.terms.find(t => t.id === req.params.id);

    if (!term) {
      return res.status(404).json({ error: '用語が見つかりません' });
    }

    res.json(term);
  } catch (error) {
    res.status(500).json({ error: '用語の取得に失敗しました' });
  }
});

// サーバー起動
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`基本情報技術者試験 学習サーバーが起動しました: http://${HOST}:${PORT}`);
});