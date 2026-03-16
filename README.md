# ケアシフト V3 | 重度訪問介護事業向け業務効率化 SaaS

[![ケアシフト](https://i.gyazo.com/d29524a6cd8609463222520a117a0ab3.png)](https://gyazo.com/d29524a6cd8609463222520a117a0ab3)

**ケアシフト**は、重度訪問介護事業所の管理業務を効率化する SaaS です。

前職で訪問介護事業所の管理業務を担当していた際、

- シフト管理が表計算中心でミスが発生しやすい  
- 直行直帰のため勤怠状況を把握しづらい  
- 訪問先共有ミスなどのケアレスミスが起きる  

といった課題を経験しました。

これらを解決するため、シフト管理・勤怠管理・業務連絡を **1つのシステムに統合した業務支援アプリ**として開発しています。

---

# 主な機能

### シフト管理
シンプルな UI により、少ない操作でシフト作成・共有が可能。

### 勤怠管理
利用者ごとの出勤状況を 1 画面で確認。

### 訪問先ナビゲーション
登録住所からワンタップで経路表示。

### アプリ内チャット
業務連絡をアプリ内でリアルタイム共有。

---

# 対象ユーザー

訪問介護事業所の管理職（シフト作成担当）

PC 操作に慣れていないユーザーでも利用できるよう

- 学習コストを最小化  
- 入力作業を削減  

する UI 設計を行っています。

---

# 開発背景

訪問介護では

- シフト管理  
- 勤怠管理  
- 業務連絡  

が複数ツールに分散し、管理負担が増加しているケースが多くあります。

ケアシフトはこれらの業務を一元化し、  
**管理業務の大幅な効率化を目指したサービス**です。

---

# UIデザイン

「誰でも簡単に使える」というコンセプトを重視し、  
パステルカラーを基調とした配色と、コンポーネントの角丸（ラディウス）を大きめに設定することで、  
明るく直感的に操作できるデザインを意識しています。
---

# 技術構成

## バックエンド
**Ruby / Ruby on Rails**

Rails の「設定より規約」の思想に基づき、規約に沿った実装を行うことで少ないコード量で保守性の高いサーバーを構築できる点に魅力を感じ、Rails を採用しました。

### 主な実装

- **認証機能（Devise / OmniAuth）**  
  認証には **Session 認証**を採用。  
  CSRF 攻撃対策として **CSRF Token** を導入しています。

- **二段階認証（2FA）**  
  近年の攻撃手法の高度化を踏まえ、パスワードのみの認証では不十分と判断し、  
  二段階認証を実装しています。

- **権限管理（Pundit）**

- **ディレクトリ設計**  
  各責務・権限ごとにディレクトリを分離し、可読性と保守性を高めています。

テストには **RSpec / FactoryBot / Capybara** を利用し、  
**SimpleCov によるコードカバレッジ 80％以上** を維持しています。

---

## フロントエンド
**React / TypeScript / Vite**

将来的にモバイルアプリ展開を視野に入れ、React Native への展開可能性を考慮して React を採用しました。

v2 では Rails のサーバーサイドレンダリング中心の構成でしたが、  
v3 では **フロントエンド分離構成（SPA）** に移行しました。

これにより

- 仮想 DOM による高速な UI 更新
- CDN キャッシュの活用
- UX の向上

を実現しています。

---

## データベース
**MySQL / Amazon RDS**

全テーブルに **Office 外部キー** を持たせた **マルチテナント構造** を採用しています。

将来的に大規模顧客の利用が発生した場合でも、テナント単位でのデータ分離やスケール対応が行いやすい設計としています。

---

## インフラ
**AWS（EC2 / ALB / S3 / CloudFront / DynamoDB / SSM）**

インフラは AWS 上に構築しています。

主な構成

- EC2 : アプリケーションサーバー
- ALB : 負荷分散
- CloudFront : CDN
- S3 : 静的アセット / ActiveStorage
- DynamoDB : Terraform State Lock
- SSM : シークレット管理

CI およびローカル環境からは **AssumeRole** を利用し、  
認証情報をコードや環境変数に持たない **シークレットレス運用** を意識しています。

---

## プロビジョニングツール
**Terraform**

将来的なチーム開発を見据え、v3 から **IaC（Infrastructure as Code）** を導入しました。

Terraform State は

- **S3 に保存**
- **DynamoDB によるロック管理**

を行い、同時実行による衝突を防ぐ構成としています。

---

## CI / CD
**GitHub Actions**

CI では

- テスト実行
- 静的解析
- セキュリティチェック

を自動化しています。

Terraform は

- **Pull Request 作成時 : plan**
- **main マージ時 : apply**

が実行される構成としています。

---

## モニタリング
Google Analytics

---

## 開発ツール
Docker / Docker Compose

---

## コード管理
GitHub

将来的なチーム開発を想定し

- ブランチ保護
- CI 必須化
- コードレビュー前提の運用

を意識したリポジトリ構成にしています。

---

## 外部 API

- SendGrid  
- Stripe  
- Google OAuth  
- Google Maps API  

---

# GitHub

https://github.com/Ryu2013/care-shift-v3

---

# アプリケーション URL

https://www.ryuuichi-app.com/

# 全体像

https://www.figma.com/board/TK6MgaS5a4OTgUEaQmHeCh

---

# 画面推移図

https://www.figma.com/design/W7vW42qlox6ldEw0ebuMWa

---

# ER 図(v1の時のデザイン)

https://www.mermaidchart.com/

# パンフレットデザイン(v2の時のデザイン)

https://www.canva.com/design/DAG6z3XeaPA/IYWYx1CDTvaentIf4DuLAg/edit?utm_content=DAG6z3XeaPA&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton