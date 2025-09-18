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

### 4. GitHub Actions での Google Auth 設定 ⭐️
**課題**: GitHub Actions で Google Cloud への認証設定
- **具体的な問題**: 
  - google-github-actions/auth アクションの設定方法
  - Workload Identity Federation との連携
  - 認証情報の適切な管理方法
- **関連技術**: GitHub Actions, google-github-actions/auth, Workload Identity Federation
- **苦労した理由**: 
  - GCPの権限周りの仕組みを読み込む必要があった
  - google-github-actions/auth のドキュメントを詳細に読む必要があった
  - 認証エラー時のデバッグが困難

### 5. Cloud Run デプロイ時の環境変数設定 ⭐️
**課題**: Cloud Runでの環境変数設定と反映タイミングの問題
- **具体的な問題**: 
  - デプロイ時の環境変数設定とGCPコンソールでの後追い設定が混在
  - 環境変数の反映タイミングが不明確で検証が困難
  - どの設定が実際に適用されているか把握しづらい
- **関連技術**: Google Cloud Run, 環境変数, デプロイメント
- **苦労した理由**: 
  - デプロイ時とコンソール設定の優先順位が不明
  - 環境変数の変更がいつ反映されるか予測困難
  - 設定の検証方法が限られており、デバッグに時間がかかる

### 6. Cloudflare Workers Free Plan CPU制限 ⭐️
**課題**: CPU時間制限（10ms）による処理能力の制約
- **具体的な問題**: 
  - embeddings処理が100件を超えるとCPU制限を超過
  - 数値配列処理のパフォーマンス最適化が必要
  - スケーラビリティに根本的な制約（数千単位のembeddingsでは厳しい）
- **関連技術**: Cloudflare Workers Free Plan, Float32Array, パフォーマンス最適化
- **苦労した理由**: 
  - Free Planの10ms制限は非常に厳しく、通常の処理では簡単に超過
  - 時間制約によりdirtyな最適化を選択せざるを得ない状況
  - アーキテクチャ選択自体が技術課題となる制約
- **解決方法**: 
  - Float32Array使用による数値配列処理の高速化
  - forループによる直接代入でCPU使用量削減
  - 非null assertion（!演算子）による型チェック回避（時間制約による妥協）
- **備考**: 
  - 有料プランでは50msまで拡張可能だが、数千単位のembeddingsでは依然として制約あり
  - データベーススキーマ変更（blob形式、stringified JSON等）の選択肢もあったが時間制約上断念
  - データの持ち方を工夫すればもう少しスケールする可能性あり

### 7. Cloudflare Durable Objects設定・実装 ⭐️
**課題**: Durable Objectsの概念理解と実装の困難さ
- **具体的な問題**: 
  - Durable Objectsの概念とサンプルコードの理解に時間がかかる
  - SQLiteのINSERT文で配列ではなく多引数で値を渡す必要がある
  - 型エラーで検知されないため、実行時エラーでハマる
- **関連技術**: Cloudflare Durable Objects, SQLite, cloudflare:test
- **苦労した理由**: 
  - Durable Objectsの概念が独特で、サンプルコードの使い方の理解に時間がかかった
  - SQLiteのクエリ実行時の引数の渡し方が直感的でない
  - TypeScriptの型チェックでSQLクエリの引数エラーが検知されない
- **解決方法**: 
  - 公式ドキュメントとサンプルコードを詳細に読み込み
  - SQLiteクエリの引数渡しを配列から多引数形式に修正
  - direct-access.test.tsでのDurable Objects単体テスト実装
- **備考**: 
  - 概念の理解に時間をかけることが重要
  - SQLiteクエリの引数渡しは要注意ポイント

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

### Cloud Run 環境変数設定
- [ ] デプロイ時の環境変数設定方法の統一
- [ ] GCPコンソールでの環境変数設定との整合性確認
- [ ] 設定変更後の検証方法の確立
- [ ] デプロイ設定ファイル（YAML等）での環境変数管理
- [ ] 環境変数の優先順位の理解と文書化

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

### Cloud Run 環境変数設定エラーが出た場合
1. **設定方法の混在確認**
   - デプロイ時の環境変数設定を確認
   - GCPコンソールでの後追い設定を確認
   - どちらの設定が優先されているか検証

2. **検証・デバッグ方法**
   - Cloud Runログでの環境変数確認
   - アプリケーション内での環境変数出力（機密情報除く）
   - リビジョン履歴での設定変更確認

3. **設定の統一化**
   - デプロイ設定ファイルでの一元管理
   - コンソール設定との整合性チェック

---

## 📚 参考になったリソース

### 公式ドキュメント
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub Actions GCP認証](https://github.com/google-github-actions/auth)
- [Cloud Vision API](https://cloud.google.com/vision/docs)
- [Cloudflare Workers Runtime APIs](https://developers.cloudflare.com/workers/runtime-apis/)
- [Google API REST認証](https://developers.google.com/identity/protocols/oauth2/service-account)
- [Cloud Run 環境変数設定](https://cloud.google.com/run/docs/configuring/environment-variables)
- [Cloud Run デプロイメント](https://cloud.google.com/run/docs/deploying)

### GitHub Actions関連
- [google-github-actions/auth のドキュメント](https://github.com/google-github-actions/auth) - GCPの権限周りの仕組みと合わせて読む必要があった

### 参考情報
主に公式ドキュメントを中心に情報収集を行い、各技術の仕様や設定方法を理解することで課題を解決した。

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

### Cloud Run関連
- 環境変数の設定方法が複数あり（コンソール、gcloud CLI、YAML）、混乱しやすい
- デプロイ時とコンソールでの設定が混在すると、どちらが優先されるか不明確
- 設定の検証方法が限られており、実際の動作確認まで問題に気づけない場合がある
- デプロイ後の環境変数確認が困難で、デバッグに時間がかかる

---

*最終更新: 2025/09/16*
