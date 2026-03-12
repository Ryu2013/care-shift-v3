require "rails_helper"

RSpec.describe "ユーザー登録API", type: :request do
  describe "POST /api/users" do
    it "事業所とチーム未指定なら自動作成して登録する" do
      expect {
        post "/api/users", params: {
          user: {
            name: "新規ユーザー",
            email: "register-#{SecureRandom.hex(4)}@example.com",
            password: "password123",
            password_confirmation: "password123"
          }
        }, headers: csrf_headers, as: :json
      }.to change(User, :count).by(1)
        .and change(Office, :count).by(1)
        .and change(Team, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json["email"]).to include("register-")
    end

    it "不正なパラメータでは unprocessable_content を返す" do
      post "/api/users", params: {
        user: {
          name: "",
          email: "invalid",
          password: "123",
          password_confirmation: "456"
        }
      }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to be_present
    end
  end
end
