"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EXTRA_GRAMMAR,
  EXTRA_INDONESIAN_TRANSLATIONS,
  EXTRA_PHRASES,
  EXTRA_SECOND_WORD_EXAMPLES,
  EXTRA_WORDS
} from "./expanded-study-data";
import {
  MORE_GRAMMAR,
  MORE_INDONESIAN_TRANSLATIONS,
  MORE_PHRASES,
  MORE_SECOND_WORD_EXAMPLES,
  MORE_WORDS
} from "./more-study-data";
import {
  FURTHER_GRAMMAR,
  FURTHER_INDONESIAN_TRANSLATIONS,
  FURTHER_PHRASES,
  FURTHER_SECOND_WORD_EXAMPLES,
  FURTHER_WORDS
} from "./further-study-data";
import { IDIOMS, IDIOM_INDONESIAN_TRANSLATIONS, IDIOM_SECOND_EXAMPLES } from "./idiom-study-data";
import { NON_WORD_SECOND_EXAMPLES } from "./non-word-second-examples";

type Level = "A1" | "A2" | "B1";
type Mode = "words" | "phrases" | "grammar" | "idioms";
type Status = "new" | "hard" | "known";
type ExamplePair = { english: string; japanese: string };

type StudyItem = {
  id: string;
  level: Level;
  term: string;
  japanese: string;
  category: string;
  label: string;
  pronunciation?: string;
  example: string;
  exampleJapanese: string;
  note: string;
  pattern?: string;
};

const STORAGE_KEY = "english-study-progress-v1";
const LEVELS: Array<"all" | Level> = ["all", "A1", "A2", "B1"];

const INDONESIAN_TRANSLATIONS: Record<string, string> = {
  "w-001": "adalah; berada", "w-002": "memiliki; makan", "w-003": "pergi", "w-004": "datang", "w-005": "ingin", "w-006": "membutuhkan", "w-007": "tahu", "w-008": "membuat", "w-009": "mengambil; membutuhkan waktu", "w-010": "waktu; jam",
  "w-011": "tempat", "w-012": "orang-orang", "w-013": "hari ini", "w-014": "lebih awal; awal", "w-015": "selalu", "w-016": "baik; bagus", "w-017": "berbeda", "w-018": "penting", "w-019": "memilih", "w-020": "memutuskan",
  "w-021": "menjelaskan", "w-022": "mengingat", "w-023": "bepergian; perjalanan", "w-024": "tersedia", "w-025": "nyaman", "w-026": "mungkin", "w-027": "meningkatkan", "w-028": "menyarankan", "w-029": "kesempatan", "w-030": "percaya diri",
  "p-001": "Senang bertemu dengan Anda.", "p-002": "Apa kabar?", "p-003": "Bisakah Anda membantu saya?", "p-004": "Saya tidak mengerti.", "p-005": "Berapa harganya?", "p-006": "Saya ingin ...", "p-007": "Apa maksud Anda?", "p-008": "Kedengarannya bagus.", "p-009": "Apakah Anda keberatan ...?", "p-010": "Menurut pendapat saya, ...",
  "g-001": "menyatakan keadaan atau identitas subjek", "g-002": "menyatakan kebiasaan atau fakta", "g-003": "dapat; bisa", "g-004": "menyatakan kejadian masa lalu", "g-005": "lebih ...", "g-006": "sedang ...", "g-007": "menyatakan pengalaman, kelanjutan, atau penyelesaian", "g-008": "untuk melakukan; melakukan", "g-009": "menjelaskan kata benda dari belakang",
  ...EXTRA_INDONESIAN_TRANSLATIONS,
  ...MORE_INDONESIAN_TRANSLATIONS,
  ...FURTHER_INDONESIAN_TRANSLATIONS,
  ...IDIOM_INDONESIAN_TRANSLATIONS
};

