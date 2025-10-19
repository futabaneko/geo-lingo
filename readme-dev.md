# 【開発指示書】Geoguessr 地名学習アプリ (MVP: ベンガル語)

**To:** 開発担当者（あなた）
**From:** PdM
**Date:** 2025/10/19
**Subject:** 新規プロダクト「Geo-Lingo (仮称)」MVP 開発キックオフ

## 1. プロダクトビジョンと MVP ゴール

### 1.1. プロダクトビジョン

Geoguessr プレイヤーが、ゲーム中に遭遇する読めない言語（ベンガル文字、タイ文字など）の「地名」を読めるようになることで、スコアアップと学習の楽しみを提供する。

### 1.2. 解決したい課題

プレイヤーが看板の文字（例: কলকাতা）を見ても、それが地名（例: Kolkata）だと認識できず、地図と照合できない。

### 1.3. ターゲットユーザー

Geoguessr プレイヤー（特に難解言語の壁にぶつかっている中級者以上）

### 1.4. MVP のゴール

まずは**ベンガル語**に絞り、「**主要な地名の 4 択クイズ**」と「**読み方の基本解説**」を提供することで、ユーザーが「この文字の並びは、あの都市名だな」と認識できる状態を作る。

## 2. MVP 開発タスク（ステップ・バイ・ステップ）

リソースは限られています。以下のステップ順に、上から一つずつ着実に開発を進めてください。

---

### ステップ 1: 基盤構築（データ設計と整備）

最重要タスクです。将来の「自由入力モード」への拡張性を担保するため、以下のデータ構造を厳守してください。

#### タスク 1-1: データ構造の定義

地名データは、`JSON`形式で管理することを推奨します。（MVP 段階では DB は不要）
`src/data/bengali.json` のようなファイルを作成してください。

**必須構造:**

- `id`: 固有の識別子 (数値 or UUID)
- `native_string`: 現地語表記 (例: ベンガル文字)
- `primary_answer`: 標準的なローマ字表記（4 択クイズの正解、自由入力の第一正解）
- `allowed_answers`: 許容される別表記の配列（自由入力モード用。例: "Chittagong" vs "Chattogram"）
- `language`: 言語コード (例: "bengali")

```json
[
  {
    "id": "ben-001",
    "native_string": "কলকাতা",
    "primary_answer": "Kolkata",
    "allowed_answers": ["Calcutta", "Kolikata"],
    "language": "bengali"
  },
  {
    "id": "ben-002",
    "native_string": "ঢাকা",
    "primary_answer": "Dhaka",
    "allowed_answers": ["Dacca"],
    "language": "bengali"
  },
  {
    "id": "ben-003",
    "native_string": "চট্টগ্রাম",
    "primary_answer": "Chattogram",
    "allowed_answers": ["Chittagong"],
    "language": "bengali"
  },
  {
    "id": "ben-004",
    "native_string": "খুলনা",
    "primary_answer": "Khulna",
    "allowed_answers": [],
    "language": "bengali"
  }
]
```

#### タスク 1-2: 初期データ（地名リスト）の作成

上記構造に基づき、ベンガル語の主要地名リスト（まずは 50 件 を目標）を作成してください。 （データソースは Geoguessr 頻出都市リストなどを参照）

### ステップ 2: MVP コア機能（4 択クイズ）の実装

ユーザーが直接触れるメイン機能です。

#### タスク 2-1: クイズ提供ロジックの実装

Web アプリケーションのサーバーサイド（またはフロントエンド）で、bengali.json を読み込み、クイズ 1 問分のデータを生成するロジックを実装します。

ロジックの要件:

- 全地名リスト（例: 50 件）から、ランダムに正解となる地名を 1 つ選ぶ (例: ben-001: Kolkata)。
- 正解以外の地名リストから、ランダムにダミーの選択肢を 3 つ選ぶ (例: Dhaka, Chattogram, Khulna)。
- フロントエンドに渡すデータ（API レスポンス、または props）を以下の形式で構築する。

クイズデータ形式 (例):

```JSON
{
  "question": {
    "id": "ben-001",
    "native_string": "কলকাতা"
  },
  "choices": [
    { "id": "ben-001", "text": "Kolkata" },
    { "id": "ben-002", "text": "Dhaka" },
    { "id": "ben-003", "text": "Chattogram" },
    { "id": "ben-004", "text": "Khulna" }
  ],
  "correct_answer_id": "ben-001"
}
```

- choices 配列は必ずシャッフルしてください。

- フロントエンドは correct_answer_id とユーザーが選んだ id を照合するだけで正誤判定できるようにします。

### タスク 2-2: クイズ画面 UI 実装

シンプルで使いやすい UI を実装します。

必須コンポーネント:

- 問題表示エリア: native_string (例: "কলকাতা") を大きく、読みやすく表示する。Web フォント（Noto Sans Bengali など）の適用を検討してください。
- 選択肢ボタン (4 つ): choices の text を表示するボタン。
- フィードバック表示エリア: 正解/不正解の結果を表示する領域。（例：「正解！」「不正解… 答えは Kolkata です」）
- 「次の問題へ」ボタン: 正解/不正解のフィードバック後に表示する。

### タスク 2-3: クイズ実行ロジック (フロントエンド)

以下のユーザーフローを実装してください。

- 画面ロード時、タスク 2-1 のロジックを実行し、クイズデータを取得・表示する。

- ユーザーが選択肢ボタンをクリックする。

- 選択された id と correct_answer_id を比較する。

- 正解の場合:

  - フィードバック表示エリアに「正解！」と表示する。

- 選択したボタンを緑色（Success）にする。

