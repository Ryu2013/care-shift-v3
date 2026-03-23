require "rails_helper"

RSpec.describe "管理者向けサービス種別API", type: :request do
  let(:admin) { create(:user, role: :admin, email: "admin-service-types-#{SecureRandom.hex(4)}@example.com") }
  let(:office) { admin.office }

  describe "GET /api/admin/service_types" do
    it "現在の事業所のサービス種別一覧を返す" do
      target = create(:service_type, office: office, name: "身体介護")
      create(:service_type)
      api_sign_in(admin)

      get "/api/admin/service_types"

      expect(response).to have_http_status(:ok)
      expect(json.map { |row| row["id"] }).to eq([ target.id ])
    end
  end

  describe "POST /api/admin/service_types" do
    it "サービス種別を作成する" do
      api_sign_in(admin)

      expect {
        post "/api/admin/service_types", params: { service_type: { name: "生活援助" } }, headers: csrf_headers, as: :json
      }.to change(ServiceType, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(ServiceType.last.office_id).to eq(office.id)
    end
  end

  describe "PATCH /api/admin/service_types/:id" do
    it "サービス種別を更新する" do
      service_type = create(:service_type, office: office, name: "旧名称")
      api_sign_in(admin)

      patch "/api/admin/service_types/#{service_type.id}", params: { service_type: { name: "新名称" } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(service_type.reload.name).to eq("新名称")
    end
  end

  describe "DELETE /api/admin/service_types/:id" do
    it "未使用のサービス種別を削除する" do
      service_type = create(:service_type, office: office)
      api_sign_in(admin)

      expect {
        delete "/api/admin/service_types/#{service_type.id}", headers: csrf_headers, as: :json
      }.to change(ServiceType, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "使用中のサービス種別は削除できない" do
      shift = create(:shift, office: office, client: create(:client, office: office, team: admin.team), user: admin)
      service_type = create(:service_type, office: office)
      create(:service_record, shift: shift, service_type: service_type)
      api_sign_in(admin)

      expect {
        delete "/api/admin/service_types/#{service_type.id}", headers: csrf_headers, as: :json
      }.not_to change(ServiceType, :count)

      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