const SECOND_EXAMPLES: Record<string, ExamplePair> = {
  "w-001": { english: "This book is useful.", japanese: "この本は役に立ちます。" },
  "w-002": { english: "I have a meeting at three.", japanese: "私は3時に会議があります。" },
  "w-003": { english: "We go to the park on Sundays.", japanese: "私たちは日曜日に公園へ行きます。" },
  "w-004": { english: "My train comes at seven.", japanese: "私の電車は7時に来ます。" },
  "w-005": { english: "They want a new computer.", japanese: "彼らは新しいコンピューターを欲しがっています。" },
  "w-006": { english: "You need to bring your passport.", japanese: "パスポートを持ってくる必要があります。" },
  "w-007": { english: "Do you know his phone number?", japanese: "彼の電話番号を知っていますか。" },
  "w-008": { english: "Let's make a list.", japanese: "リストを作りましょう。" },
  "w-009": { english: "Please take an umbrella.", japanese: "傘を持っていってください。" },
  "w-010": { english: "I don't have much time.", japanese: "私はあまり時間がありません。" },
  "w-011": { english: "Is there a good place to eat?", japanese: "食事をするのに良い場所はありますか。" },
  "w-012": { english: "People are waiting outside.", japanese: "人々が外で待っています。" },
  "w-013": { english: "What are you doing today?", japanese: "今日は何をしていますか。" },
  "w-014": { english: "She got up early.", japanese: "彼女は早く起きました。" },
  "w-015": { english: "I always check my email.", japanese: "私はいつもメールを確認します。" },
  "w-016": { english: "Your idea is good.", japanese: "あなたの考えは良いです。" },
  "w-017": { english: "This one looks different.", japanese: "こちらは違って見えます。" },
  "w-018": { english: "It's important to ask questions.", japanese: "質問することは大切です。" },
  "w-019": { english: "Choose the answer carefully.", japanese: "答えを注意深く選んでください。" },
  "w-020": { english: "Have you decided yet?", japanese: "もう決めましたか。" },
  "w-021": { english: "The guide explained the rules.", japanese: "ガイドがルールを説明しました。" },
  "w-022": { english: "Please remember to call me.", japanese: "忘れずに私へ電話してください。" },
  "w-023": { english: "I want to travel abroad.", japanese: "私は海外旅行をしたいです。" },
  "w-024": { english: "The doctor is available tomorrow.", japanese: "その医師は明日診察できます。" },
  "w-025": { english: "The room is comfortable and clean.", japanese: "その部屋は快適で清潔です。" },
  "w-026": { english: "He will probably be late.", japanese: "彼はたぶん遅れるでしょう。" },
  "w-027": { english: "Reading will improve your vocabulary.", japanese: "読書はあなたの語彙力を向上させます。" },
  "w-028": { english: "She suggested a different time.", japanese: "彼女は別の時間を提案しました。" },
  "w-029": { english: "This job is a good opportunity.", japanese: "この仕事は良い機会です。" },
  "w-030": { english: "You can feel more confident in your English with practice.", japanese: "練習すれば、英語にもっと自信を持てます。" },
  ...EXTRA_SECOND_WORD_EXAMPLES,
  ...MORE_SECOND_WORD_EXAMPLES,
  ...FURTHER_SECOND_WORD_EXAMPLES,
  ...NON_WORD_SECOND_EXAMPLES,
  ...IDIOM_SECOND_EXAMPLES
};

