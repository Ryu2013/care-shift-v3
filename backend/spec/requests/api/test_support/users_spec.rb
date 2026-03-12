require "rails_helper"

RSpec.describe "テスト支援ユーザーAPI", type: :request do
  describe "POST /api/test_support/users" do
    it "事業所とチームを持つ確認済み管理者ユーザーを作成する" do
      expect {
        post "/api/test_support/users", params: { name: "E2E Admin", email: "e2e-admin@example.com", password: "Strong-E2E-Password-123!" }, as: :json
      }.to change(User, :count).by(1)
        .and change(Office, :count).by(1)
        .and change(Team, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json["email"]).to eq("e2e-admin@example.com")
      expect(json["role"]).to eq("admin")
      expect(User.find_by!(email: "e2e-admin@example.com")).to be_confirmed
    end

    it "指定時には従業員ユーザーを作成する" do
      post "/api/test_support/users", params: { role: "employee" }, as: :json

      expect(response).to have_http_status(:created)
      expect(json["role"]).to eq("employee")
    end
  end
end
