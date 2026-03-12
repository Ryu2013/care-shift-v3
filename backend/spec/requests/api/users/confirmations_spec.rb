require "rails_helper"

RSpec.describe "メール確認API", type: :request do
  before do
    stub_const("ENV", ENV.to_h.merge("FRONTEND_URL" => "http://frontend.test"))
  end

  describe "POST /api/users/confirmation" do
    it "確認メール再送メッセージを返す" do
      user = create(:user, confirmed_at: nil)

      post "/api/users/confirmation", params: { user: { email: user.email } }, as: :json

      expect(response).to have_http_status(:ok)
      expect(json["message"]).to be_present
    end

    it "空メールでは unprocessable_content を返す" do
      post "/api/users/confirmation", params: { user: { email: "" } }, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to be_present
    end
  end

  describe "GET /api/users/confirmation" do
    it "有効なトークンならフロントへリダイレクトする" do
      user = create(:user, confirmed_at: nil)
      raw_token, enc_token = Devise.token_generator.generate(User, :confirmation_token)
      user.update_columns(confirmation_token: enc_token, confirmation_sent_at: Time.current)

      get "/api/users/confirmation", params: { confirmation_token: raw_token }

      expect(response).to redirect_to("http://frontend.test/login?confirmed=true")
    end

    it "無効なトークンなら失敗リダイレクトする" do
      get "/api/users/confirmation", params: { confirmation_token: "invalid-token" }

      expect(response).to redirect_to("http://frontend.test/login?error=confirmation_failed")
    end
  end
end
