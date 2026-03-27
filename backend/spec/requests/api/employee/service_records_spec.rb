require "rails_helper"

RSpec.describe "従業員向けサービス記録API", type: :request do
  let(:admin) { create(:user, role: :admin, email: "admin-employee-service-records-#{SecureRandom.hex(4)}@example.com") }
  let(:office) { admin.office }
  let(:team) { admin.team }
  let(:employee) { create(:user, office: office, team: team, email: "employee-employee-service-records-#{SecureRandom.hex(4)}@example.com") }
  let(:client) { create(:client, office: office, team: team) }
  let(:service_type) { create(:service_type, office: office, name: "身体介護") }

  describe "GET /api/employee/service_records" do
    it "自分の指定月のサービス記録一覧を返す" do
      target_shift = create(:shift, office: office, client: client, user: employee, date: Date.new(2025, 11, 10))
      target = create(:service_record, shift: target_shift, service_type: service_type)
      create(:service_record, shift: create(:shift, office: office, client: client, user: employee, date: Date.new(2025, 12, 10)), service_type: service_type)
      api_sign_in(employee)

      get "/api/employee/service_records", params: { date: "2025-11" }

      expect(response).to have_http_status(:ok)
      expect(json.map { |row| row["id"] }).to eq([ target.id ])
    end
  end

  describe "POST /api/employee/service_records" do
    it "自分のシフトに対するサービス記録を作成する" do
      shift = create(:shift, office: office, client: client, user: employee)
      api_sign_in(employee)

      expect {
        post "/api/employee/service_records",
          params: {
            service_record: {
              shift_id: shift.id,
              service_type_id: service_type.id,
              appearance_status: "good",
              environment_preparation: true,
              note: "初回訪問"
            }
          },
          headers: csrf_headers,
          as: :json
      }.to change(ServiceRecord, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(ServiceRecord.last.shift_id).to eq(shift.id)
    end

    it "他ユーザーのシフトには作成できない" do
      other_user = create(:user, office: office, team: team)
      shift = create(:shift, office: office, client: client, user: other_user)
      api_sign_in(employee)

      post "/api/employee/service_records",
        params: { service_record: { shift_id: shift.id, service_type_id: service_type.id } },
        headers: csrf_headers,
        as: :json

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "PATCH /api/employee/service_records/:id" do
    it "自分のサービス記録を更新する" do
      service_record = create(:service_record, shift: create(:shift, office: office, client: client, user: employee), service_type: service_type, note: "旧")
      api_sign_in(employee)

      patch "/api/employee/service_records/#{service_record.id}",
        params: { service_record: { note: "更新後", record_checked: true } },
        headers: csrf_headers,
        as: :json

      expect(response).to have_http_status(:ok)
      expect(service_record.reload.note).to eq("更新後")
      expect(service_record.record_checked).to be(true)
    end
  end
end
