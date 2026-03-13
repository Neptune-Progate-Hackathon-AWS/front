# コンビニトイレマップ フロントエンド

## 技術スタック
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- TanStack Query（データフェッチ）
- MapLibre GL JS + react-map-gl（地図表示）
- Orval（OpenAPI → API クライアント + 型の自動生成）

## パッケージマネージャ
- pnpm

## コマンド
- `pnpm dev` — 開発サーバー起動
- `pnpm build` — プロダクションビルド
- `pnpm gen` — Orval で API クライアント + 型を再生成

## コード生成（Orval）
- 設定: `orval.config.ts`
- 入力: バックエンドリポジトリの `openapi.yml`（GitHub raw URL）
- 出力: `src/gen/`（gitignore 済み、手動編集禁止）
- client: `react-query`（TanStack Query のフックが生成される）

## ディレクトリ構成
```
src/
├── app/           # Next.js App Router ページ
├── components/    # 共通コンポーネント
└── gen/           # Orval 自動生成（編集禁止）
```

## 地図タイル
- 開発: OpenFreeMap（`https://tiles.openfreemap.org/styles/liberty`）
- 本番: Amazon Location Service（AWS 設定後に差し替え）
