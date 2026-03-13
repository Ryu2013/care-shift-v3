require "rails_helper"

RSpec.describe "管理者向け利用者API", type: :request do
  let(:admin) { create(:user, role: :admin, email: "admin-clients-#{SecureRandom.hex(4)}@example.com") }
  let(:office) { admin.office }
  let(:team) { admin.team }

  describe "GET /api/admin/clients" do
    it "現在の事業所に属する利用者一覧を返す" do
      client = create(:client, office: office, team: team, name: "対象")
      create(:client)
      api_sign_in(admin)

      get "/api/admin/clients"

      expect(response).to have_http_status(:ok)
      expect(json.map { |row| row["id"] }).to include(client.id)
    end

    it "team_id で絞り込める" do
      other_team = create(:team, office: office)
      target = create(:client, office: office, team: other_team)
      create(:client, office: office, team: team)
      api_sign_in(admin)

      get "/api/admin/clients", params: { team_id: other_team.id }

      expect(response).to have_http_status(:ok)
      expect(json.map { |row| row["id"] }).to eq([ target.id ])
    end
  end

  describe "POST /api/admin/clients" do
    it "利用者を作成する" do
      api_sign_in(admin)

      expect {
        post "/api/admin/clients", params: { client: { name: "新規利用者", address: "東京都", team_id: team.id } }, headers: csrf_headers, as: :json
      }.to change(Client, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json["name"]).to eq("新規利用者")
    end
  end

  describe "PATCH /api/admin/clients/:id" do
    it "利用者を更新する" do
      client = create(:client, office: office, team: team)
      api_sign_in(admin)

      patch "/api/admin/clients/#{client.id}", params: { client: { name: "更新後" } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(client.reload.name).to eq("更新後")
    end
  end

  describe "DELETE /api/admin/clients/:id" do
    it "利用者を削除する" do
      client = create(:client, office: office, team: team)
      api_sign_in(admin)

      expect {
        delete "/api/admin/clients/#{client.id}", headers: csrf_headers, as: :json
      }.to change(Client, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
