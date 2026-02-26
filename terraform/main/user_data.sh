#!/bin/bash
set -e
exec > /var/log/user-data.log 2>&1

# パッケージインストール
dnf update -y
dnf install -y git gcc gcc-c++ make openssl-devel readline-devel zlib-devel libffi-devel libyaml-devel mysql-devel

# rbenv + Ruby セットアップスクリプトを作成
cat > /tmp/setup_ruby.sh << 'SETUP'
#!/bin/bash
set -e
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"
CFLAGS="-O1" RUBY_CONFIGURE_OPTS="--disable-install-doc" rbenv install 3.3.10
rbenv global 3.3.10
gem install bundler
SETUP
chmod +x /tmp/setup_ruby.sh
su - ec2-user /tmp/setup_ruby.sh

# アプリディレクトリ作成とクローン
mkdir -p /var/www/care-shift-v3
chown ec2-user:ec2-user /var/www/care-shift-v3

# アプリセットアップスクリプトを作成
cat > /tmp/setup_app.sh << 'SETUP'
#!/bin/bash
set -e
git clone https://github.com/Ryu2013/care-shift-v3.git /var/www/care-shift-v3
export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"
cd /var/www/care-shift-v3/backend
bundle config set --local without 'development test'
bundle install
SETUP
chmod +x /tmp/setup_app.sh
su - ec2-user /tmp/setup_app.sh

# puma.service 作成
cat > /etc/systemd/system/puma.service << 'SERVICE'
[Unit]
Description=Puma Rails Server
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/var/www/care-shift-v3/backend
EnvironmentFile=/etc/environment
ExecStart=/home/ec2-user/.rbenv/shims/bundle exec puma -C config/puma.rb
Restart=always

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable puma
# puma起動は /etc/environment に RAILS_MASTER_KEY を設定後に手動で行う
