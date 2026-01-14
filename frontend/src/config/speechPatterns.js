// 口調変換プリセット（8種類）

export const SPEECH_PATTERNS = {
  // 1. 丁寧語（変換なし）
  polite: {
    id: 'polite',
    name: '丁寧語',
    description: '標準的な丁寧語（変換なし）',
    transform: (text) => text
  },

  // 2. 俺様系（現ベジータ）
  oresama: {
    id: 'oresama',
    name: '俺様系',
    description: '威圧的で命令口調（だ! ぞ! しろ!）',
    transform: (text) => {
      return text
        .replace(/！/g, '!')
        .replace(/覚えよう[。!]?/g, '覚えろ!')
        .replace(/ておこう[。!]?/g, 'ておけ!')
        .replace(/しよう[。!]?/g, 'しろ!')
        .replace(/おこう[。!]?/g, 'おけ!')
        .replace(/いこう[。!]?/g, 'いけ!')
        .replace(/えよう[。!]?/g, 'えろ!')
        .replace(/ろう[。!]?/g, 'れ!')
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
        .replace(/同じ[。!]/g, '同じだ!')
        .replace(/ない[。!]/g, 'ないぞ!')
        .replace(/だけ[。!]/g, 'だけだ!')
        .replace(/こと[。!]/g, 'ことだ!')
        .replace(/もの[。!]/g, 'ものだ!')
        .replace(/ため[。!]/g, 'ためだ!')
        .replace(/など[。!]/g, 'などだ!')
        .replace(/である[。!]/g, 'だ!')
        .replace(/る[。]/g, 'るぞ!')
        .replace(/す[。]/g, 'すぞ!')
        .replace(/く[。]/g, 'くぞ!')
        .replace(/ぐ[。]/g, 'ぐぞ!')
        .replace(/う[。]/g, 'うぞ!')
        .replace(/つ[。]/g, 'つぞ!')
        .replace(/ぬ[。]/g, 'ぬぞ!')
        .replace(/ぶ[。]/g, 'ぶぞ!')
        .replace(/む[。]/g, 'むぞ!')
        .replace(/い[。]/g, 'いぞ!')
        .replace(/た[。]/g, 'たぞ!')
        .replace(/だ[。]/g, 'だ!')
        .replace(/。/g, 'だ!');
    }
  },

  // 3. お嬢様系
  ojousama: {
    id: 'ojousama',
    name: 'お嬢様系',
    description: '上品で優雅な口調（ですわ、〜てよ）',
    transform: (text) => {
      return text
        .replace(/！/g, '!')
        .replace(/です[。]/g, 'ですわ。')
        .replace(/です[!]/g, 'ですわ!')
        .replace(/ます[。]/g, 'ますわ。')
        .replace(/ます[!]/g, 'ますわ!')
        .replace(/ください[。!]?/g, 'くださいませ。')
        .replace(/でしょう/g, 'でしょう')
        .replace(/ません/g, 'ませんわ')
        .replace(/ないです/g, 'ありませんの')
        .replace(/しましょう/g, 'いたしましょう')
        .replace(/覚えよう/g, '覚えてくださいませ')
        .replace(/。$/g, 'ですわ。')
        .replace(/!$/g, 'ですわ!');
    }
  },

  // 4. 博士系
  hakase: {
    id: 'hakase',
    name: '博士系',
    description: '老賢者風の口調（〜じゃ、〜のう）',
    transform: (text) => {
      return text
        .replace(/！/g, '!')
        .replace(/です[。]/g, 'じゃ。')
        .replace(/です[!]/g, 'じゃ!')
        .replace(/ます[。]/g, 'るのじゃ。')
        .replace(/ます[!]/g, 'るのじゃ!')
        .replace(/ません/g, 'んのじゃ')
        .replace(/ください/g, 'くれい')
        .replace(/でしょう/g, 'であろう')
        .replace(/しましょう/g, 'しようぞ')
        .replace(/覚えよう/g, '覚えるのじゃ')
        .replace(/ですね/g, 'じゃのう')
        .replace(/ますね/g, 'るのじゃのう')
        .replace(/です/g, 'じゃ')
        .replace(/ます/g, 'るのじゃ');
    }
  },

  // 5. ギャル系
  gyaru: {
    id: 'gyaru',
    name: 'ギャル系',
    description: '若者言葉（〜じゃん、マジ〜、〜っしょ）',
    transform: (text) => {
      return text
        .replace(/！/g, '!')
        .replace(/です[。]/g, 'じゃん。')
        .replace(/です[!]/g, 'じゃん!')
        .replace(/ます[。]/g, 'るっしょ。')
        .replace(/ます[!]/g, 'るっしょ!')
        .replace(/ません/g, 'ないし')
        .replace(/ください/g, 'してー')
        .replace(/でしょう/g, 'っしょ')
        .replace(/しましょう/g, 'しよ〜')
        .replace(/覚えよう/g, '覚えよ〜')
        .replace(/重要/g, 'マジ重要')
        .replace(/大切/g, 'マジ大切')
        .replace(/必要/g, 'マジ必要')
        .replace(/すごい/g, 'マジやばい')
        .replace(/ですね/g, 'じゃん?')
        .replace(/です/g, 'だし')
        .replace(/ます/g, 'るし');
    }
  },

  // 6. 元気な子1（カジュアル）
  genki1: {
    id: 'genki1',
    name: '元気な子1',
    description: 'カジュアルで元気な口調（〜だよ！〜だね！）',
    transform: (text) => {
      return text
        .replace(/！/g, '!')
        .replace(/です[。]/g, 'だよ!')
        .replace(/です[!]/g, 'だよ!')
        .replace(/ます[。]/g, 'るよ!')
        .replace(/ます[!]/g, 'るよ!')
        .replace(/ません/g, 'ないよ')
        .replace(/ください/g, 'してね!')
        .replace(/でしょう/g, 'でしょ?')
        .replace(/しましょう/g, 'しよう!')
        .replace(/覚えよう/g, '覚えよう!')
        .replace(/ですね/g, 'だね!')
        .replace(/ますね/g, 'るね!')
        .replace(/です/g, 'だよ')
        .replace(/ます/g, 'るよ');
    }
  },

  // 7. 元気な子2（敬語）
  genki2: {
    id: 'genki2',
    name: '元気な子2',
    description: '元気な敬語口調（〜です！〜ます！）',
    transform: (text) => {
      return text
        .replace(/。/g, '!')
        .replace(/です!/g, 'です!')
        .replace(/ます!/g, 'ます!')
        .replace(/ください/g, 'ください!')
        .replace(/しましょう/g, 'しましょう!')
        .replace(/覚えよう/g, '覚えましょう!');
    }
  },

  // 8. おじさん構文
  ojisan: {
    id: 'ojisan',
    name: 'おじさん構文',
    description: '絵文字多用のおじさん風（〜かな❓😅）',
    transform: (text) => {
      const emojis = ['😊', '😄', '🤔', '😅', '✨', '💪', '👍', '🎉', '😁', '🙆'];
      const getRandomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];

      return text
        .replace(/！/g, '!')
        .replace(/です[。]/g, `ですネ${getRandomEmoji()}`)
        .replace(/です[!]/g, `です❗${getRandomEmoji()}`)
        .replace(/ます[。]/g, `マス${getRandomEmoji()}`)
        .replace(/ます[!]/g, `マス❗${getRandomEmoji()}`)
        .replace(/ください/g, `クダサイ🙏`)
        .replace(/でしょう/g, 'カナ❓🤔')
        .replace(/しましょう/g, `しようネ${getRandomEmoji()}`)
        .replace(/覚えよう/g, `覚えてネ${getRandomEmoji()}`)
        .replace(/ですね/g, `だよネ〜${getRandomEmoji()}`)
        .replace(/。/g, `${getRandomEmoji()}`)
        .replace(/\?/g, '❓')
        .replace(/!/g, '❗');
    }
  }
};

// デフォルトの口調プリセット
export const DEFAULT_SPEECH_PATTERN = 'polite';

// 口調プリセット一覧を取得
export function getSpeechPatternList() {
  return Object.values(SPEECH_PATTERNS).map(({ id, name, description }) => ({
    id,
    name,
    description
  }));
}

// 口調変換を実行
export function transformWithPattern(patternId, text) {
  const pattern = SPEECH_PATTERNS[patternId];
  if (!pattern) return text;
  return pattern.transform(text);
}