const WORDS: StudyItem[] = [
  { id: "w-001", level: "A1", term: "be", japanese: "〜です、〜である", category: "基本", label: "動詞", pronunciation: "/biː/", example: "I am ready.", exampleJapanese: "私は準備ができています。", note: "I am / you are / he is のように主語で形が変わります。" },
  { id: "w-002", level: "A1", term: "have", japanese: "持っている、食べる", category: "基本", label: "動詞", pronunciation: "/hæv/", example: "We have lunch at noon.", exampleJapanese: "私たちは正午に昼食をとります。", note: "食事をとる意味でもよく使います。" },
  { id: "w-003", level: "A1", term: "go", japanese: "行く", category: "移動", label: "動詞", pronunciation: "/ɡoʊ/", example: "She goes to work by train.", exampleJapanese: "彼女は電車で仕事に行きます。", note: "三人称単数の現在形は goes。" },
  { id: "w-004", level: "A1", term: "come", japanese: "来る", category: "移動", label: "動詞", pronunciation: "/kʌm/", example: "Can you come here?", exampleJapanese: "ここに来られますか。", note: "話し手のいる場所への移動に使います。" },
  { id: "w-005", level: "A1", term: "want", japanese: "欲しい、〜したい", category: "基本", label: "動詞", pronunciation: "/wɑːnt/", example: "I want to learn English.", exampleJapanese: "私は英語を学びたいです。", note: "want to + 動詞で「〜したい」。" },
  { id: "w-006", level: "A1", term: "need", japanese: "必要とする", category: "基本", label: "動詞", pronunciation: "/niːd/", example: "Do you need help?", exampleJapanese: "助けが必要ですか。", note: "need + 名詞 / need to + 動詞 の形を使います。" },
  { id: "w-007", level: "A1", term: "know", japanese: "知っている、わかる", category: "基本", label: "動詞", pronunciation: "/noʊ/", example: "I know that place.", exampleJapanese: "私はその場所を知っています。", note: "人や事実を知っているときに使います。" },
  { id: "w-008", level: "A1", term: "make", japanese: "作る", category: "日常", label: "動詞", pronunciation: "/meɪk/", example: "He makes coffee every morning.", exampleJapanese: "彼は毎朝コーヒーを作ります。", note: "make breakfast, make a plan など幅広く使います。" },
  { id: "w-009", level: "A1", term: "take", japanese: "取る、かかる", category: "日常", label: "動詞", pronunciation: "/teɪk/", example: "It takes ten minutes.", exampleJapanese: "10分かかります。", note: "時間がかかるときは It takes ... を使います。" },
  { id: "w-010", level: "A1", term: "time", japanese: "時間、時刻", category: "基本", label: "名詞", pronunciation: "/taɪm/", example: "What time is it?", exampleJapanese: "何時ですか。", note: "時刻を聞く定番の表現です。" },
  { id: "w-011", level: "A1", term: "place", japanese: "場所", category: "移動", label: "名詞", pronunciation: "/pleɪs/", example: "This is a quiet place.", exampleJapanese: "ここは静かな場所です。", note: "場所を指す便利な基本語です。" },
  { id: "w-012", level: "A1", term: "people", japanese: "人々、人", category: "人", label: "名詞", pronunciation: "/ˈpiːpəl/", example: "Many people use this app.", exampleJapanese: "多くの人がこのアプリを使います。", note: "複数形の意味で使われる名詞です。" },
  { id: "w-013", level: "A1", term: "today", japanese: "今日", category: "時間", label: "副詞", pronunciation: "/təˈdeɪ/", example: "I am busy today.", exampleJapanese: "私は今日忙しいです。", note: "文の最初にも最後にも置けます。" },
  { id: "w-014", level: "A1", term: "early", japanese: "早く、早い", category: "時間", label: "副詞", pronunciation: "/ˈɜːrli/", example: "Let's meet early.", exampleJapanese: "早めに会いましょう。", note: "形容詞としても副詞としても使えます。" },
  { id: "w-015", level: "A1", term: "always", japanese: "いつも", category: "時間", label: "副詞", pronunciation: "/ˈɔːlweɪz/", example: "They always arrive on time.", exampleJapanese: "彼らはいつも時間どおりに到着します。", note: "一般動詞の前、be動詞の後に置くのが基本です。" },
  { id: "w-016", level: "A1", term: "good", japanese: "良い", category: "感情・状態", label: "形容詞", pronunciation: "/ɡʊd/", example: "That sounds good.", exampleJapanese: "それはいいですね。", note: "提案への前向きな返答にも使えます。" },
  { id: "w-017", level: "A1", term: "different", japanese: "違う、異なる", category: "感情・状態", label: "形容詞", pronunciation: "/ˈdɪfrənt/", example: "My answer is different.", exampleJapanese: "私の答えは違います。", note: "different from ... で「〜とは異なる」。" },
  { id: "w-018", level: "A1", term: "important", japanese: "重要な", category: "仕事・学習", label: "形容詞", pronunciation: "/ɪmˈpɔːrtənt/", example: "Sleep is important.", exampleJapanese: "睡眠は大切です。", note: "It is important to ... の形もよく使います。" },
  { id: "w-019", level: "A2", term: "choose", japanese: "選ぶ", category: "日常", label: "動詞", pronunciation: "/tʃuːz/", example: "You can choose any color.", exampleJapanese: "どの色でも選べます。", note: "過去形は chose、過去分詞は chosen。" },
  { id: "w-020", level: "A2", term: "decide", japanese: "決める", category: "仕事・学習", label: "動詞", pronunciation: "/dɪˈsaɪd/", example: "We decided to stay home.", exampleJapanese: "私たちは家にいることに決めました。", note: "decide to + 動詞で「〜することに決める」。" },
  { id: "w-021", level: "A2", term: "explain", japanese: "説明する", category: "仕事・学習", label: "動詞", pronunciation: "/ɪkˈspleɪn/", example: "Could you explain this word?", exampleJapanese: "この単語を説明してもらえますか。", note: "explain + 名詞 / explain ... to 人。" },
  { id: "w-022", level: "A2", term: "remember", japanese: "覚えている", category: "仕事・学習", label: "動詞", pronunciation: "/rɪˈmembər/", example: "I remember her name.", exampleJapanese: "私は彼女の名前を覚えています。", note: "remember to do は「忘れずにする」。" },
  { id: "w-023", level: "A2", term: "travel", japanese: "旅行する、旅行", category: "移動", label: "動詞", pronunciation: "/ˈtrævəl/", example: "They travel every summer.", exampleJapanese: "彼らは毎年夏に旅行します。", note: "動詞にも名詞にもなります。" },
  { id: "w-024", level: "A2", term: "available", japanese: "利用できる、空いている", category: "仕事・学習", label: "形容詞", pronunciation: "/əˈveɪləbəl/", example: "Is this seat available?", exampleJapanese: "この席は空いていますか。", note: "予約や在庫の確認にも使えます。" },
  { id: "w-025", level: "A2", term: "comfortable", japanese: "快適な", category: "感情・状態", label: "形容詞", pronunciation: "/ˈkʌmftərbəl/", example: "These shoes are comfortable.", exampleJapanese: "この靴は履き心地が良いです。", note: "comfort の形容詞形です。" },
  { id: "w-026", level: "A2", term: "probably", japanese: "たぶん", category: "感情・状態", label: "副詞", pronunciation: "/ˈprɑːbəbli/", example: "It will probably rain.", exampleJapanese: "たぶん雨が降るでしょう。", note: "will の後、一般動詞の前に置くことが多いです。" },
  { id: "w-027", level: "B1", term: "improve", japanese: "改善する、上達する", category: "仕事・学習", label: "動詞", pronunciation: "/ɪmˈpruːv/", example: "Practice improves your speaking.", exampleJapanese: "練習はスピーキングを向上させます。", note: "improve skills のように目的語を取れます。" },
  { id: "w-028", level: "B1", term: "suggest", japanese: "提案する", category: "仕事・学習", label: "動詞", pronunciation: "/səˈdʒest/", example: "I suggest taking a break.", exampleJapanese: "休憩を取ることを提案します。", note: "suggest の後は名詞か -ing を置きます。" },
  { id: "w-029", level: "B1", term: "opportunity", japanese: "機会", category: "仕事・学習", label: "名詞", pronunciation: "/ˌɑːpərˈtuːnəti/", example: "This is a great opportunity.", exampleJapanese: "これは素晴らしい機会です。", note: "an opportunity to + 動詞 の形も重要です。" },
  { id: "w-030", level: "B1", term: "confident", japanese: "自信がある", category: "感情・状態", label: "形容詞", pronunciation: "/ˈkɑːnfɪdənt/", example: "She feels confident about the interview.", exampleJapanese: "彼女はその面接について自信があります。", note: "confident about + 話題 / confident in + 能力 の形で使います。" }
];

