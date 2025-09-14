# 技術課題で苦労したポイント

## 概要
このドキュメントは、画像分類API連携プロジェクトで実際に苦労した技術的な課題をまとめたものです。

---

## 🔥 主要な苦労ポイント

### 1. GCP CI/CD設定（3日間格闘）
**課題**: GitHub Actions と GCP の連携設定
- **具体的な問題**: 認証エラーが出ても原因がわからない
- **関連技術**: Workload Identity Federation (WIF), IAM権限
- **苦労した理由**: エラーメッセージが不明確で、どの設定が間違っているか特定困難

### 2. Google Cloud Vision API設定
**課題**: Vision API の権限・認証設定
- **具体的な問題**: IAM権限周りの設定
- **関連技術**: Service Account, API有効化, 認証キー
- **苦労した理由**: 必要な権限の特定と正しい設定方法の理解

### 3. Cloudflare Workers での Google API 制約 ⭐️
**課題**: Workers環境でGoogle APIライブラリが使えない
- **具体的な問題**: 
  - Google APIライブラリがfsモジュールで認証情報を読み込むため使用不可
  - REST API での認証実装が複雑
- **関連技術**: Cloudflare Workers Runtime, Google API REST認証
- **苦労した理由**: 
  - Node.js標準ライブラリ（fs）がWorkers環境で利用不可
  - OAuth2/JWT認証をREST APIで手動実装する必要

---

## 📋 課題解決のチェックリスト

### GCP CI/CD設定
- [ ] GCP プロジェクトでWIF Provider作成
- [ ] GitHub リポジトリとの紐付け設定
- [ ] Service Account作成・権限設定
- [ ] GitHub Secrets設定（PROJECT_ID, WORKLOAD_IDENTITY_PROVIDER, SERVICE_ACCOUNT）
- [ ] Cloud Run デプロイ権限の確認
- [ ] 認証テスト・デプロイテスト

### Google Vision API設定
- [ ] Vision API の有効化
- [ ] Service Account の作成
- [ ] 必要なIAM権限の付与
- [ ] 認証キーの生成・設定
- [ ] API テスト・動作確認

### Cloudflare Workers での Google API 実装
- [ ] Service Account キーをWorkers環境変数に設定
- [ ] JWT トークン生成の実装（手動）
- [ ] Google API REST エンドポイントの直接呼び出し
- [ ] 認証トークンの取得・更新ロジック
- [ ] エラーハンドリング・リトライ機能

---

## 🛠️ トラブルシューティング

### 認証エラーが出た場合
1. **WIF Provider設定確認**
   - Audience設定が正しいか
   - Attribute mappingが適切か

2. **Service Account権限確認**
   - Cloud Run Developer権限
   - Service Account User権限
   - 必要なAPI権限

3. **GitHub Secrets確認**
   - 値の設定ミスがないか
   - 権限のあるService Accountか

### Vision API エラーが出た場合
1. **API有効化確認**
   - Cloud Vision API が有効になっているか

2. **認証確認**
   - Service Account キーが正しく設定されているか
   - 認証スコープが適切か

3. **権限確認**
   - Vision API User権限があるか

### Cloudflare Workers での Google API 実装エラー
1. **ライブラリ制約確認**
   - Node.js標準ライブラリ（fs, path等）は使用不可
   - Google公式ライブラリは基本的に使用不可

2. **REST API認証実装**
   - JWT トークン生成の手動実装
   - Service Account キーからの署名生成
   - OAuth2 フローの理解と実装

3. **Workers環境制約**
   - CPU時間制限（10ms〜30s）
   - メモリ制限（128MB）
   - 同期処理の制限

---

## 📚 参考になったリソース

### 公式ドキュメント
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub Actions GCP認証](https://github.com/google-github-actions/auth)
- [Cloud Vision API](https://cloud.google.com/vision/docs)
- [Cloudflare Workers Runtime APIs](https://developers.cloudflare.com/workers/runtime-apis/)

### Cloudflare Workers + Google API
- [Google API REST認証](https://developers.google.com/identity/protocols/oauth2/service-account)
- [JWT実装例](https://developers.cloudflare.com/workers/examples/)
- [Workers環境での制約](https://developers.cloudflare.com/workers/platform/limits/)

### よくある問題・解決策
- GCP IAM権限のベストプラクティス
- GitHub Actions デバッグ方法
- Service Account キー管理
- Workers環境でのGoogle API実装パターン

---

## 💡 今後の改善点

### 開発効率化
- [ ] 開発環境でのGCP認証簡素化
- [ ] エラーハンドリング・ログ改善
- [ ] 設定手順のドキュメント化
- [ ] Workers用Google API認証ライブラリの作成

### 運用改善
- [ ] 権限の最小化
- [ ] 監視・アラート設定
- [ ] 自動テスト追加
- [ ] REST API認証の最適化

---

## 📝 メモ・備考

### GCP関連
- GCP関連の設定は特に権限周りが複雑
- エラーメッセージだけでは原因特定が困難
- 段階的に設定を確認することが重要
- 公式ドキュメントと実際の設定に差がある場合がある

### Cloudflare Workers関連
- Node.js標準ライブラリが使えないため、多くのnpmパッケージが動作しない
- Google公式SDKは基本的に使用不可（fs依存のため）
- REST APIでの手動実装が必要で、認証周りが特に複雑
- JWT署名生成をWeb Crypto APIで実装する必要がある

---

*最終更新: 2025/09/14*
