require "rails_helper"

RSpec.describe "管理者向けサービス記録API", type: :request do
  let(:admin) { create(:user, role: :admin, email: "admin-service-records-#{SecureRandom.hex(4)}@example.com") }
  let(:office) { admin.office }
  let(:team) { admin.team }
  let(:employee) { create(:user, office: office, team: team, email: "employee-service-records-#{SecureRandom.hex(4)}@example.com") }
  let(:client) { create(:client, office: office, team: team) }
  let(:service_type) { create(:service_type, office: office, name: "身体介護") }

  describe "GET /api/admin/service_records" do
    it "指定月のサービス記録一覧を返す" do
      shift = create(:shift, office: office, client: client, user: employee, date: Date.new(2025, 11, 10))
      target = create(:service_record, shift: shift, service_type: service_type)
      create(:service_record, shift: create(:shift, office: office, client: client, user: employee, date: Date.new(2025, 12, 10)), service_type: service_type)
      api_sign_in(admin)

      get "/api/admin/service_records", params: { date: "2025-11" }

      expect(response).to have_http_status(:ok)
      expect(json.map { |row| row["id"] }).to eq([ target.id ])
    end

    it "team_id で絞り込める" do
      other_team = create(:team, office: office)
      target_shift = create(:shift, office: office, client: client, user: employee, date: Date.new(2025, 11, 10))
      other_client = create(:client, office: office, team: other_team)
      other_shift = create(:shift, office: office, client: other_client, user: employee, date: Date.new(2025, 11, 11))
      target = create(:service_record, shift: target_shift, service_type: service_type)
      create(:service_record, shift: other_shift, service_type: service_type)
      api_sign_in(admin)

      get "/api/admin/service_records", params: { date: "2025-11", team_id: team.id }

      expect(response).to have_http_status(:ok)
      expect(json.map { |row| row["id"] }).to eq([ target.id ])
    end
  end

  describe "GET /api/admin/service_records/:id" do
    it "事業所内のサービス記録詳細を返す" do
      service_record = create(:service_record, shift: create(:shift, office: office, client: client, user: employee), service_type: service_type)
      api_sign_in(admin)

      get "/api/admin/service_records/#{service_record.id}"

      expect(response).to have_http_status(:ok)
      expect(json["id"]).to eq(service_record.id)
    end
  end

  describe "PATCH /api/admin/service_records/:id" do
    it "サービス記録を更新する" do
      service_record = create(:service_record, shift: create(:shift, office: office, client: client, user: employee), service_type: service_type, note: "旧備考")
      api_sign_in(admin)

      patch "/api/admin/service_records/#{service_record.id}",
        params: { service_record: { note: "新備考", appearance_status: "poor" } },
        headers: csrf_headers,
        as: :json

      expect(response).to have_http_status(:ok)
      expect(service_record.reload.note).to eq("新備考")
      expect(service_record.appearance_status).to eq("poor")
    end
  end
end