const PHRASES: StudyItem[] = [
  { id: "p-001", level: "A1", term: "Nice to meet you.", japanese: "はじめまして。", category: "あいさつ", label: "定型表現", example: "Nice to meet you. I'm Ken.", exampleJapanese: "はじめまして。私はケンです。", note: "初対面で使う定番のあいさつです。" },
  { id: "p-002", level: "A1", term: "How are you?", japanese: "元気ですか。", category: "あいさつ", label: "定型表現", example: "How are you? - I'm fine, thanks.", exampleJapanese: "元気ですか。- 元気です、ありがとう。", note: "気軽なあいさつとして使えます。" },
  { id: "p-003", level: "A1", term: "Could you help me?", japanese: "手伝っていただけますか。", category: "お願い", label: "定型表現", example: "Could you help me with this bag?", exampleJapanese: "このバッグを手伝っていただけますか。", note: "Can you ...? より少し丁寧な言い方です。" },
  { id: "p-004", level: "A1", term: "I don't understand.", japanese: "わかりません。", category: "会話", label: "定型表現", example: "Sorry, I don't understand.", exampleJapanese: "すみません、わかりません。", note: "聞き返したいときにそのまま使えます。" },
  { id: "p-005", level: "A1", term: "How much is it?", japanese: "いくらですか。", category: "買い物", label: "定型表現", example: "How much is it? - It's five dollars.", exampleJapanese: "いくらですか。- 5ドルです。", note: "値段を尋ねる基本表現です。" },
  { id: "p-006", level: "A2", term: "I'd like to ...", japanese: "〜したいのですが。", category: "お願い", label: "定型表現", example: "I'd like to make a reservation.", exampleJapanese: "予約をしたいのですが。", note: "I would like to の短縮形で、丁寧な希望を伝えます。" },
  { id: "p-007", level: "A2", term: "What do you mean?", japanese: "どういう意味ですか。", category: "会話", label: "定型表現", example: "What do you mean by that?", exampleJapanese: "それはどういう意味ですか。", note: "意味をたずねるときに便利です。" },
  { id: "p-008", level: "A2", term: "That sounds great.", japanese: "それはいいですね。", category: "会話", label: "定型表現", example: "Let's have lunch. - That sounds great.", exampleJapanese: "ランチに行きましょう。- それはいいですね。", note: "提案への自然で前向きな返事です。" },
  { id: "p-009", level: "B1", term: "Would you mind ...?", japanese: "〜していただけますか。", category: "お願い", label: "定型表現", example: "Would you mind speaking slowly?", exampleJapanese: "ゆっくり話していただけますか。", note: "後ろには動詞の -ing 形を置きます。" },
  { id: "p-010", level: "B1", term: "In my opinion, ...", japanese: "私の意見では、〜です。", category: "意見", label: "定型表現", example: "In my opinion, this plan will work.", exampleJapanese: "私の意見では、この計画はうまくいくと思います。", note: "自分の意見を穏やかに述べる表現です。" }
];

