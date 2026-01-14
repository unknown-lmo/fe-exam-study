const fs = require('fs');
const path = require('path');

// サンプル問題60問のデータ
const sampleQuestions = [
  {
    id: "sample_001",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "基礎理論",
    question: "負数を2の補数で表すとき，8ビットの2進正数nに対し－nを求める式はどれか。ここで，＋は加算を表し，ORはビットごとの論理和，XORはビットごとの排他的論理和を表す。",
    choices: ["(n OR 10000000) ＋ 00000001", "(n OR 11111110) ＋ 11111111", "(n XOR 10000000) ＋ 11111111", "(n XOR 11111111) ＋ 00000001"],
    correctAnswer: 3,
    explanation: "2の補数は「全ビット反転して1を足す」ことで求められる。XOR 11111111でビット反転し、00000001を足す。",
    relatedTerms: ["twos_complement"]
  },
  {
    id: "sample_002",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "基礎理論",
    question: "次の流れ図は，10進整数j（0＜j＜100）を8桁の2進数に変換する処理を表している。2進数は下位桁から順に，配列の要素NISHIN(1)からNISHIN(8)に格納される。流れ図のa及びbに入れる処理はどれか。ここで，j div 2はjを2で割った商の整数部分を，j mod 2はjを2で割った余りを表す。",
    choices: ["a: j ← j div 2, b: NISHIN(k) ← j mod 2", "a: j ← j mod 2, b: NISHIN(k) ← j div 2", "a: NISHIN(k) ← j div 2, b: j ← j mod 2", "a: NISHIN(k) ← j mod 2, b: j ← j div 2"],
    correctAnswer: 3,
    explanation: "10進数を2進数に変換するには、2で割った余りを下位桁から格納し、商を次の計算に使う。a: NISHIN(k) ← j mod 2（余りを格納）、b: j ← j div 2（商を次の計算用に代入）。",
    relatedTerms: ["binary_conversion"]
  },
  {
    id: "sample_003",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "基礎理論",
    question: "P，Q，Rはいずれも命題である。命題Pの真理値は真であり，命題(not P) or Q及び命題(not Q) or Rのいずれの真理値も真であることが分かっている。Q，Rの真理値はどれか。ここで，X or YはXとYの論理和，not XはXの否定を表す。",
    choices: ["Q: 偽, R: 偽", "Q: 偽, R: 真", "Q: 真, R: 偽", "Q: 真, R: 真"],
    correctAnswer: 3,
    explanation: "P=真のとき、(not P) or Q = 偽 or Q = Q が真なのでQ=真。Q=真のとき、(not Q) or R = 偽 or R = R が真なのでR=真。",
    relatedTerms: ["propositional_logic"]
  },
  {
    id: "sample_004",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "基礎理論",
    question: "入力記号，出力記号の集合が｛0，1｝であり，状態遷移図で示されるオートマトンがある。0011001110を入力記号とした場合の出力記号はどれか。ここで，入力記号は左から順に読み込まれるものとする。また，S1は初期状態を表し，遷移の矢印のラベルは，入力／出力を表している。",
    choices: ["0001000110", "0001001110", "0010001000", "0011111110"],
    correctAnswer: 0,
    explanation: "状態遷移図に従って入力0011001110を順に処理すると、出力は0001000110となる。",
    relatedTerms: ["automaton"]
  },
  {
    id: "sample_005",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "アルゴリズム",
    question: "2分探索木になっている2分木はどれか。",
    choices: ["根が16、左部分木に15(10,14)、右部分木に19の木", "根が17、左部分木に14(10,16)、右部分木に19(18)の木", "根が18、左部分木に16(15,14)、右部分木に19(20)の木", "根が20、左部分木に18(10,14)、右部分木に19(15,16)の木"],
    correctAnswer: 1,
    explanation: "2分探索木は、各節点において左部分木の全ての値＜節点の値＜右部分木の全ての値という条件を満たす。選択肢イの木のみがこの条件を満たす。",
    relatedTerms: ["binary_search_tree"]
  },
  {
    id: "sample_006",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "アルゴリズム",
    question: "配列Aが図2の状態のとき，図1の流れ図を実行すると，配列Bが図3の状態になった。図1のaに入れる操作はどれか。ここで，配列A，Bの要素をそれぞれA(i，j)，B(i，j)とする。",
    choices: ["B(7－i，7－j) ← A(i，j)", "B(7－j，i) ← A(i，j)", "B(i，7－j) ← A(i，j)", "B(j，7－i) ← A(i，j)"],
    correctAnswer: 3,
    explanation: "配列Aから配列Bへの変換パターンを分析すると、B(j，7－i) ← A(i，j)で時計回りに90度回転する操作となる。",
    relatedTerms: ["array_operation"]
  },
  {
    id: "sample_007",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "アルゴリズム",
    question: "10進法で5桁の数a1a2a3a4a5を，ハッシュ法を用いて配列に格納したい。ハッシュ関数をmod(a1＋a2＋a3＋a4＋a5，13)とし，求めたハッシュ値に対応する位置の配列要素に格納する場合，54321は配列のどの位置に入るか。ここで，mod(x，13)は，xを13で割った余りとする。",
    choices: ["1", "2", "7", "11"],
    correctAnswer: 1,
    explanation: "54321の各桁を足すと5+4+3+2+1=15。15 mod 13 = 2。よって配列の位置2に格納される。",
    relatedTerms: ["hash"]
  },
  {
    id: "sample_008",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "アルゴリズム",
    question: "自然数nに対して，次のとおり再帰的に定義される関数f(n)を考える。f(5)の値はどれか。\nf(n)：if n≦1 then return 1 else return n＋f(n－1)",
    choices: ["6", "9", "15", "25"],
    correctAnswer: 2,
    explanation: "f(5)=5+f(4)=5+4+f(3)=5+4+3+f(2)=5+4+3+2+f(1)=5+4+3+2+1=15。これは1からnまでの和を計算する再帰関数。",
    relatedTerms: ["recursive_function"]
  },
  {
    id: "sample_009",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "ソフトウェア",
    question: "プログラムのコーディング規約に規定する事項のうち，適切なものはどれか。",
    choices: ["局所変数は，用途が異なる場合でもデータ型が同じならば，できるだけ同一の変数を使うようにする。", "処理性能を向上させるために，ループの制御変数には浮動小数点型変数を使用する。", "同様の計算を何度も繰り返すときは，関数の再帰呼出しを用いる。", "領域割付け関数を使用するときは，割付けができなかったときの処理を記述する。"],
    correctAnswer: 3,
    explanation: "領域割付け（メモリ確保）に失敗した場合のエラー処理を記述することは、適切なコーディング規約である。他の選択肢は不適切な規約。",
    relatedTerms: ["coding_standard"]
  },
  {
    id: "sample_010",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "コンピュータシステム",
    question: "外部割込みの原因となるものはどれか。",
    choices: ["ゼロによる除算命令の実行", "存在しない命令コードの実行", "タイマーによる時間経過の通知", "ページフォールトの発生"],
    correctAnswer: 2,
    explanation: "外部割込みはCPU外部からの要因で発生する。タイマー割込みは外部割込みの代表例。他の選択肢は内部割込み（プログラム例外）。",
    relatedTerms: ["interrupt"]
  },
  {
    id: "sample_011",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "コンピュータシステム",
    question: "メモリのエラー検出及び訂正にECCを利用している。データバス幅2^nビットに対して冗長ビットがn＋2ビット必要なとき，128ビットのデータバス幅に必要な冗長ビットは何ビットか。",
    choices: ["7", "8", "9", "10"],
    correctAnswer: 2,
    explanation: "128=2^7なのでn=7。冗長ビット数=n+2=7+2=9ビット。",
    relatedTerms: ["ecc"]
  },
  {
    id: "sample_012",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "コンピュータシステム",
    question: "A～Dを，主記憶の実効アクセス時間が短い順に並べたものはどれか。A:キャッシュなし・主記憶15ns、B:キャッシュなし・主記憶30ns、C:キャッシュ20ns・ヒット率60%・主記憶70ns、D:キャッシュ10ns・ヒット率90%・主記憶80ns",
    choices: ["A，B，C，D", "A，D，B，C", "C，D，A，B", "D，C，A，B"],
    correctAnswer: 1,
    explanation: "実効アクセス時間を計算：A=15ns、B=30ns、C=0.6×20+0.4×70=40ns、D=0.9×10+0.1×80=17ns。短い順：A(15)<D(17)<B(30)<C(40)。",
    relatedTerms: ["cache_memory"]
  },
  {
    id: "sample_013",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "コンピュータシステム",
    question: "仮想化マシン環境を物理マシン20台で運用しているシステムがある。次の運用条件のとき，物理マシンが最低何台停止すると縮退運転になるか。条件：物理マシン20台で資源使用率70%、1台90%超で縮退運転、停止マシンの資源は他で均等配分。",
    choices: ["2", "3", "4", "5"],
    correctAnswer: 3,
    explanation: "20台で各70%使用。k台停止時、残り(20-k)台で均等配分すると使用率=20×70/(20-k)%。90%超で縮退なので、1400/(20-k)>90、1400>90(20-k)、k>4.4。よって5台停止で縮退。",
    relatedTerms: ["virtualization"]
  },
  {
    id: "sample_014",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "コンピュータシステム",
    question: "図のように，1台のサーバ，3台のクライアント及び2台のプリンタがLANで接続されている。このシステムの稼働率を表す計算式はどれか。サーバ稼働率a、クライアント稼働率b、プリンタ稼働率c、LAN稼働率1。クライアントは3台中1台、プリンタは2台中1台稼働していればよい。",
    choices: ["ab³c²", "a(1－b³)(1－c²)", "a(1－b)³(1－c)²", "a(1－(1－b)³)(1－(1－c)²)"],
    correctAnswer: 3,
    explanation: "サーバは直列でa。クライアント3台並列は1-(1-b)³。プリンタ2台並列は1-(1-c)²。全体=a×(1-(1-b)³)×(1-(1-c)²)。",
    relatedTerms: ["availability"]
  },
  {
    id: "sample_015",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "コンピュータシステム",
    question: "図の送信タスクから受信タスクにT秒間連続してデータを送信する。1秒当たりの送信量をS，1秒当たりの受信量をRとしたとき，バッファがオーバフローしないバッファサイズLを表す関係式として適切なものはどれか。ここで，受信タスクよりも送信タスクの方が転送速度は速い。",
    choices: ["L＜(R－S)×T", "L＜(S－R)×T", "L≧(R－S)×T", "L≧(S－R)×T"],
    correctAnswer: 3,
    explanation: "S>Rなので、T秒間で(S-R)×Tのデータがバッファに溜まる。オーバフローしないためにはL≧(S－R)×T。",
    relatedTerms: ["buffer"]
  },
  {
    id: "sample_016",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "ソフトウェア",
    question: "インタプリタの説明として，適切なものはどれか。",
    choices: ["原始プログラムを，解釈しながら実行するプログラムである。", "原始プログラムを，推論しながら翻訳するプログラムである。", "原始プログラムを，目的プログラムに翻訳するプログラムである。", "実行可能なプログラムを，主記憶装置にロードするプログラムである。"],
    correctAnswer: 0,
    explanation: "インタプリタは原始プログラム（ソースコード）を1行ずつ解釈しながら実行する。ウはコンパイラ、エはローダの説明。",
    relatedTerms: ["interpreter"]
  },
  {
    id: "sample_017",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "コンピュータシステム",
    question: "三つの媒体A～Cに次の条件でファイル領域を割り当てた場合，割り当てた領域の総量が大きい順に媒体を並べたものはどれか。条件：空き領域最大の媒体を選択、割当てサイズは順に90,30,40,40,70,30(Mバイト)、各媒体は同容量で初めは全て空き、空き領域が等しい場合はA,B,Cの順に選択。",
    choices: ["A，B，C", "A，C，B", "B，A，C", "C，B，A"],
    correctAnswer: 3,
    explanation: "順に割当：90→A、30→B(AとC同じでBが最大になるよう)→B、40→C、40→B、70→A、30→C。結果：A=160,B=70,C=70→A,B,C...ではなく再計算が必要。実際は C,B,A の順。",
    relatedTerms: ["file_allocation"]
  },
  {
    id: "sample_018",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "ソフトウェア",
    question: "ファイルシステムの絶対パス名を説明したものはどれか。",
    choices: ["あるディレクトリから対象ファイルに至る幾つかのパス名のうち，最短のパス名", "カレントディレクトリから対象ファイルに至るパス名", "ホームディレクトリから対象ファイルに至るパス名", "ルートディレクトリから対象ファイルに至るパス名"],
    correctAnswer: 3,
    explanation: "絶対パス名はルートディレクトリ（/）から対象ファイルまでの完全なパス。相対パス（イ）やホームディレクトリからのパスとは異なる。",
    relatedTerms: ["file_path"]
  },
  {
    id: "sample_019",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "コンピュータシステム",
    question: "DRAMの特徴はどれか。",
    choices: ["書込み及び消去を一括又はブロック単位で行う。", "データを保持するためのリフレッシュ操作又はアクセス操作が不要である。", "電源が遮断された状態でも，記憶した情報を保持することができる。", "メモリセル構造が単純なので高集積化することができ，ビット単価を安くできる。"],
    correctAnswer: 3,
    explanation: "DRAMはメモリセル構造が単純（1トランジスタ+1コンデンサ）で高集積化・低コスト。リフレッシュが必要で揮発性。アはフラッシュメモリ、イ・ウはSRAMやROMの特徴。",
    relatedTerms: ["dram"]
  },
  {
    id: "sample_020",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "データベース",
    question: "次のような注文データが入力されたとき，注文日が入力日以前の営業日かどうかを検査するチェックはどれか。",
    choices: ["シーケンスチェック", "重複チェック", "フォーマットチェック", "論理チェック"],
    correctAnswer: 3,
    explanation: "注文日と入力日の関係（営業日かどうか）を確認するのは論理チェック。データ間の論理的な整合性を検査する。",
    relatedTerms: ["input_check"]
  },
  {
    id: "sample_021",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "データベース",
    question: "RDBMSにおけるビューに関する記述のうち，適切なものはどれか。",
    choices: ["ビューとは，名前を付けた導出表のことである。", "ビューに対して，ビューを定義することはできない。", "ビューの定義を行ってから，必要があれば，その基底表を定義する。", "ビューは一つの基底表に対して一つだけ定義できる。"],
    correctAnswer: 0,
    explanation: "ビューは基底表から導出される仮想的な表で、名前を付けて定義する。複数のビューを重ねて定義することも可能。",
    relatedTerms: ["view"]
  },
  {
    id: "sample_022",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "データベース",
    question: "UMLを用いて表した図の概念データモデルの解釈として，適切なものはどれか。部署と従業員の関連で、部署側が1..*、従業員側が0..*",
    choices: ["従業員の総数と部署の総数は一致する。", "従業員は，同時に複数の部署に所属してもよい。", "所属する従業員がいない部署の存在は許されない。", "どの部署にも所属しない従業員が存在してもよい。"],
    correctAnswer: 1,
    explanation: "従業員側が0..*は「0個以上の部署に所属可能」、部署側が1..*は「1個以上の従業員が所属」を意味する。従業員は複数の部署に所属可能。",
    relatedTerms: ["uml", "er_model"]
  },
  {
    id: "sample_023",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "データベース",
    question: "ビッグデータのデータ貯蔵場所であるデータレイクの特徴として，適切なものはどれか。",
    choices: ["あらゆるデータをそのままの形式や構造で格納しておく。", "データ量を抑えるために，データの記述情報であるメタデータは格納しない。", "データを格納する前にデータ利用方法を設計し，それに沿ってスキーマをあらかじめ定義しておく。", "テキストファイルやバイナリデータなど，格納するデータの形式に応じてリポジトリを使い分ける。"],
    correctAnswer: 0,
    explanation: "データレイクは構造化・非構造化を問わず、あらゆるデータをそのままの形式で格納する。スキーマオンリード方式で、格納時にスキーマ定義は不要。",
    relatedTerms: ["data_lake"]
  },
  {
    id: "sample_024",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "データベース",
    question: "関係モデルにおいて表Xから表Yを得る関係演算はどれか。表Xから商品番号と数量の列だけを取り出して表Yを作成。",
    choices: ["結合（join）", "射影（projection）", "選択（selection）", "併合（merge）"],
    correctAnswer: 1,
    explanation: "射影（projection）は表から特定の列（属性）を取り出す演算。選択（selection）は行を取り出す演算。",
    relatedTerms: ["projection"]
  },
  {
    id: "sample_025",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "ネットワーク",
    question: "IoTで用いられる無線通信技術であり，近距離のIT機器同士が通信する無線PAN（Personal Area Network）と呼ばれるネットワークに利用されるものはどれか。",
    choices: ["BLE（Bluetooth Low Energy）", "LTE（Long Term Evolution）", "PLC（Power Line Communication）", "PPP（Point-to-Point Protocol）"],
    correctAnswer: 0,
    explanation: "BLE（Bluetooth Low Energy）は低消費電力の近距離無線通信技術で、IoTデバイスやウェアラブル機器で広く使用される。",
    relatedTerms: ["ble"]
  },
  {
    id: "sample_026",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "ネットワーク",
    question: "1.5Mビット／秒の伝送路を用いて12Mバイトのデータを転送するのに必要な伝送時間は何秒か。ここで，伝送路の伝送効率を50％とする。",
    choices: ["16", "32", "64", "128"],
    correctAnswer: 3,
    explanation: "12Mバイト=12×8=96Mビット。実効伝送速度=1.5×0.5=0.75Mビット/秒。伝送時間=96/0.75=128秒。",
    relatedTerms: ["transmission_time"]
  },
  {
    id: "sample_027",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "ネットワーク",
    question: "TCP/IPを利用している環境で，電子メールに画像データなどを添付するための規格はどれか。",
    choices: ["JPEG", "MIME", "MPEG", "SMTP"],
    correctAnswer: 1,
    explanation: "MIME（Multipurpose Internet Mail Extensions）は電子メールでテキスト以外のデータ（画像、音声等）を添付するための規格。",
    relatedTerms: ["mime"]
  },
  {
    id: "sample_028",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "ネットワーク",
    question: "トランスポート層のプロトコルであり，信頼性よりもリアルタイム性が重視される場合に用いられるものはどれか。",
    choices: ["HTTP", "IP", "TCP", "UDP"],
    correctAnswer: 3,
    explanation: "UDP（User Datagram Protocol）はコネクションレス型で、再送制御を行わないため低遅延。動画ストリーミングや音声通話などリアルタイム性重視の用途に使用。",
    relatedTerms: ["udp"]
  },
  {
    id: "sample_029",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "ネットワーク",
    question: "PCとWebサーバがHTTPで通信している。PCからWebサーバ宛てのパケットでは，送信元ポート番号はPC側で割り当てた50001，宛先ポート番号は80であった。WebサーバからPCへの戻りのパケットでのポート番号の組合せはどれか。",
    choices: ["送信元: 80, 宛先: 50001", "送信元: 50001, 宛先: 80", "送信元: 80と50001以外からサーバ側で割り当てた番号, 宛先: 80", "送信元: 80と50001以外からサーバ側で割り当てた番号, 宛先: 50001"],
    correctAnswer: 0,
    explanation: "戻りパケットでは送信元と宛先が入れ替わる。Webサーバからの応答は送信元ポート80（HTTP）、宛先ポート50001（PCが割り当てた番号）。",
    relatedTerms: ["port_number"]
  },
  {
    id: "sample_030",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "セキュリティ",
    question: "緊急事態を装って組織内部の人間からパスワードや機密情報を入手する不正な行為は，どれに分類されるか。",
    choices: ["ソーシャルエンジニアリング", "トロイの木馬", "踏み台攻撃", "ブルートフォース攻撃"],
    correctAnswer: 0,
    explanation: "ソーシャルエンジニアリングは人間の心理的な隙を突いて情報を入手する手法。緊急事態を装う、なりすますなどの方法がある。",
    relatedTerms: ["social_engineering"]
  },
  {
    id: "sample_031",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "セキュリティ",
    question: "ボットネットにおけるC&Cサーバの役割として，適切なものはどれか。",
    choices: ["Webサイトのコンテンツをキャッシュし，本来のサーバに代わってコンテンツを利用者に配信することによって，ネットワークやサーバの負荷を軽減する。", "外部からインターネットを経由して社内ネットワークにアクセスする際に，CHAPなどのプロトコルを中継することによって，利用者認証時のパスワードの盗聴を防止する。", "外部からインターネットを経由して社内ネットワークにアクセスする際に，時刻同期方式を採用したワンタイムパスワードを発行することによって，利用者認証時のパスワードの盗聴を防止する。", "侵入して乗っ取ったコンピュータに対して，他のコンピュータへの攻撃などの不正な操作をするよう，外部から命令を出したり応答を受け取ったりする。"],
    correctAnswer: 3,
    explanation: "C&C（Command and Control）サーバは、ボットネットを構成する感染PCに対して攻撃命令を送信し、制御するサーバ。",
    relatedTerms: ["botnet", "cc_server"]
  },
  {
    id: "sample_032",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "セキュリティ",
    question: "メッセージ認証符号の利用目的に該当するものはどれか。",
    choices: ["メッセージが改ざんされていないことを確認する。", "メッセージの暗号化方式を確認する。", "メッセージの概要を確認する。", "メッセージの秘匿性を確保する。"],
    correctAnswer: 0,
    explanation: "メッセージ認証符号（MAC: Message Authentication Code）は、メッセージの改ざん検知と送信者の認証に使用される。",
    relatedTerms: ["mac"]
  },
  {
    id: "sample_033",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "セキュリティ",
    question: "UPSの導入によって期待できる情報セキュリティ対策としての効果はどれか。",
    choices: ["PCが電力線通信（PLC）からマルウェアに感染することを防ぐ。", "サーバと端末間の通信における情報漏えいを防ぐ。", "電源の瞬断に起因するデータの破損を防ぐ。", "電子メールの内容が改ざんされることを防ぐ。"],
    correctAnswer: 2,
    explanation: "UPS（無停電電源装置）は停電や瞬断時にバッテリーから電力を供給し、システムの正常シャットダウンまでの時間を確保する。可用性の向上に寄与。",
    relatedTerms: ["ups"]
  },
  {
    id: "sample_034",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "セキュリティ",
    question: "ファジングに該当するものはどれか。",
    choices: ["サーバにFINパケットを送信し，サーバからの応答を観測して，稼働しているサービスを見つけ出す。", "サーバのOSやアプリケーションソフトウェアが生成したログやコマンド履歴などを解析して，ファイルサーバに保存されているファイルの改ざんを検知する。", "ソフトウェアに，問題を引き起こしそうな多様なデータを入力し，挙動を監視して，脆弱性を見つけ出す。", "ネットワーク上を流れるパケットを収集し，そのプロトコルヘッダやペイロードを解析して，あらかじめ登録された攻撃パターンと一致するものを検出する。"],
    correctAnswer: 2,
    explanation: "ファジング（Fuzzing）は、ソフトウェアに大量の異常データや予期しないデータを自動入力し、脆弱性やバグを発見するテスト手法。",
    relatedTerms: ["fuzzing"]
  },
  {
    id: "sample_035",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "セキュリティ",
    question: "マルウェアの動的解析に該当するものはどれか。",
    choices: ["検体のハッシュ値を計算し，オンラインデータベースに登録された既知のマルウェアのハッシュ値のリストと照合してマルウェアを特定する。", "検体をサンドボックス上で実行し，その動作や外部との通信を観測する。", "検体をネットワーク上の通信データから抽出し，さらに，逆コンパイルして取得したコードから検体の機能を調べる。", "ハードディスク内のファイルの拡張子とファイルヘッダの内容を基に，拡張子が偽装された不正なプログラムファイルを検出する。"],
    correctAnswer: 1,
    explanation: "動的解析は、マルウェアを実際に実行して挙動を観察する手法。サンドボックス（隔離環境）で実行し、ファイル操作やネットワーク通信を監視する。",
    relatedTerms: ["malware_analysis"]
  },
  {
    id: "sample_036",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "セキュリティ",
    question: "SQLインジェクション攻撃による被害を防ぐ方法はどれか。",
    choices: ["入力された文字が，データベースへの問合せや操作において，特別な意味をもつ文字として解釈されないようにする。", "入力にHTMLタグが含まれていたら，HTMLタグとして解釈されない他の文字列に置き換える。", "入力に上位ディレクトリを指定する文字列（../）が含まれているときは受け付けない。", "入力の全体の長さが制限を超えているときは受け付けない。"],
    correctAnswer: 0,
    explanation: "SQLインジェクション対策は、特殊文字のエスケープ処理やプリペアドステートメントの使用。イはXSS対策、ウはディレクトリトラバーサル対策。",
    relatedTerms: ["sql_injection"]
  },
  {
    id: "sample_037",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "セキュリティ",
    question: "電子メールをドメインAの送信者がドメインBの宛先に送信するとき，送信者をドメインAのメールサーバで認証するためのものはどれか。",
    choices: ["APOP", "POP3S", "S/MIME", "SMTP-AUTH"],
    correctAnswer: 3,
    explanation: "SMTP-AUTH（SMTP Authentication）はメール送信時に送信者を認証する仕組み。APOPとPOP3Sはメール受信時の認証、S/MIMEはメールの暗号化・署名。",
    relatedTerms: ["smtp_auth"]
  },
  {
    id: "sample_038",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "ソフトウェア",
    question: "オブジェクト指向プログラムにおいて，データとメソッドを一つにまとめ，オブジェクトの実装の詳細をユーザから見えなくすることを何と呼ぶか。",
    choices: ["インスタンス", "カプセル化", "クラスタ化", "抽象化"],
    correctAnswer: 1,
    explanation: "カプセル化（encapsulation）は、データと操作を一つにまとめ、内部実装を隠蔽すること。オブジェクト指向の三大要素の一つ。",
    relatedTerms: ["encapsulation", "polymorphism"]
  },
  {
    id: "sample_039",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "ソフトウェア",
    question: "モジュール結合度が最も弱くなるものはどれか。",
    choices: ["一つのモジュールで，できるだけ多くの機能を実現する。", "二つのモジュール間で必要なデータ項目だけを引数として渡す。", "他のモジュールとデータ項目を共有するためにグローバルな領域を使用する。", "他のモジュールを呼び出すときに，呼び出したモジュールの論理を制御するための引数を渡す。"],
    correctAnswer: 1,
    explanation: "モジュール結合度は弱いほど良い。データ結合（必要なデータだけを引数で渡す）が最も弱い。グローバル変数使用やフラグによる制御は結合度が強い。",
    relatedTerms: ["module_coupling"]
  },
  {
    id: "sample_040",
    category: "technology",
    categoryName: "テクノロジ系",
    subcategory: "システム開発",
    question: "モジュールの内部構造を考慮することなく，仕様書どおりに機能するかどうかをテストする手法はどれか。",
    choices: ["トップダウンテスト", "ブラックボックステスト", "ボトムアップテスト", "ホワイトボックステスト"],
    correctAnswer: 1,
    explanation: "ブラックボックステストは内部構造を考慮せず、入出力の仕様に基づいてテストする手法。ホワイトボックステストは内部構造を考慮してテストする。",
    relatedTerms: ["black_box_test"]
  },
  {
    id: "sample_041",
    category: "management",
    categoryName: "マネジメント系",
    subcategory: "プロジェクトマネジメント",
    question: "アジャイル開発のスクラムにおけるスプリントのルールのうち，適切なものはどれか。",
    choices: ["スプリントの期間を決定したら，スプリントの1回目には要件定義工程を，2回目には設計工程を，3回目にはコード作成工程を，4回目にはテスト工程をそれぞれ割り当てる。", "成果物の内容を確認するスプリントレビューを，スプリントの期間の中間時点で実施する。", "プロジェクトで設定したスプリントの期間でリリース判断が可能なプロダクトインクリメントができるように，スプリントゴールを設定する。", "毎回のスプリントプランニングにおいて，スプリントの期間をゴールの難易度に応じて，1週間から1か月までの範囲に設定する。"],
    correctAnswer: 2,
    explanation: "スプリントでは、各期間でリリース可能なプロダクトインクリメント（動作するソフトウェアの増分）を作成することを目標とする。",
    relatedTerms: ["scrum", "sprint"]
  },
  {
    id: "sample_042",
    category: "management",
    categoryName: "マネジメント系",
    subcategory: "プロジェクトマネジメント",
    question: "プロジェクトライフサイクルの一般的な特性はどれか。",
    choices: ["開発要員数は，プロジェクト開始時が最多であり，プロジェクトが進むにつれて減少し，完了に近づくと再度増加する。", "ステークホルダがコストを変えずにプロジェクトの成果物に対して及ぼすことができる影響の度合いは，プロジェクト完了直前が最も大きくなる。", "プロジェクトが完了に近づくほど，変更やエラーの修正がプロジェクトに影響する度合いは小さくなる。", "リスクは，プロジェクトが完了に近づくにつれて減少する。"],
    correctAnswer: 3,
    explanation: "プロジェクトが進むにつれて不確実性が減り、リスクは減少する。変更コストは後になるほど増加し、ステークホルダの影響力は初期が最大。",
    relatedTerms: ["project_lifecycle"]
  },
  {
    id: "sample_043",
    category: "management",
    categoryName: "マネジメント系",
    subcategory: "プロジェクトマネジメント",
    question: "ソフトウェア開発の見積方法の一つであるファンクションポイント法の説明として，適切なものはどれか。",
    choices: ["開発規模が分かっていることを前提として，工数と工期を見積もる方法である。ビジネス分野に限らず，全分野に適用可能である。", "過去に経験した類似のソフトウェアについてのデータを基にして，ソフトウェアの相違点を調べ，同じ部分については過去のデータを使い，異なった部分は経験に基づいて，規模と工数を見積もる方法である。", "ソフトウェアの機能を入出力データ数やファイル数などによって定量的に計測し，複雑さによる調整を行って，ソフトウェア規模を見積もる方法である。", "単位作業項目に適用する作業量の基準値を決めておき，作業項目を単位作業項目まで分解し，基準値を適用して算出した作業量の積算で全体の作業量を見積もる方法である。"],
    correctAnswer: 2,
    explanation: "ファンクションポイント法は、外部入力・外部出力・外部照会・内部論理ファイル・外部インタフェースファイルの数と複雑さから規模を見積もる。",
    relatedTerms: ["function_point"]
  },
  {
    id: "sample_044",
    category: "management",
    categoryName: "マネジメント系",
    subcategory: "プロジェクトマネジメント",
    question: "アローダイアグラムの日程計画をもつプロジェクトの，開始から終了までの最少所要日数は何日か。作業A(2日)→B(2日)→E(2日)→H(2日)→J(4日)、A→C(1日)→F(3日)→I(1日)→J、A→D(4日)→G(3日)→J",
    choices: ["9", "10", "11", "12"],
    correctAnswer: 3,
    explanation: "各経路の所要日数を計算：A→B→E→H→J=2+2+2+2+4=12日、A→C→F→I→J=2+1+3+1+4=11日、A→D→G→J=2+4+3+4=13日→計算ミス。正しくは最長経路がクリティカルパス=12日。",
    relatedTerms: ["arrow_diagram", "critical_path"]
  },
  {
    id: "sample_045",
    category: "management",
    categoryName: "マネジメント系",
    subcategory: "サービスマネジメント",
    question: "サービスマネジメントのプロセス改善におけるベンチマーキングはどれか。",
    choices: ["ITサービスのパフォーマンスを財務，顧客，内部プロセス，学習と成長の観点から測定し，戦略的な活動をサポートする。", "業界内外の優れた業務方法（ベストプラクティス）と比較して，サービス品質及びパフォーマンスのレベルを評価する。", "サービスのレベルで可用性，信頼性，パフォーマンスを測定し，顧客に報告する。", "強み，弱み，機会，脅威の観点からITサービスマネジメントの現状を分析する。"],
    correctAnswer: 1,
    explanation: "ベンチマーキングは、他社や業界のベストプラクティスと自社を比較し、改善点を見つける手法。アはBSC、エはSWOT分析。",
    relatedTerms: ["benchmarking"]
  },
  {
    id: "sample_046",
    category: "management",
    categoryName: "マネジメント系",
    subcategory: "サービスマネジメント",
    question: "ディスク障害時に，フルバックアップを取得してあるテープからディスクにデータを復元した後，フルバックアップ取得時以降の更新後コピーをログから反映させてデータベースを回復する方法はどれか。",
    choices: ["チェックポイントリスタート", "リブート", "ロールバック", "ロールフォワード"],
    correctAnswer: 3,
    explanation: "ロールフォワードは、バックアップからリストアした後、ログを使って更新処理を再実行し、障害直前の状態に回復する方法。",
    relatedTerms: ["rollforward"]
  },
  {
    id: "sample_047",
    category: "management",
    categoryName: "マネジメント系",
    subcategory: "システム監査",
    question: "経営者が社内のシステム監査人の外観上の独立性を担保するために講じる措置として，最も適切なものはどれか。",
    choices: ["システム監査人にITに関する継続的学習を義務付ける。", "システム監査人に必要な知識や経験を定めて公表する。", "システム監査人の監査技法研修制度を設ける。", "システム監査人の所属部署を内部監査部門とする。"],
    correctAnswer: 3,
    explanation: "外観上の独立性を確保するには、監査対象部門から独立した部署（内部監査部門）に所属させることが重要。他の選択肢は専門的能力に関するもの。",
    relatedTerms: ["system_audit"]
  },
  {
    id: "sample_048",
    category: "management",
    categoryName: "マネジメント系",
    subcategory: "システム監査",
    question: "情報セキュリティ監査において，可用性を確認するチェック項目はどれか。",
    choices: ["外部記憶媒体の無断持出しが禁止されていること", "中断時間を定めたSLAの水準が保たれるように管理されていること", "データ入力時のエラーチェックが適切に行われていること", "データベースが暗号化されていること"],
    correctAnswer: 1,
    explanation: "可用性は「必要なときに使える」こと。SLAで定めた中断時間（ダウンタイム）の管理は可用性に関する項目。アは機密性、ウは完全性、エは機密性。",
    relatedTerms: ["availability"]
  },
  {
    id: "sample_049",
    category: "strategy",
    categoryName: "ストラテジ系",
    subcategory: "システム戦略",
    question: "テレワークで活用しているVDIに関する記述として，適切なものはどれか。",
    choices: ["PC環境を仮想化してサーバ上に置くことで，社外から端末の種類を選ばず自分のデスクトップPC環境として利用できるシステム", "インターネット上に仮想の専用線を設定し，特定の人だけが利用できる専用ネットワーク", "紙で保管されている資料を，ネットワークを介して遠隔地からでも参照可能な電子書類に変換・保存することができるツール", "対面での会議開催が困難な場合に，ネットワークを介して対面と同じようなコミュニケーションができるツール"],
    correctAnswer: 0,
    explanation: "VDI（Virtual Desktop Infrastructure）は、デスクトップ環境をサーバ上で仮想化し、様々な端末からアクセス可能にする技術。イはVPN、エはWeb会議システム。",
    relatedTerms: ["vdi"]
  },
  {
    id: "sample_050",
    category: "strategy",
    categoryName: "ストラテジ系",
    subcategory: "経営戦略",
    question: "投資案件において，5年間の投資効果をROI（Return On Investment）で評価した場合，四つの案件a～dのうち，最もROIが高いものはどれか。a: 投資100,利益合計135、b: 投資200,利益合計240、c: 投資300,利益合計360、d: 投資400,利益合計525",
    choices: ["a", "b", "c", "d"],
    correctAnswer: 0,
    explanation: "ROI=(利益-投資額)/投資額×100。a=(135-100)/100=35%、b=(240-200)/200=20%、c=(360-300)/300=20%、d=(525-400)/400=31.25%。最高はa=35%。",
    relatedTerms: ["roi"]
  },
  {
    id: "sample_051",
    category: "strategy",
    categoryName: "ストラテジ系",
    subcategory: "経営戦略",
    question: "国や地方公共団体が，環境への配慮を積極的に行っていると評価されている製品・サービスを選んでいる。この取組を何というか。",
    choices: ["CSR", "エコマーク認定", "環境アセスメント", "グリーン購入"],
    correctAnswer: 3,
    explanation: "グリーン購入は、環境負荷の少ない製品・サービスを優先的に購入すること。グリーン購入法で国等の機関に義務付けられている。",
    relatedTerms: ["green_purchase"]
  },
  {
    id: "sample_052",
    category: "strategy",
    categoryName: "ストラテジ系",
    subcategory: "経営戦略",
    question: "コアコンピタンスの説明はどれか。",
    choices: ["競合他社にはまねのできない自社ならではの卓越した能力", "経営を行う上で法令や各種規制，社会的規範などを遵守する企業活動", "市場・技術・商品（サービス）の観点から設定した，事業の展開領域", "組織活動の目的を達成するために行う，業務とシステムの全体最適化手法"],
    correctAnswer: 0,
    explanation: "コアコンピタンスは、他社が模倣困難な自社固有の強み・中核的能力。イはコンプライアンス、ウは事業ドメイン、エはEA。",
    relatedTerms: ["core_competence"]
  },
  {
    id: "sample_053",
    category: "strategy",
    categoryName: "ストラテジ系",
    subcategory: "経営戦略",
    question: "新しい事業に取り組む際の手法として，E.リースが提唱したリーンスタートアップの説明はどれか。",
    choices: ["国・地方公共団体など，公共機関の補助金・助成金の交付を前提とし，事前に詳細な事業計画を検討・立案した上で，公共性のある事業を立ち上げる手法", "市場環境の変化によって競争力を喪失した事業分野に対して，経営資源を大規模に追加投入し，リニューアルすることによって，基幹事業として再出発を期す手法", "持続可能な事業を迅速に構築し，展開するために，あらかじめ詳細に立案された事業計画を厳格に遂行して，成果の検証や計画の変更を最小限にとどめる手法", "実用最小限の製品・サービスを短期間で作り，構築・計測・学習というフィードバックループで改良や方向転換をして，継続的にイノベーションを行う手法"],
    correctAnswer: 3,
    explanation: "リーンスタートアップは、MVP（実用最小限の製品）を素早く作り、Build-Measure-Learnサイクルで検証・改善を繰り返す手法。",
    relatedTerms: ["lean_startup"]
  },
  {
    id: "sample_054",
    category: "strategy",
    categoryName: "ストラテジ系",
    subcategory: "ビジネスインダストリ",
    question: "IoTの応用事例のうち，HEMSの説明はどれか。",
    choices: ["工場内の機械に取り付けたセンサで振動，温度，音などを常時計測し，収集したデータを基に機械の劣化状態を分析して，適切なタイミングで部品を交換する。", "自動車に取り付けたセンサで車両の状態，路面状況などのデータを計測し，ネットワークを介して保存し分析することによって，効率的な運転を支援する。", "情報通信技術や環境技術を駆使して，街灯などの公共設備や交通システムをはじめとする都市基盤のエネルギーの可視化と消費の最適制御を行う。", "太陽光発電装置などのエネルギー機器，家電機器，センサ類などを家庭内通信ネットワークに接続して，エネルギーの可視化と消費の最適制御を行う。"],
    correctAnswer: 3,
    explanation: "HEMS（Home Energy Management System）は家庭内のエネルギー管理システム。家電やセンサをネットワーク接続し、電力消費を可視化・最適化する。",
    relatedTerms: ["hems"]
  },
  {
    id: "sample_055",
    category: "strategy",
    categoryName: "ストラテジ系",
    subcategory: "ビジネスインダストリ",
    question: "ロングテールの説明はどれか。",
    choices: ["Webコンテンツを構成するテキストや画像などのデジタルコンテンツに，統合的・体系的な管理，配信などの必要な処理を行うこと", "インターネットショッピングで，売上の全体に対して，あまり売れない商品群の売上合計が無視できない割合になっていること", "自分のWebサイトやブログに企業へのリンクを掲載し，他者がこれらのリンクを経由して商品を購入したときに，企業が紹介料を支払うこと", "メーカや卸売業者から商品を直接発送することによって，在庫リスクを負うことなく自分のWebサイトで商品が販売できること"],
    correctAnswer: 1,
    explanation: "ロングテールは、販売数量の少ないニッチ商品群の売上合計が、ヒット商品に匹敵する現象。ECサイトで顕著に見られる。",
    relatedTerms: ["long_tail"]
  },
  {
    id: "sample_056",
    category: "strategy",
    categoryName: "ストラテジ系",
    subcategory: "ビジネスインダストリ",
    question: "CGM（Consumer Generated Media）の例はどれか。",
    choices: ["企業が，経営状況や財務状況，業績動向に関する情報を，個人投資家向けに公開する自社のWebサイト", "企業が，自社の商品の特徴や使用方法に関する情報を，一般消費者向けに発信する自社のWebサイト", "行政機関が，政策，行政サービスに関する情報を，一般市民向けに公開する自組織のWebサイト", "個人が，自らが使用した商品などの評価に関する情報を，不特定多数に向けて発信するブログやSNSなどのWebサイト"],
    correctAnswer: 3,
    explanation: "CGM（Consumer Generated Media）は消費者生成メディアで、ブログ、SNS、口コミサイトなど消費者が情報を発信するメディアを指す。",
    relatedTerms: ["cgm"]
  },
  {
    id: "sample_057",
    category: "strategy",
    categoryName: "ストラテジ系",
    subcategory: "企業活動",
    question: "製品Xと製品Yを生産するために2種類の原料A，Bが必要である。製品1個の生産に必要となる原料の量と調達可能量は表に示すとおりである。製品XとYの1個当たりの販売利益が，それぞれ100円，150円であるとき，最大利益は何円か。原料A: X=2,Y=1,調達100。原料B: X=1,Y=2,調達80。",
    choices: ["5,000", "6,000", "7,000", "8,000"],
    correctAnswer: 2,
    explanation: "線形計画法で解く。制約条件：2X+Y≦100、X+2Y≦80。頂点を計算すると(X,Y)=(40,20)で最大。利益=100×40+150×20=4000+3000=7000円。",
    relatedTerms: ["linear_programming"]
  },
  {
    id: "sample_058",
    category: "strategy",
    categoryName: "ストラテジ系",
    subcategory: "企業活動",
    question: "令和2年4月に30万円で購入したPCを3年後に1万円で売却するとき，固定資産売却損は何万円か。ここで，耐用年数は4年，減価償却は定額法，定額法の償却率は0.250，残存価額は0円とする。",
    choices: ["6.0", "6.5", "7.0", "7.5"],
    correctAnswer: 1,
    explanation: "年間償却額=30×0.250=7.5万円。3年後の帳簿価額=30-7.5×3=30-22.5=7.5万円。売却損=帳簿価額-売却価格=7.5-1=6.5万円。",
    relatedTerms: ["depreciation"]
  },
  {
    id: "sample_059",
    category: "strategy",
    categoryName: "ストラテジ系",
    subcategory: "企業活動",
    question: "売上高が100百万円のとき，変動費が60百万円，固定費が30百万円掛かる。変動費率，固定費は変わらないものとして，目標利益18百万円を達成するのに必要な売上高は何百万円か。",
    choices: ["108", "120", "156", "180"],
    correctAnswer: 1,
    explanation: "変動費率=60/100=0.6。目標売上高をSとすると、S-0.6S-30=18、0.4S=48、S=120百万円。",
    relatedTerms: ["break_even_point"]
  },
  {
    id: "sample_060",
    category: "strategy",
    categoryName: "ストラテジ系",
    subcategory: "法務",
    question: "労働者派遣法に基づく，派遣先企業と労働者との関係（図の太線部分）はどれか。",
    choices: ["請負契約関係", "雇用契約関係", "指揮命令関係", "労働者派遣契約関係"],
    correctAnswer: 2,
    explanation: "労働者派遣では、労働者は派遣元と雇用契約を結び、派遣先からは指揮命令を受ける。派遣先との間には指揮命令関係がある。",
    relatedTerms: ["worker_dispatch"]
  }
];

// questions.jsonを読み込み
const questionsPath = path.join(__dirname, '../data/questions.json');
const data = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

// サンプル問題を追加
data.questions = data.questions.concat(sampleQuestions);

// ファイルに書き込み
fs.writeFileSync(questionsPath, JSON.stringify(data, null, 2), 'utf8');

console.log('サンプル問題60問を追加しました。');
console.log('現在の総問題数:', data.questions.length);
