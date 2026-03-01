class Api::Users::TwoFactorsController < Api::BaseController
  before_action :ensure_secret_key!, only: %i[setup confirm]

  # 二段階認証のセットアップ情報を返す
  # フロントエンド側でotpauth URIからQRコードを描画する
  def setup
    render json: {
      secret_key: @secret_key,
      qr_uri: current_user.otp_provisioning_uri(current_user.email, issuer: "ShiftManagement")
    }
  end

  # 二段階認証の有効化確認処理
  def confirm
    if current_user.validate_and_consume_otp!(params[:otp_attempt])
      current_user.update!(
        otp_required_for_login: true,
        otp_secret: session.delete(:pending_otp_secret)
      )
      render json: { message: "二段階認証を有効にしました" }
    else
      render json: { error: "認証コードが正しくありません" }, status: :unprocessable_entity
    end
  end

  private

  def ensure_secret_key!
    session[:pending_otp_secret] ||= current_user.otp_secret.presence || User.generate_otp_secret
    current_user.otp_secret = session[:pending_otp_secret]
    @secret_key = current_user.otp_secret
  end
end
