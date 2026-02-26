# EC2初期セットアップ手順

SSM Session Managerで接続して実行する（初回のみ）。

## 1. SSMで接続

AWSコンソール → EC2 → インスタンスを選択 → 接続 → Session Manager

またはCLI:
```bash
aws ssm start-session --target <instance-id>
```

## 2. 基本パッケージのインストール

```bash
sudo dnf update -y
sudo dnf install -y git gcc gcc-c++ make openssl-devel readline-devel zlib-devel libffi-devel
```

## 3. Rubyのインストール（rbenv使用）

```bash
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
source ~/.bashrc

git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build

rbenv install 3.3.10
rbenv global 3.3.10
ruby -v
```

## 4. アプリディレクトリの作成とクローン

```bash
sudo mkdir -p /var/www/care-shift-v3
sudo chown ec2-user:ec2-user /var/www/care-shift-v3

cd /var/www/care-shift-v3
git clone https://github.com/Ryu2013/care-shift-v3.git .
```

## 5. 環境変数の設定

```bash
sudo vi /etc/environment
```

以下を追記：
```
RAILS_ENV=production
RAILS_MASTER_KEY=<master.keyの中身>
```

> `DATABASE_URL` はRailsクレデンシャル（`config/credentials/production.yml.enc`）に保管する。
> ```yaml
> database_url: mysql2://admin:<password>@<rdsエンドポイント>:3306/app
> ```

## 6. bundleインストール

```bash
cd /var/www/care-shift-v3/backend
gem install bundler
bundle install --without development test
```

## 7. systemd puma.serviceの設定

```bash
sudo vi /etc/systemd/system/puma.service
```

以下を記載：
```ini
[Unit]
Description=Puma Rails Server
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/var/www/care-shift-v3/backend
EnvironmentFile=/etc/environment
ExecStart=/home/ec2-user/.local/share/mise/shims/bundle exec puma -C config/puma.rb
Restart=always

[Install]
WantedBy=multi-user.target
```

## 8. サービスの起動

```bash
sudo systemctl daemon-reload
sudo systemctl enable puma
sudo systemctl start puma
sudo systemctl status puma
```
