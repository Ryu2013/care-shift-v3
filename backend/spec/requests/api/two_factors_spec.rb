require "rails_helper"

RSpec.describe "二要素認証API", type: :request do
  let(:user) { create(:user, confirmed_at: Time.current, otp_required_for_login: false) }

  describe "GET /api/two_factor/setup" do
    it "秘密鍵と QR URI を返す" do
      api_sign_in(user)

      get "/api/two_factor/setup"

      expect(response).to have_http_status(:ok)
      expect(json["secret_key"]).to be_present
      expect(json["qr_uri"]).to include(CGI.escape(user.email))
    end
  end

  describe "POST /api/two_factor/confirm" do
    it "正しい OTP で二要素認証を有効化する" do
      api_sign_in(user)
      get "/api/two_factor/setup"
      user.otp_secret = json["secret_key"]

      post "/api/two_factor/confirm", params: { otp_attempt: user.current_otp }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(user.reload.otp_required_for_login).to be(true)
      expect(user.otp_secret).to be_present
    end

    it "不正な OTP では unprocessable_content を返す" do
      api_sign_in(user)
      get "/api/two_factor/setup"

      post "/api/two_factor/confirm", params: { otp_attempt: "000000" }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to eq([ "認証コードが正しくありません" ])
    end
  end
end
