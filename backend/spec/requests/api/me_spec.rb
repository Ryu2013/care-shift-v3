require "rails_helper"

RSpec.describe "自分自身API", type: :request do
  describe "GET /api/me" do
    it "現在のユーザー情報を返す" do
      user = create(:user)
      sign_in user

      get "/api/me"

      expect(response).to have_http_status(:ok)
      expect(json["id"]).to eq(user.id)
      expect(json["email"]).to eq(user.email)
    end

    it "セッションがなければ unauthorized を返す" do
      get "/api/me"

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
