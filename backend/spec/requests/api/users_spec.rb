require "rails_helper"

RSpec.describe "ユーザー一覧API", type: :request do
  describe "GET /api/users" do
    it "現在の事業所に属するユーザー一覧を名前順で返す" do
      office = create(:office)
      team = create(:team, office: office)
      user = create(:user, office: office, team: team, name: "B User")
      visible_user = create(:user, office: office, team: team, name: "A User")
      create(:user, name: "Outside User")
      api_sign_in(user)

      get "/api/users"

      expect(response).to have_http_status(:ok)
      expect(json.map { |row| row["name"] }).to include("A User", "B User")
      expect(json.map { |row| row["name"] }).not_to include("Outside User")
      expect(json.first["name"]).to eq("A User")
    end

    it "未認証なら unauthorized を返す" do
      get "/api/users"

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