const GRAMMAR: StudyItem[] = [
  { id: "g-001", level: "A1", term: "be動詞", japanese: "主語の状態・身分を表す", category: "基本文", label: "文法", pattern: "I am / You are / He is", example: "She is my teacher.", exampleJapanese: "彼女は私の先生です。", note: "否定は am not / are not / is not。疑問文では be動詞を先頭に置きます。" },
  { id: "g-002", level: "A1", term: "現在形", japanese: "習慣・事実を表す", category: "基本文", label: "文法", pattern: "I work / He works", example: "He works every day.", exampleJapanese: "彼は毎日働きます。", note: "主語が he, she, it のとき、一般動詞に -s / -es を付けます。" },
  { id: "g-003", level: "A1", term: "can", japanese: "〜できる", category: "助動詞", label: "文法", pattern: "can + 動詞の原形", example: "I can speak a little English.", exampleJapanese: "私は少し英語を話せます。", note: "can の後は常に動詞の原形です。" },
  { id: "g-004", level: "A2", term: "過去形", japanese: "過去の出来事を表す", category: "時制", label: "文法", pattern: "did / went / was", example: "We visited Kyoto last year.", exampleJapanese: "私たちは昨年京都を訪れました。", note: "規則動詞は -ed、不規則動詞は個別に覚えます。" },
  { id: "g-005", level: "A2", term: "比較級", japanese: "より〜だ", category: "比較", label: "文法", pattern: "-er than / more ... than", example: "This book is easier than that one.", exampleJapanese: "この本はあの本より簡単です。", note: "短い形容詞には -er、長い語には more を使います。" },
  { id: "g-006", level: "A2", term: "現在進行形", japanese: "いま〜している", category: "時制", label: "文法", pattern: "be + 動詞-ing", example: "They are waiting outside.", exampleJapanese: "彼らは外で待っています。", note: "be動詞を忘れないことが大切です。" },
  { id: "g-007", level: "B1", term: "現在完了", japanese: "経験・継続・完了を表す", category: "時制", label: "文法", pattern: "have / has + 過去分詞", example: "I have lived here for five years.", exampleJapanese: "私はここに5年間住んでいます。", note: "for は期間、since は起点と一緒に使います。" },
  { id: "g-008", level: "B1", term: "不定詞", japanese: "〜すること、〜するために", category: "動詞の形", label: "文法", pattern: "to + 動詞の原形", example: "I decided to study abroad.", exampleJapanese: "私は留学することを決めました。", note: "動詞によって to不定詞を続けるかが決まります。" },
  { id: "g-009", level: "B1", term: "関係代名詞", japanese: "名詞を後ろから説明する", category: "文のつながり", label: "文法", pattern: "the person who ...", example: "The person who called you is my friend.", exampleJapanese: "あなたに電話した人は私の友人です。", note: "who は人、which は物を説明するときに使います。" }
];

