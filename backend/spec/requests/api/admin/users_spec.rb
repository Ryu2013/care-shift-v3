require "rails_helper"

RSpec.describe "管理者向けユーザーAPI", type: :request do
  let(:admin) { create(:user, role: :admin, email: "admin-users-#{SecureRandom.hex(4)}@example.com") }
  let(:office) { admin.office }
  let(:team) { admin.team }
  let(:other_team) { create(:team, office: office) }
  let(:user) { create(:user, office: office, team: team, name: "B User", email: "managed-user-#{SecureRandom.hex(4)}@example.com") }
  let(:team_user) { create(:user, office: office, team: other_team, name: "A User", email: "team-user-#{SecureRandom.hex(4)}@example.com") }

  describe "GET /api/admin/users" do
    it "現在の事業所に属するユーザー一覧を返す" do
      create(:user)
      user
      api_sign_in(admin)

      get "/api/admin/users"

      expect(response).to have_http_status(:ok)
      expect(json.map { |row| row["id"] }).to include(admin.id, user.id)
    end

    it "team_id で絞り込める" do
      user
      team_user
      api_sign_in(admin)

      get "/api/admin/users", params: { team_id: other_team.id }

      expect(response).to have_http_status(:ok)
      expect(json.map { |row| row["name"] }).to eq(["A User"])
    end
  end

  describe "PATCH /api/admin/users/:id" do
    it "ユーザーを更新する" do
      api_sign_in(admin)

      patch "/api/admin/users/#{user.id}", params: {
        user: {
          name: "更新後",
          role: "admin",
          password: "",
          password_confirmation: ""
        }
      }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(user.reload.name).to eq("更新後")
      expect(user.admin?).to be(true)
    end

    it "自分自身の role は変更しない" do
      api_sign_in(admin)

      patch "/api/admin/users/#{admin.id}", params: {
        user: {
          role: "employee",
          name: "Self Update"
        }
      }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(admin.reload.admin?).to be(true)
      expect(admin.name).to eq("Self Update")
    end

    it "不正なパラメータでは unprocessable_content を返す" do
      api_sign_in(admin)

      patch "/api/admin/users/#{user.id}", params: {
        user: {
          name: "",
          email: "invalid"
        }
      }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to be_present
    end
  end

  describe "DELETE /api/admin/users/:id" do
    it "ユーザーを削除する" do
      user
      api_sign_in(admin)

      expect {
        delete "/api/admin/users/#{user.id}", headers: csrf_headers, as: :json
      }.to change(User, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
