class Api::Users::ConfirmationsController < Devise::ConfirmationsController
  respond_to :json
  skip_before_action :verify_authenticity_token, only: [:create]

  def show
    self.resource = resource_class.confirm_by_token(params[:confirmation_token])
    yield resource if block_given?

    # 環境変数 FRONTEND_URL を使用し、未設定（開発環境）の場合はデフォルト値を使用
    frontend_url = ENV.fetch('FRONTEND_URL', 'http://localhost:5173')

    if resource.errors.empty?
      # 認証成功時はフロントエンドのログインページへリダイレクト
      redirect_to "#{frontend_url}/login?confirmed=true", allow_other_host: true
    else
      redirect_to "#{frontend_url}/login?error=confirmation_failed", allow_other_host: true
    end
  end

  def create
    self.resource = resource_class.send_confirmation_instructions(resource_params)
    yield resource if block_given?

    if successfully_sent?(resource)
      render json: { message: I18n.t("devise.confirmations.send_instructions") }, status: :ok
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
