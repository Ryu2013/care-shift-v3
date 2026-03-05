class Api::Users::ConfirmationsController < Devise::ConfirmationsController
  def show
    self.resource = resource_class.confirm_by_token(params[:confirmation_token])
    yield resource if block_given?

    # 環境変数 FRONTEND_URL を使用し、未設定（開発環境）の場合はデフォルト値を使用
    frontend_url = ENV.fetch('FRONTEND_URL', 'http://localhost:5173')

    if resource.errors.empty?
      # 認証成功時はフロントエンドのログインページへリダイレクト
      redirect_to "#{frontend_url}/login?confirmed=true", allow_other_host: true
    else
      # エラー時（すでに認証済み、トークン無効など）もログインページへ（エラーパラメータ付き）
      redirect_to "#{frontend_url}/login?error=confirmation_failed", allow_other_host: true
    end
  end
end
