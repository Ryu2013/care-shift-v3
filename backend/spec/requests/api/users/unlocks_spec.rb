require "rails_helper"

RSpec.describe "アカウントロック解除API", type: :request do
  before do
    stub_const("ENV", ENV.to_h.merge("FRONTEND_URL" => "http://frontend.test"))
  end

  describe "POST /api/users/unlock" do
    it "ロック解除メール送信メッセージを返す" do
      user = create(:user, confirmed_at: Time.current)
      user.lock_access!

      post "/api/users/unlock", params: { user: { email: user.email } }, as: :json

      expect(response).to have_http_status(:ok)
      expect(json["message"]).to be_present
    end

    it "空メールでは unprocessable_content を返す" do
      post "/api/users/unlock", params: { user: { email: "" } }, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to be_present
    end
  end

  describe "GET /api/users/unlock" do
    it "有効なトークンならフロントへリダイレクトする" do
      user = create(:user, confirmed_at: Time.current)
      user.lock_access!
      token = user.send_unlock_instructions

      get "/api/users/unlock", params: { unlock_token: token }

      expect(response).to redirect_to("http://frontend.test/login?unlocked=true")
    end

    it "無効なトークンなら失敗リダイレクトする" do
      get "/api/users/unlock", params: { unlock_token: "invalid-token" }

      expect(response).to redirect_to("http://frontend.test/login?unlocked=false")
    end
  end
end
