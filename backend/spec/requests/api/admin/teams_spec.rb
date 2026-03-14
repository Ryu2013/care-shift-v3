require "rails_helper"

RSpec.describe "管理者向けチームAPI", type: :request do
  let(:admin) { create(:user, role: :admin, email: "admin-teams-#{SecureRandom.hex(4)}@example.com") }
  let(:employee) { create(:user, role: :employee, office: admin.office, team: admin.team, email: "employee-teams-#{SecureRandom.hex(4)}@example.com") }

  describe "GET /api/admin/teams" do
    it "現在の事業所に属するチーム一覧を返す" do
      team = create(:team, office: admin.office)
      create(:team)
      api_sign_in(admin)

      get "/api/admin/teams"

      expect(response).to have_http_status(:ok)
      expect(json.map { |row| row["id"] }).to include(team.id, admin.team.id)
    end

    it "管理者以外のユーザーには forbidden を返す" do
      sign_in employee

      get "/api/admin/teams"

      expect(response).to have_http_status(:forbidden)
      expect(json["error"]).to eq("Forbidden")
    end
  end

  describe "POST /api/admin/teams" do
    it "チームを作成する" do
      api_sign_in(admin)

      expect {
        post "/api/admin/teams", params: { team: { name: "新規チーム" } }, headers: csrf_headers, as: :json
      }.to change(Team, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json["name"]).to eq("新規チーム")
    end

    it "不正なパラメータでは unprocessable_content を返す" do
      api_sign_in(admin)

      post "/api/admin/teams", params: { team: { name: "" } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to be_present
    end
  end

  describe "PATCH /api/admin/teams/:id" do
    it "チームを更新する" do
      team = create(:team, office: admin.office)
      api_sign_in(admin)

      patch "/api/admin/teams/#{team.id}", params: { team: { name: "変更後" } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(team.reload.name).to eq("変更後")
    end
  end

  describe "DELETE /api/admin/teams/:id" do
    it "チームを削除する" do
      team = create(:team, office: admin.office)
      api_sign_in(admin)

      expect {
        delete "/api/admin/teams/#{team.id}", headers: csrf_headers, as: :json
      }.to change(Team, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