- 不正解の場合:

  - フィードバック表示エリアに「不正解… 答えは [正解のテキスト] です」と表示する。

  - 選択したボタンを赤色（Error）にし、正解のボタンを緑色にする。

  - 選択肢ボタンをすべて無効化（disabled）する。

  - 「次の問題へ」ボタンを表示（または有効化）する。

  -「次の問題へ」ボタンが押されたら、ステップ 1 に戻る（次のクイズデータを取得）。

### ステップ 3: 学習サポート機能の実装

クイズだけでは学習が難しいため、カンペとなるページを用意します。

#### タスク 3-1: 静的解説ページの作成

/bengali-guide のようなルートで、ベンガル文字の読み方の基本を解説する静的なページを作成する。

内容は「この文字は K の音」「この記号は A の音」といったレベルで OK。（文法は不要）

クイズ画面からこのページへリンクを設置する。

### ステップ 4: R&D（技術調査）

MVP リリース後の「神機能」に向けた調査です。MVP 開発と並行しても構いませんが、リリースをブロックしないように注意してください。

### タスク 4-1: 「文字ホバーによる音節表示」の実現可能性調査

クライアントの要望: কলকাতা の ক (k) や ো (o) の部分にホバーすると、その音節（"ko"など）を表示したい。

調査課題: ベンガル文字は複数の文字（子音＋母音記号など）が結合・変形して 1 つのグリフ（字形）を形成する（例: ক + ো = কো）。

調査内容:

この結合された文字の「構成要素」を DOM 上でどう認識・分離するか。

分離した要素にホバーイベントをバインドできるか。

Unicode の仕様（書記素クラスタ）レベルでの操作が必要か。

既存のライブラリ（Tippy.js, Popover API）と組み合わせて、意図したポップアップ表示が可能か。

成果物: 簡単な技術デモ（Proof of Concept）と、実装工数の見積もり。

### 3. 将来のバックログ（参考）

MVP 開発では絶対に実装しないでください。これらは成功後の次のステップです。

P2: クイズの自由入力モード（allowed_answers を使った正誤判定）

P2: 「神機能」（ホバー音節表示）の本実装

P3: 学習成果のトラッキング（正解率、学習履歴）

P3: 他言語（キリル文字、タイ語、韓国語）のコンテンツ追加

---

## 開発者向けメモ（MVP 実装）

このワークスペースには、MVP を即座に試せる静的 Web アプリ構成を追加しています。

### フォルダ構成（静的 MVP / 復元版）

- `public/mvp/`
  - `index.html` … 4 択クイズ画面（静的）
  - `bengali-guide.html` … 学習ガイド（静的解説）
  - `styles.css` … 最小スタイル
  - `main.js` … クイズロジック（データ読み込み・選択肢生成・判定）
  - `theme.js` … テーマ切替（ライト/ダーク）
- `public/data/bengali.json` … ベンガル語の地名データ（React/静的の両方で共有）

### ローカル実行

Windows PowerShell で、以下のいずれかの方法で静的サーバを起動してください。

1. Python がある場合（推奨・簡単）

```powershell
cd "c:\Users\User\Desktop\geoguessr\georengo\public"; python -m http.server 5173
```

ブラウザで http://localhost:5173/mvp/ にアクセス。

2. Node.js がある場合（http-server 利用）

```powershell
npx http-server "c:\Users\User\Desktop\geoguessr\georengo\public" -p 5173 -c-1
```

### デプロイ（GitHub Pages）

最も簡単な構成は、`public/` 配下をそのまま Pages で配信する形です（静的 MVP は `/mvp/` 配下）。

1. このリポジトリを GitHub にプッシュ
2. GitHub のリポジトリ設定 → Pages → Branch を `main`（または `master`）にし、`/public` をルートに指定
3. 保存後、表示された URL にアクセス（反映まで数分かかることがあります）

補足: 独自ドメインやキャッシュ制御が必要な場合は `CNAME` やヘッダ設定を追加してください。

---

## React + TypeScript + Tailwind（Vite）への移行（済）

このリポジトリは Vite（React+TS+Tailwind）構成を追加済みです。初回セットアップは以下。

```powershell
cd "c:\Users\User\Desktop\geoguessr\georengo"; npm install; npm run dev
```

開発サーバ: http://localhost:5173

ビルド:

```powershell
npm run build; npm run preview
```

GitHub Pages サブパス公開時は、`vite.config.ts` の `base` を `/<リポジトリ名>/` に設定してください。

### GitHub Pages（React SPA）自動デプロイ

すでに `.github/workflows/deploy.yml` を同梱しています。以下で React 側も Pages に自動公開されます。

1. リポジトリ設定 → Pages → ビルドとデプロイ: 「GitHub Actions」を選択
2. `vite.config.ts` の `base` を `/<リポジトリ名>/` に設定（このリポジトリなら `/georengo/`）
3. `main`（または `master`）へプッシュ
4. 数分後、Actions 経由で `dist/` が Pages に反映されます

注記: ルーティングは `HashRouter` を利用しているため、Pages でも 404 回避が可能です。

### 実装メモ（要件対応）

- データ構造は PM 指定のスキーマに準拠。将来の自由入力モード用に `allowed_answers` を保持。
- クイズ生成は全件から正解 1 + ダミー 3 を抽出し、Fisher–Yates でシャッフル。
- 判定は `correct_answer_id` とクリックした `id` を比較するだけで完結。
- Web フォントとして Noto Sans Bengali を読み込み、ベンガル文字を大きく表示。
- 静的 MVP 側ではガイドページ（`/mvp/bengali-guide.html`）へヘッダから遷移可能。

### 今後のタスク

- データ拡充（目標 50 件）: `public/data/bengali.json` に追記。
- R&D: 文字ホバーでの音節表示 PoC（別 HTML で sandbox 実装）。
- E2E テスト（Playwright 等）での基本動作検証（任意）。
