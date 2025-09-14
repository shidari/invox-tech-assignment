# Proxy API for OpenAI

## セットアップ

```bash
npm install
npm run dev
```

## 使用方法

### 環境変数の設定
```bash
export API_KEY=your_secret_api_key
export OPENAI_API_KEY=your_openai_api_key
```

### サーバーの起動
```bash
npm run dev
```

### APIアクセス
```bash
# 認証ヘッダーを含めてリクエスト
curl -H "x-api-key: your_secret_api_key" http://localhost:8080
```

```
open http://localhost:8080
```

## 認証

このAPIは`x-api-key`ヘッダーによる認証が必要です。
- 環境変数`API_KEY`で設定されたキーが必要
- 未認証の場合は401エラーを返却

## エンドポイント

### POST /embeddings
テキストのembeddingを取得するエンドポイント

#### リクエスト
```bash
curl -X POST http://localhost:8080/embeddings \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secret_api_key" \
  -d '{"text": "Hello, world!"}'
```

#### レスポンス
```json
{
  "embeddings": [0.1, 0.2, 0.3, ...]
}
```

#### エラーレスポンス
- 400: テキストが不正または欠落
- 500: OpenAI APIからのエラー
