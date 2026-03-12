require "rails_helper"

RSpec.describe "管理者向け利用者ニーズAPI", type: :request do
  let(:admin) { create(:user, role: :admin, email: "admin-client-needs-#{SecureRandom.hex(4)}@example.com") }
  let(:office) { admin.office }
  let(:team) { admin.team }
  let(:client) { create(:client, office: office, team: team) }

  describe "GET /api/admin/client_needs" do
    it "利用者に紐づくニーズ一覧を返す" do
      need = create(:client_need, office: office, client: client, week: :monday)
      create(:client_need)
      api_sign_in(admin)

      get "/api/admin/client_needs", params: { client_id: client.id }

      expect(response).to have_http_status(:ok)
      expect(json.map { |row| row["id"] }).to eq([need.id])
    end

    it "別事業所の利用者には not_found を返す" do
      other_client = create(:client)
      api_sign_in(admin)

      get "/api/admin/client_needs", params: { client_id: other_client.id }

      expect(response).to have_http_status(:not_found)
      expect(json["error"]).to eq("Not found")
    end
  end

  describe "POST /api/admin/client_needs" do
    it "利用者ニーズを作成する" do
      api_sign_in(admin)

      expect {
        post "/api/admin/client_needs", params: {
          client_need: {
            client_id: client.id,
            shift_type: "day",
            week: "monday",
            start_time: "09:00",
            end_time: "17:00",
            slots: 2
          }
        }, headers: csrf_headers, as: :json
      }.to change(ClientNeed, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json["slots"]).to eq(2)
    end

    it "不正なパラメータでは unprocessable_content を返す" do
      api_sign_in(admin)

      post "/api/admin/client_needs", params: {
        client_need: {
          client_id: client.id,
          shift_type: "day",
          week: "monday",
          start_time: "09:00",
          end_time: "17:00",
          slots: nil
        }
      }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to be_present
    end
  end

  describe "DELETE /api/admin/client_needs/:id" do
    it "利用者ニーズを削除する" do
      need = create(:client_need, office: office, client: client)
      api_sign_in(admin)

      expect {
        delete "/api/admin/client_needs/#{need.id}", headers: csrf_headers, as: :json
      }.to change(ClientNeed, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
