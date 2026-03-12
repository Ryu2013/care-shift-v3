require "rails_helper"

RSpec.describe "従業員向けシフトAPI", type: :request do
  let(:admin) { create(:user, role: :admin, email: "admin-employee-shifts-#{SecureRandom.hex(4)}@example.com") }
  let(:office) { admin.office }
  let(:team) { admin.team }
  let(:employee) { create(:user, office: office, team: team, email: "employee-employee-shifts-#{SecureRandom.hex(4)}@example.com") }
  let(:client) { create(:client, office: office, team: team) }

  describe "GET /api/employee/shifts" do
    it "自分の月間シフトと当日シフト集計を返す" do
      create(:shift, office: office, client: client, user: employee, date: Date.current, start_time: "09:00", end_time: "17:00", work_status: :work)
      create(:shift, office: office, client: client, user: employee, date: Date.current + 1.day, start_time: "10:00", end_time: "12:00", work_status: :not_work)
      api_sign_in(employee)

      get "/api/employee/shifts", params: { date: Date.current.strftime("%Y-%m") }

      expect(response).to have_http_status(:ok)
      expect(json["today_shifts"]).to be_present
      expect(json["total_hours"]).to eq(10.0)
      expect(json["worked_hours"]).to eq(8.0)
      expect(json["date"]).to eq(Date.current.strftime("%Y-%m"))
    end

    it "管理者は user_id 指定で対象ユーザーを切り替えられる" do
      shift = create(:shift, office: office, client: client, user: employee, date: Date.new(2025, 11, 10), start_time: "09:00", end_time: "17:00")
      api_sign_in(admin)

      get "/api/employee/shifts", params: { user_id: employee.id, date: "2025-11" }

      expect(response).to have_http_status(:ok)
      expect(json["shifts"].values.flatten.map { |row| row["id"] }).to eq([ shift.id ])
    end
  end

  describe "PATCH /api/employee/shifts/:id" do
    it "対象ユーザーのシフト勤務状態を更新する" do
      shift = create(:shift, office: office, client: client, user: employee, work_status: :not_work)
      api_sign_in(employee)

      patch "/api/employee/shifts/#{shift.id}", params: { shift: { work_status: "work" } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(shift.reload.work_status).to eq("work")
    end

    it "別事業所のユーザー指定には not_found を返す" do
      other_user = create(:user)
      api_sign_in(admin)

      get "/api/employee/shifts", params: { user_id: other_user.id, date: "2025-11" }

      expect(response).to have_http_status(:not_found)
      expect(json["error"]).to eq("Not found")
    end
  end
end
