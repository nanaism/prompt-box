# Prompt Box - AIプロンプトテンプレート管理＆生成ツール

[![Deploy on prompt.aiichiro.jp](https://img.shields.io/badge/Live%20Demo-prompt.aiichiro.jp-blue?style=for-the-badge&logo=vercel)](https://prompt.aiichiro.jp/)

高品質なAIプロンプトの「再利用」と「カスタマイズ」を、誰でも簡単に行えるようにするための動的プロンプトエンジニアリング・ツールキットです。
MDXファイルでテンプレートを管理し、Web上のフォームからあなた専用のプロンプトを瞬時に生成します。

**👇 今すぐサイトで体験！**
### [https://prompt.aiichiro.jp/](https://prompt.aiichiro.jp/)

![Prompt Boxのスクリーンショット](https://github.com/user-attachments/assets/d1ea4641-5510-43df-a017-5e9bc7c62ab3)

---

## 🌟 プロジェクトの特徴 (Features)

このツールは、プロンプト作成の効率を劇的に向上させるための機能を備えています。

-   **📝 MDXによるテンプレート管理**
    -   プロンプトのテンプレートを、Markdownの拡張である**MDXファイル**で直感的に管理。説明文やメタデータも同じファイルに記述できます。

-   **🚀 動的なリアルタイム・プロンプト生成**
    -   テンプレートに定義された`{{変数}}`をWeb上のフォームに入力するだけで、最終的なプロンプトがリアルタイムでプレビュー・生成されます。

-   **📋 クリップボードへの簡単コピー**
    -   生成されたプロンプトはワンクリックでクリップボードにコピーでき、すぐにChatGPTやMidjourneyなどで使用できます。

-   **📚 パーソナルなプロンプト履歴と評価**
    -   生成して実際に使ってみたプロンプトを**Supabase**に保存可能。
    -   保存したプロンプトがどれだけ効果的だったかを5段階で評価し、自分だけの最強のプロンプト集を育てることができます。

-   **⚛️ MDXによるインタラクティブなページ**
    -   静的なドキュメントページ（例：Aboutページ）にもMDXを活用。ページ内にReactコンポーネントを埋め込むことで、リッチでインタラクティブな表現を実現しています。

## 💡 こだわりのポイント： 設計思想

### MDX as a Single Source of Truth

このプロジェクトの技術的な核心は、**プロンプトテンプレートの「単一の情報源」としてMDXを採用した**ことです。
通常のMarkdownと異なり、MDXはファイル内にReactコンポーネントやメタデータ（frontmatter）を持つことができます。

これにより、一つのMDXファイルの中に、
1.  **プロンプトの本文（テンプレート文字列）**
2.  **動的生成に必要な変数リスト（メタデータ）**
3.  **そのプロンプトの詳しい説明文**

といった全ての情報を集約できます。`next-mdx-remote-client` を利用してこれらのファイルをサーバーサイドで読み込み、動的にページとフォームを生成するアーキテクチャは、メンテナンス性と拡張性に非常に優れています。

### ユーザーのフィードバックループ

単にプロンプトを生成するだけでなく、「保存」と「評価」の機能を追加することで、ユーザー自身の試行錯誤を記録し、ナレッジとして蓄積できる**フィードバックループ**を設計しました。これにより、このツールは使い捨てのジェネレーターではなく、ユーザーと共に成長する「パーソナルなプロンプト管理システム」となります。

## 🛠️ 使用技術 (Tech Stack)

このアプリケーションは、コンテンツ駆動のWebサイト構築に最適なモダン技術スタックで構成されています。

-   **Framework**: **Next.js** (App Router), **React**, **TypeScript**
-   **Content/Templating**: **MDX** (`next-mdx-remote-client`)
-   **Database & Backend**: **Supabase** (プロンプト履歴・評価の保存)
-   **UI & Styling**: **shadcn/ui**, **Tailwind CSS**
-   **Deployment**: **Vercel**

## 🚀 ローカルでの実行方法 (Getting Started)

このプロジェクトをご自身の環境で動かすには、Supabaseとの連携設定が必要です。

1.  **リポジトリをクローン**
    ```sh
    git clone https://github.com/your-username/your-repository.git
    ```
2.  **ディレクトリに移動**
    ```sh
    cd your-repository
    ```
3.  **依存関係をインストール**
    ```sh
    npm install
    # または yarn install
    ```
4.  **環境変数を設定**
    `.env.local.example` を参考に `.env.local` ファイルを作成し、Supabaseプロジェクトから取得したAPIキーとURLを設定してください。
    -   `NEXT_PUBLIC_SUPABASE_URL`
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5.  **開発サーバーを起動**
    ```sh
    npm run dev
    # または yarn dev
    ```
    ブラウザで `http://localhost:3000` を開いてください。
