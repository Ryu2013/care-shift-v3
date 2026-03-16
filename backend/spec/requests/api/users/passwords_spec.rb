require "rails_helper"

RSpec.describe "パスワード再設定API", type: :request do
  describe "POST /api/users/password" do
    it "再設定メール送信メッセージを返す" do
      user = create(:user, confirmed_at: Time.current)

      post "/api/users/password", params: { user: { email: user.email } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(json["message"]).to be_present
    end

    it "不正なメール形式では unprocessable_content を返す" do
      post "/api/users/password", params: { user: { email: "" } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to be_present
    end
  end

  describe "PUT /api/users/password" do
    it "有効なトークンでパスワードを更新する" do
      user = create(:user, confirmed_at: Time.current)
      token = user.send_reset_password_instructions

      put "/api/users/password", params: {
        user: {
          reset_password_token: token,
          password: "new-password123",
          password_confirmation: "new-password123"
        }
      }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(json["message"]).to be_present
    end

    it "無効なトークンでは unprocessable_content を返す" do
      put "/api/users/password", params: {
        user: {
          reset_password_token: "invalid-token",
          password: "new-password123",
          password_confirmation: "new-password123"
        }
      }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to be_present
    end
  end
end