const ALL_WORDS = [...WORDS, ...EXTRA_WORDS, ...MORE_WORDS, ...FURTHER_WORDS];
const ALL_PHRASES = [...PHRASES, ...EXTRA_PHRASES, ...MORE_PHRASES, ...FURTHER_PHRASES];
const ALL_GRAMMAR = [...GRAMMAR, ...EXTRA_GRAMMAR, ...MORE_GRAMMAR, ...FURTHER_GRAMMAR];
const ALL_IDIOMS = [...IDIOMS];

const MODE_COPY: Record<Mode, { title: string; list: string; front: string; reveal: string }> = {
  words: { title: "英単語カード", list: "単語一覧", front: "英単語", reveal: "意味を見る" },
  phrases: { title: "英会話フレーズ", list: "フレーズ一覧", front: "英会話フレーズ", reveal: "意味を見る" },
  grammar: { title: "英文法カード", list: "文法一覧", front: "英文法", reveal: "説明を見る" },
  idioms: { title: "英熟語カード", list: "熟語一覧", front: "英熟語", reveal: "意味を見る" }
};

function itemStatus(item: StudyItem, known: Set<string>, hard: Set<string>): Status {
  if (known.has(item.id)) return "known";
  if (hard.has(item.id)) return "hard";
  return "new";
}

