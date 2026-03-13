require "rails_helper"

RSpec.describe "ユーザーセッションAPI", type: :request do
  let(:password) { "password123" }

  describe "POST /api/users/sign_in" do
    it "管理者ユーザーをログインさせ、シリアライズ済みユーザー情報を返す" do
      user = create(:user, role: :admin, confirmed_at: Time.current, password: password, password_confirmation: password, otp_required_for_login: false)

      post "/api/users/sign_in", params: { user: { email: user.email, password: password } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(json["id"]).to eq(user.id)
      expect(json["role"]).to eq("admin")
    end

    it "有効な OTP を使って 2FA ユーザーをログインさせる" do
      user = create(:user, role: :employee, confirmed_at: Time.current, password: password, password_confirmation: password, otp_required_for_login: true)
      user.update!(otp_secret: User.generate_otp_secret)

      post "/api/users/sign_in", params: { user: { email: user.email, password: password, otp_attempt: user.current_otp } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(json["id"]).to eq(user.id)
      expect(json["role"]).to eq("employee")
    end

    it "不正なパスワードでは unauthorized を返す" do
      user = create(:user, confirmed_at: Time.current, password: password, password_confirmation: password)

      post "/api/users/sign_in", params: { user: { email: user.email, password: "wrong-password" } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:unauthorized)
      expect(json["error"]).to be_present
    end

    it "不正な OTP では unauthorized を返す" do
      user = create(:user, confirmed_at: Time.current, password: password, password_confirmation: password, otp_required_for_login: true)
      user.update!(otp_secret: User.generate_otp_secret)

      post "/api/users/sign_in", params: { user: { email: user.email, password: password, otp_attempt: "000000" } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:unauthorized)
      expect(json["error"]).to be_present
    end

    it "ロック済みアカウントでは unauthorized を返す" do
      user = create(:user, confirmed_at: Time.current, password: password, password_confirmation: password)
      user.lock_access!

      post "/api/users/sign_in", params: { user: { email: user.email, password: password } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:unauthorized)
      expect(json["error"]).to eq("アカウントがロックされています")
    end
  end

  describe "DELETE /api/users/sign_out" do
    it "ログアウトする" do
      user = create(:user, confirmed_at: Time.current, password: password, password_confirmation: password)
      api_sign_in(user)

      delete "/api/users/sign_out", headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(json["message"]).to eq("ログアウトしました")
    end
  end
end
