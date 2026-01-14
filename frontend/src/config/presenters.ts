// プレゼンター（出題兼解説者）設定
import type { PresenterMode, DialogType, ScoreCategory, CharacterDialogs } from '../types';

export interface Presenter {
  id: PresenterMode;
  name: string;
  displayName: string;
  dialogs: CharacterDialogs;
  transformExplanation: (text: string) => string;
}

export const PRESENTERS: Record<PresenterMode, Presenter> = {
  normal: {
    id: 'normal',
    name: 'ノーマル',
    displayName: 'ノーマルモード',
    dialogs: {
      questionIntro: [
        '問題です。',
        '次の問題に答えてください。',
        'さあ、考えてみましょう。'
      ],
      correct: [
        '正解です!',
        'よくできました!',
        'すばらしい!'
      ],
      incorrect: [
        '不正解です。',
        '残念、次は頑張りましょう。',
        '惜しい! もう一度確認しましょう。'
      ],
      timeout: [
        '時間切れです。',
        '時間内に回答できませんでした。',
        '制限時間オーバーです。'
      ],
      quizStart: [
        '学習を始めましょう!'
      ],
      quizComplete: {
        excellent: ['素晴らしい成績です! この調子で頑張りましょう!'],
        good: ['よく頑張りました! あと少しで完璧です!'],
        needsWork: ['もう少し頑張りましょう。復習が大切です!']
      }
    },
    transformExplanation: (text: string) => text
  },
  vegeta: {
    id: 'vegeta',
    name: 'ベジータ',
    displayName: 'ベジータモード',
    dialogs: {
      questionIntro: [
        'フン、この程度の問題が解けるか見せてみろ!',
        'さあ、貴様の実力を見せてもらおうか!',
        '下級戦士でも解ける問題だ! できないとは言わせんぞ!',
        'この俺様が出題してやる。光栄に思え!'
      ],
      correct: [
        'フン、当然だ。これくらいできて当たり前だ!',
        '悪くない...だがこの程度で慢心するなよ!',
        'まあいいだろう。少しは見込みがあるようだな!',
        'ほう...カカロットより使えるかもしれんな!'
      ],
      incorrect: [
        'なんだと!? この程度もできんのか!',
        'クズめ...もう一度よく考えろ!',
        'たわけが! 修行が足りん!',
        '情けない! サイヤ人の誇りはどこへ行った!'
      ],
      timeout: [
        'ぐずぐずしおって! 時間切れだ!',
        '何をモタモタしている! 戦場では死んでいるぞ!',
        '遅い! サイヤ人の戦士失格だ!',
        'カカロット! この程度の判断に時間をかけるな!'
      ],
      quizStart: [
        'さあ、訓練開始だ! 覚悟はいいか、カカロット!?'
      ],
      quizComplete: {
        excellent: ['フン...認めてやろう、貴様は戦士だ! だが俺様には及ばん!'],
        good: ['まあまあだな...だが油断するな! 修行を怠るなよ!'],
        needsWork: ['情けない! このままでは地球を守れんぞ! もっと修行しろ!']
      }
    },
    transformExplanation: (text: string) => {
      return text
        // まず全角「！」を半角「!」に統一
        .replace(/！/g, '!')
        // 意志形・勧誘形を命令形に変換（文末も一緒に処理）
        .replace(/覚えよう[。!]?/g, '覚えろ!')
        .replace(/ておこう[。!]?/g, 'ておけ!')
        .replace(/しよう[。!]?/g, 'しろ!')
        .replace(/おこう[。!]?/g, 'おけ!')
        .replace(/いこう[。!]?/g, 'いけ!')
        .replace(/えよう[。!]?/g, 'えろ!')
        .replace(/ろう[。!]?/g, 'れ!')
        // 丁寧語の変換
        .replace(/です[。!]/g, 'だ!')
        .replace(/ます[。!]/g, 'るぞ!')
        .replace(/でしょう[。!]/g, 'だろう!')
        .replace(/ください[。!]/g, 'しろ!')
        .replace(/ください/g, 'しろ')
        .replace(/しましょう[。!]/g, 'しろ!')
        .replace(/しましょう/g, 'しろ')
        .replace(/ましょう[。!]/g, 'るんだ!')
        .replace(/ましょう/g, 'るんだ')
        .replace(/られます/g, 'られる')
        .replace(/できます/g, 'できる')
        .replace(/なります/g, 'なる')
        .replace(/あります/g, 'ある')
        .replace(/います/g, 'いる')
        .replace(/です/g, 'だ')
        .replace(/ます/g, 'る')
        // 名詞+「。」や「!」を先に処理
        .replace(/同じ[。!]/g, '同じだ!')
        .replace(/ない[。!]/g, 'ないぞ!')
        .replace(/だけ[。!]/g, 'だけだ!')
        .replace(/こと[。!]/g, 'ことだ!')
        .replace(/もの[。!]/g, 'ものだ!')
        .replace(/ため[。!]/g, 'ためだ!')
        .replace(/など[。!]/g, 'などだ!')
        .replace(/である[。!]/g, 'だ!')
        // 動詞終止形の文末
        .replace(/る[。]/g, 'るぞ!')
        .replace(/す[。]/g, 'すぞ!')
        .replace(/く[。]/g, 'くぞ!')
        .replace(/ぐ[。]/g, 'ぐぞ!')
        .replace(/う[。]/g, 'うぞ!')
        .replace(/つ[。]/g, 'つぞ!')
        .replace(/ぬ[。]/g, 'ぬぞ!')
        .replace(/ぶ[。]/g, 'ぶぞ!')
        .replace(/む[。]/g, 'むぞ!')
        // 形容詞・過去形の文末
        .replace(/い[。]/g, 'いぞ!')
        .replace(/た[。]/g, 'たぞ!')
        .replace(/だ[。]/g, 'だ!')
        // 残りの「。」は名詞終わりと判断して「だ!」
        .replace(/。/g, 'だ!');
    }
  }
};

export const DEFAULT_PRESENTER: PresenterMode = 'normal';

// ランダムにセリフを取得するヘルパー関数
export function getRandomDialog(
  presenterId: PresenterMode,
  dialogType: DialogType,
  scorePercentage: number | null = null
): string {
  const presenter = PRESENTERS[presenterId];
  if (!presenter) return '';

  const dialogs = presenter.dialogs[dialogType];
  if (!dialogs) return '';

  // quizCompleteはスコアに応じたカテゴリを持つ
  if (dialogType === 'quizComplete' && scorePercentage !== null) {
    let category: ScoreCategory;
    if (scorePercentage >= 80) category = 'excellent';
    else if (scorePercentage >= 60) category = 'good';
    else category = 'needsWork';

    const quizCompleteDialogs = dialogs as { excellent: string[]; good: string[]; needsWork: string[] };
    const categoryDialogs = quizCompleteDialogs[category];
    if (!categoryDialogs || categoryDialogs.length === 0) return '';
    return categoryDialogs[Math.floor(Math.random() * categoryDialogs.length)];
  }

  // 通常の配列から取得
  if (Array.isArray(dialogs)) {
    return dialogs[Math.floor(Math.random() * dialogs.length)];
  }

  return '';
}

// 解説文を変換するヘルパー関数
export function transformExplanation(presenterId: PresenterMode, text: string): string {
  const presenter = PRESENTERS[presenterId];
  if (!presenter || !presenter.transformExplanation) return text;
  return presenter.transformExplanation(text);
}