function statusText(status: Status) {
  return { new: "未習得", hard: "苦手", known: "覚えた" }[status];
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("words");
  const [level, setLevel] = useState<"all" | Level>("all");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [hard, setHard] = useState<Set<string>>(new Set());
  const [isReady, setIsReady] = useState(false);

  const source = mode === "words" ? ALL_WORDS : mode === "phrases" ? ALL_PHRASES : mode === "grammar" ? ALL_GRAMMAR : ALL_IDIOMS;
  const categories = useMemo(() => Array.from(new Set(source.map((item) => item.category))), [source]);
  const visibleItems = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return source.filter((item) => {
      const matchesLevel = level === "all" || item.level === level;
      const matchesCategory = category === "all" || item.category === category;
      const matchesStatus = status === "all" || itemStatus(item, known, hard) === status;
      const secondExample = SECOND_EXAMPLES[item.id];
      const matchesSearch = !needle || [item.term, item.japanese, INDONESIAN_TRANSLATIONS[item.id], item.example, item.exampleJapanese, secondExample?.english, secondExample?.japanese, item.note, item.pattern, item.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
      return matchesLevel && matchesCategory && matchesStatus && matchesSearch;
    });
  }, [source, level, category, status, search, known, hard]);

  const current = visibleItems[index] ?? null;
  const stats = useMemo(() => ({
    total: visibleItems.length,
    known: visibleItems.filter((item) => known.has(item.id)).length,
    hard: visibleItems.filter((item) => hard.has(item.id)).length
  }), [visibleItems, known, hard]);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
      setKnown(new Set(saved.known || []));
      setHard(new Set(saved.hard || []));
    } catch {
      setKnown(new Set());
      setHard(new Set());
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ known: [...known], hard: [...hard] }));
  }, [known, hard, isReady]);

  useEffect(() => {
    setIndex((currentIndex) => Math.min(currentIndex, Math.max(0, visibleItems.length - 1)));
  }, [visibleItems.length]);

  function chooseMode(nextMode: Mode) {
    setMode(nextMode);
    setCategory("all");
    setIndex(0);
    setFlipped(false);
  }

  function chooseFilter(change: () => void) {
    change();
    setIndex(0);
    setFlipped(false);
  }

  function step(direction: number) {
    if (!visibleItems.length) return;
    setIndex((currentIndex) => (currentIndex + direction + visibleItems.length) % visibleItems.length);
    setFlipped(false);
  }

  function mark(nextStatus: "known" | "hard") {
    if (!current) return;
    if (nextStatus === "known") {
      setKnown((items) => new Set([...items, current.id]));
      setHard((items) => {
        const next = new Set(items);
        next.delete(current.id);
        return next;
      });
    } else {
      setHard((items) => new Set([...items, current.id]));
      setKnown((items) => {
        const next = new Set(items);
        next.delete(current.id);
        return next;
      });
    }
  }

  function shuffle() {
    if (visibleItems.length < 2) return;
    let next = index;
    while (next === index) next = Math.floor(Math.random() * visibleItems.length);
    setIndex(next);
    setFlipped(false);
  }

  function resetProgress() {
    if (!window.confirm("学習記録をすべて消去しますか？")) return;
    setKnown(new Set());
    setHard(new Set());
  }

  const copy = MODE_COPY[mode];
  const cardExamples: ExamplePair[] = current
    ? [
        { english: current.example, japanese: current.exampleJapanese },
        ...(SECOND_EXAMPLES[current.id] ? [SECOND_EXAMPLES[current.id]] : [])
      ]
    : [];

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">ENGLISH STUDY</p>
          <h1>{copy.title}</h1>
          <p className="subhead">見て、思い出して、残す。毎日の英語を自分のものに。</p>
        </div>
        <div className="stats" aria-label="学習状況">
          <div><strong>{stats.total}</strong><span>表示中</span></div>
          <div><strong>{stats.known}</strong><span>覚えた</span></div>
          <div><strong>{stats.hard}</strong><span>苦手</span></div>
        </div>
      </header>

      <nav className="mode-tabs" aria-label="学習モード">
        {(["words", "phrases", "grammar", "idioms"] as Mode[]).map((tab) => (
          <button className={mode === tab ? "active" : ""} onClick={() => chooseMode(tab)} type="button" key={tab}>
            {{ words: "単語", phrases: "フレーズ", grammar: "文法", idioms: "熟語" }[tab]}
          </button>
        ))}
      </nav>

      <section className="toolbar" aria-label="学習カードの絞り込み">
        <div className="level-tabs" role="tablist" aria-label="レベル">
          {LEVELS.map((item) => (
            <button className={level === item ? "active" : ""} onClick={() => chooseFilter(() => setLevel(item))} type="button" key={item}>
              {item === "all" ? "全レベル" : item}
            </button>
          ))}
        </div>
        <label className="field">
          <span>状態</span>
          <select value={status} onChange={(event) => chooseFilter(() => setStatus(event.target.value as "all" | Status))}>
            <option value="all">すべて</option><option value="new">未習得</option><option value="hard">苦手</option><option value="known">覚えた</option>
          </select>
        </label>
        <label className="field">
          <span>カテゴリー</span>
          <select value={category} onChange={(event) => chooseFilter(() => setCategory(event.target.value))}>
            <option value="all">すべて</option>
            {categories.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>
        <label className="field search-field">
          <span>検索</span>
          <input value={search} onChange={(event) => chooseFilter(() => setSearch(event.target.value))} type="search" placeholder="英語・日本語で検索" />
        </label>
      </section>

      <section className="study-layout">
        <section className="study-main" aria-label="フラッシュカード">
          <div className="card-meta"><span>{visibleItems.length ? `${index + 1} / ${visibleItems.length}` : "0 / 0"}</span><span>{current ? `${current.level} · ${current.label}` : ""}</span></div>
          <div className="card-controls">
            <button className="icon-button" onClick={() => step(-1)} type="button" aria-label="前のカード" title="前のカード">&lt;</button>
            <button className="reveal-button" onClick={() => setFlipped((value) => !value)} type="button" disabled={!current}>{flipped ? "表を見る" : copy.reveal}</button>
            <button className="icon-button" onClick={() => step(1)} type="button" aria-label="次のカード" title="次のカード">&gt;</button>
          </div>
          <div className="review-actions">
            <button className="review-button hard" onClick={() => mark("hard")} type="button" disabled={!current}>苦手</button>
            <button className="review-button known" onClick={() => mark("known")} type="button" disabled={!current}>覚えた</button>
            <button className="review-button neutral" onClick={shuffle} type="button" disabled={visibleItems.length < 2}>シャッフル</button>
          </div>
          {current ? (
            <article className={`flashcard ${flipped ? "is-back" : ""}`} tabIndex={0} onClick={() => setFlipped((value) => !value)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setFlipped((value) => !value); } }} role="button" aria-label="カードをめくる">
              {flipped ? (
                <div className="card-back">
                  <div className="back-title"><div><span className="face-label">意味</span><h2>{current.term}</h2></div><span className={`status-dot ${itemStatus(current, known, hard)}`}>{statusText(itemStatus(current, known, hard))}</span></div>
                  <div className="meaning">
                    <div><strong>{current.japanese}</strong></div>
                    <div className="translation"><strong>{INDONESIAN_TRANSLATIONS[current.id]}</strong></div>
                  </div>
                  {current.pattern && <div className="pattern"><span>形</span><code>{current.pattern}</code></div>}
                  <div className={`examples ${mode === "words" ? "is-word-examples" : ""}`}>
                    {cardExamples.map((example, exampleIndex) => <div className="example" key={`${current.id}-${exampleIndex}`}><span>{cardExamples.length > 1 ? `EXAMPLE ${exampleIndex + 1}` : "EXAMPLE"}</span><p>{example.english}</p><small>{example.japanese}</small></div>)}
                  </div>
                  <p className="note">{current.note}</p>
                </div>
              ) : (
                <div className="card-front">
                  <span className="face-label">{copy.front}</span>
                  <p className="term">{current.term}</p>
                  {current.pronunciation && <span className="pronunciation">{current.pronunciation}</span>}
                  {current.pattern && <span className="pattern-preview">{current.pattern}</span>}
                  <div className="card-tags"><span>{current.category}</span><span>{statusText(itemStatus(current, known, hard))}</span></div>
                  <small>意味を思い出してからカードをめくる</small>
                </div>
              )}
            </article>
          ) : <div className="empty-card"><strong>該当するカードがありません</strong><span>絞り込み条件を変えてみてください。</span></div>}
        </section>

        <aside className="list-panel" aria-label={`${copy.list}`}>
          <div className="list-head"><div><p className="eyebrow">STUDY LIST</p><h2>{copy.list}</h2></div><button onClick={resetProgress} className="reset-button" type="button">記録を消す</button></div>
          <div className="study-list">
            {visibleItems.map((item, itemIndex) => {
              const currentStatus = itemStatus(item, known, hard);
              return <button key={item.id} type="button" className={`study-list-item ${itemIndex === index ? "selected" : ""}`} onClick={() => { setIndex(itemIndex); setFlipped(false); }}><span className={`list-mark ${currentStatus}`}></span><span className="list-term">{item.term}</span><span className="list-meaning">{item.japanese}</span><span className="list-level">{item.level}</span></button>;
            })}
          </div>
        </aside>
      </section>

      <section className="progress-band" aria-label="学習の目安">
        <div><p className="eyebrow">TODAY'S FOCUS</p><h2>苦手を先に、覚えたら次へ。</h2></div>
        <p className="progress-copy">「苦手」で印を付けたカードは、状態フィルターからすぐに復習できます。記録はこのブラウザに保存されます。</p>
        <img className="focus-image" src="og.png" alt="英単語カードのイメージ" />
      </section>
    </main>
  );
}
