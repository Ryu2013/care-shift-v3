require "rails_helper"

RSpec.describe "共通シフトAPI", type: :request do
  let(:admin) { create(:user, role: :admin, email: "admin-shifts-common-#{SecureRandom.hex(4)}@example.com") }
  let(:office) { admin.office }
  let(:team) { admin.team }
  let(:employee) { create(:user, office: office, team: team, email: "employee-shifts-common-#{SecureRandom.hex(4)}@example.com") }
  let(:client) { create(:client, office: office, team: team) }

  describe "GET /api/shifts" do
    it "自分の指定月シフト一覧を返す" do
      target = create(:shift, office: office, client: client, user: employee, date: Date.new(2025, 11, 10))
      create(:shift, office: office, client: client, user: employee, date: Date.new(2025, 12, 10))
      api_sign_in(employee)

      get "/api/shifts", params: { date: "2025-11" }

      expect(response).to have_http_status(:ok)
      expect(json.map { |row| row["id"] }).to eq([target.id])
    end

    it "管理者は user_id 指定で他ユーザーのシフト一覧を返せる" do
      target = create(:shift, office: office, client: client, user: employee, date: Date.new(2025, 11, 10))
      api_sign_in(admin)

      get "/api/shifts", params: { user_id: employee.id, date: "2025-11" }

      expect(response).to have_http_status(:ok)
      expect(json.map { |row| row["id"] }).to eq([target.id])
    end

    it "従業員が他ユーザーを指定すると forbidden を返す" do
      api_sign_in(employee)

      get "/api/shifts", params: { user_id: admin.id, date: "2025-11" }

      expect(response).to have_http_status(:forbidden)
      expect(json["error"]).to eq("Forbidden")
    end
  end

  describe "PATCH /api/shifts/:id" do
    it "自分のシフト勤務状態を更新する" do
      shift = create(:shift, office: office, client: client, user: employee, work_status: :not_work)
      api_sign_in(employee)

      patch "/api/shifts/#{shift.id}", params: { shift: { work_status: "work" } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(shift.reload.work_status).to eq("work")
    end

    it "管理者は他ユーザーのシフトも更新できる" do
      shift = create(:shift, office: office, client: client, user: employee, work_status: :not_work)
      api_sign_in(admin)

      patch "/api/shifts/#{shift.id}", params: { shift: { work_status: "work" } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(shift.reload.work_status).to eq("work")
    end

    it "従業員が他ユーザーのシフトを更新すると forbidden を返す" do
      shift = create(:shift, office: office, client: client, user: admin, work_status: :not_work)
      api_sign_in(employee)

      patch "/api/shifts/#{shift.id}", params: { shift: { work_status: "work" } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:forbidden)
      expect(json["error"]).to eq("Forbidden")
    end
  end
end
