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
