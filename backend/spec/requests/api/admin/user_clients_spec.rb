require "rails_helper"

RSpec.describe "管理者向け利用者担当API", type: :request do
  let(:admin) { create(:user, role: :admin, email: "admin-user-clients-#{SecureRandom.hex(4)}@example.com") }
  let(:office) { admin.office }
  let(:team) { admin.team }
  let(:client) { create(:client, office: office, team: team) }
  let(:user) { create(:user, office: office, team: team, email: "target-user-client-#{SecureRandom.hex(4)}@example.com") }

  describe "POST /api/admin/user_clients" do
    it "利用者担当を作成する" do
      api_sign_in(admin)

      expect {
        post "/api/admin/user_clients", params: {
          user_client: { client_id: client.id, user_id: user.id, note: "担当メモ" }
        }, headers: csrf_headers, as: :json
      }.to change(UserClient, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json["user_id"]).to eq(user.id)
    end

    it "重複時は unprocessable_content を返す" do
      create(:user_client, office: office, client: client, user: user)
      api_sign_in(admin)

      post "/api/admin/user_clients", params: {
        user_client: { client_id: client.id, user_id: user.id, note: "担当メモ" }
      }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to be_present
    end

    it "別事業所のユーザーは not_found を返す" do
      outside_user = create(:user, email: "outside-user-client-#{SecureRandom.hex(4)}@example.com")
      api_sign_in(admin)

      post "/api/admin/user_clients", params: {
        user_client: { client_id: client.id, user_id: outside_user.id, note: "担当メモ" }
      }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:not_found)
      expect(json["errors"]).to eq([ "Not found" ])
    end
  end

  describe "DELETE /api/admin/user_clients/:id" do
    it "利用者担当を削除する" do
      user_client = create(:user_client, office: office, client: client, user: user)
      api_sign_in(admin)

      expect {
        delete "/api/admin/user_clients/#{user_client.id}", headers: csrf_headers, as: :json
      }.to change(UserClient, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
