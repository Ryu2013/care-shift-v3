require "rails_helper"

RSpec.describe "管理者向け希望休API", type: :request do
  let(:admin) { create(:user, role: :admin, email: "admin-day-off-#{SecureRandom.hex(4)}@example.com") }
  let(:office) { admin.office }
  let(:team_a) { admin.team }
  let(:team_b) { create(:team, office: office, name: "別部署") }
  let(:employee_a) { create(:user, office: office, team: team_a, name: "A職員", email: "employee-a-#{SecureRandom.hex(4)}@example.com") }
  let(:employee_b) { create(:user, office: office, team: team_b, name: "B職員", email: "employee-b-#{SecureRandom.hex(4)}@example.com") }

  describe "GET /api/admin/day_off_months" do
    it "対象月の希望休を部署込みで返す" do
      request_a = create(:day_off_month, office: office, user: employee_a, target_month: Date.new(2026, 4, 1))
      request_b = create(:day_off_month, office: office, user: employee_b, target_month: Date.new(2026, 4, 1))
      create(:day_off_date, office: office, day_off_month: request_a, request_date: Date.new(2026, 4, 3))
      create(:day_off_date, office: office, day_off_month: request_b, request_date: Date.new(2026, 4, 8))
      api_sign_in(admin)

      get "/api/admin/day_off_months", params: { target_month: "2026-04" }

      expect(response).to have_http_status(:ok)
      expect(json.map { |row| row["user"]["name"] }).to contain_exactly("A職員", "B職員")
      expect(json.map { |row| row["user"]["team_name"] }).to contain_exactly(team_a.name, team_b.name)
    end

    it "team_id で絞り込める" do
      request_a = create(:day_off_month, office: office, user: employee_a, target_month: Date.new(2026, 4, 1))
      request_b = create(:day_off_month, office: office, user: employee_b, target_month: Date.new(2026, 4, 1))
      create(:day_off_date, office: office, day_off_month: request_a, request_date: Date.new(2026, 4, 3))
      create(:day_off_date, office: office, day_off_month: request_b, request_date: Date.new(2026, 4, 8))
      api_sign_in(admin)

      get "/api/admin/day_off_months", params: { target_month: "2026-04", team_id: team_b.id }

      expect(response).to have_http_status(:ok)
      expect(json.map { |row| row["user"]["name"] }).to eq([ "B職員" ])
    end
  end
end
