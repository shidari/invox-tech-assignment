# Image Classification API

Google Vision APIを使用した画像分類APIです。画像URLを受け取り、Google Vision APIで画像を分析し、結果をデータベースに保存します。

## 機能

- 画像URLを受け取り、Google Vision APIで画像分類を実行
- 分類結果のラベルをOpenAI Embeddingsでベクトル化
- コサイン類似度による既存ラベルとの比較（閾値: 0.8）
- 新しいラベルの場合は自動的にデータベースに追加
- 分析ログの記録（成功・失敗両方）
- 包括的なエラーハンドリング（15種類のエラータイプ）

## API仕様

### API ドキュメント

開発サーバー起動後、以下のURLでSwagger UIによるAPIドキュメントを確認できます：
- Swagger UI: `http://localhost:8787/`
- OpenAPI JSON: `http://localhost:8787/openapi`

### POST /api/classification

画像を分類します。

**リクエスト:**
```json
{
  "image_path": "https://example.com/image.jpg"
}
```

### GET /api/classes

すべてのクラスとラベルを取得します。

**レスポンス例（成功時）:**
```json
[
  {
    "classId": 1,
    "label": "Dog"
  },
  {
    "classId": 2,
    "label": "Cat"
  }
]
```

### GET /api/classes/:classId

指定されたクラスIDのラベルを取得します。

**パラメータ:**
- `classId`: クラスID（数値）

**レスポンス例（成功時）:**
```json
{
  "classId": 1,
  "label": "Dog"
}
```

### POST /api/classification

画像を分類します。

**レスポンス例（成功時）:**
```json
{
  "success": true,
  "message": "success",
  "estimated_data": {
    "class": 1,
    "confidence": "Dog"
  }
}
```

**レスポンス（エラー時）:**
```json
{
  "success": false,
  "message": "エラーメッセージ",
  "code": "E1"
}
```

## 環境変数

以下の環境変数を設定してください：

- `GCP_SERVICE_ACCOUNT`: Google Cloud Platform サービスアカウントのJSONキー
- `PROXY_API_URL`: OpenAI Proxy APIのURL
- `PROXY_API_KEY`: OpenAI Proxy APIのAPIキー
- `invox_tech_assignment_db`: Cloudflare D1データベース

## セットアップ

```bash
npm install
npm run dev
```

## テスト

Cloudflare Workers環境でのテストを実行します：

```bash
npm run test
```

テスト環境は以下の技術を使用しています：
- **Vitest**: テストフレームワーク
- **@cloudflare/vitest-pool-workers**: Cloudflare Workers環境でのテスト実行
- Wrangler設定ファイル（`wrangler.jsonc`）を使用してWorkers環境を模擬

## 大量データ挿入

テスト用に大量の画像分類データを挿入するスクリプトが利用できます：

```bash
npm run mass-insert
```

このスクリプトは以下の処理を行います：
- Picsum Photosからランダムな画像URLを100件取得
- 各画像に対してAPIエンドポイント（`https://image-classification-api.sho-lab.workers.dev/api/classification`）を呼び出し
- Bearer認証を使用してAPIアクセス
- 0.5秒間隔で順次処理を実行してサーバー負荷を軽減
- 処理結果をコンソールに出力

**注意**: 
- `.env`ファイルに`API_KEY`環境変数を設定してください

## デプロイ

```bash
npm run deploy
```

## 型生成

Worker設定に基づいて型を生成/同期するには：

```bash
npm run cf-typegen
```

## アーキテクチャ

- **Hono**: 軽量なWebフレームワーク
- **Drizzle ORM**: データベースORM
- **Valibot**: スキーマバリデーション
- **neverthrow**: 関数型エラーハンドリング
- **Google Vision API**: 画像分析
- **OpenAI Embeddings**: テキストベクトル化

## エラーコード

| コード | 説明 |
|--------|------|
| E1 | JSON解析エラー |
| E2 | GCPサービスアカウントスキーマエラー |
| E3 | Googleアクセストークン取得エラー |
| E4 | Google Vision APIリクエストエラー |
| E5 | Google Vision APIレスポンス検証エラー |
| E6 | Proxy APIエラー |
| E7 | データベーステーブル操作エラー |
| E8-E15 | その他の内部エラー |
