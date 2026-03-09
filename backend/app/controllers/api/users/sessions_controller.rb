class Api::Users::SessionsController < Devise::SessionsController
  respond_to :json

  def create
    user = User.find_by(email: params.dig(:user, :email))

    if user && !user.access_locked?
      if user&.valid_password?(params.dig(:user, :password))# Deviseメソッド
        if user.validate_otp(params.dig(:user, :otp_attempt))# Userモデルの自作メソッド
          super
        else
          render json: { error: "二段階認証コードが正しくありません" }, status: :unauthorized
        end
      else
        user.valid_for_authentication? { false } # Deviseメソッドでログイン失敗回数を増やす
        render json: { error: "メールアドレスまたはパスワードが正しくありません" }, status: :unauthorized
      end
    else
      render json: { error: "アカウントがロックされています" }, status: :unauthorized
    end
  end

  private

  def respond_with(resource, _opts = {})
    render json: UserSerializer.new(resource), status: :ok
  end

  def respond_to_on_destroy(*args)
    reset_session
    render json: { message: "ログアウトしました" }, status: :ok
  end
end
