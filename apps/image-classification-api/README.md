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

### POST /api/classification

画像を分類します。

**リクエスト:**
```json
{
  "image_path": "https://example.com/image.jpg"
}
```

**レスポンス（成功時）:**
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

```bash
npm run test
```

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
