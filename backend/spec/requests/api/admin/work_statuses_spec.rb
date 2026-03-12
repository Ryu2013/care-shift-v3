require "rails_helper"

RSpec.describe "管理者向け勤務状態API", type: :request do
  let(:admin) { create(:user, role: :admin, email: "admin-work-status-#{SecureRandom.hex(4)}@example.com") }
  let(:office) { admin.office }
  let(:team) { admin.team }
  let(:other_team) { create(:team, office: office) }
  let(:client) { create(:client, office: office, team: team, name: "A Client") }
  let(:other_client) { create(:client, office: office, team: other_team, name: "B Client") }

  describe "GET /api/admin/work_statuses" do
    it "当日のチーム別勤務状態を返す" do
      create(:shift, office: office, client: client, user: admin, date: Date.current, start_time: "09:00", end_time: "17:00", work_status: :work)
      create(:shift, office: office, client: client, date: Date.current, start_time: "18:00", end_time: "20:00", work_status: :not_work)
      create(:shift, office: office, client: other_client, date: Date.current, start_time: "09:00", end_time: "12:00", work_status: :work)
      api_sign_in(admin)

      get "/api/admin/work_statuses"

      expect(response).to have_http_status(:ok)
      expect(json["work_count"]).to eq(1)
      expect(json["not_work_count"]).to eq(1)
      expect(json["shifts"].map { |row| row["client_id"] }.uniq).to eq([ client.id ])
      expect(json["shifts"].map { |row| row.dig("client", "name") }.uniq).to eq([ "A Client" ])
    end

    it "team_id と date で絞り込める" do
      target_shift = create(:shift, office: office, client: other_client, date: Date.new(2025, 11, 10), start_time: "09:00", end_time: "17:00", work_status: :work)
      create(:shift, office: office, client: client, date: Date.new(2025, 11, 10), start_time: "09:00", end_time: "17:00", work_status: :work)
      api_sign_in(admin)

      get "/api/admin/work_statuses", params: { team_id: other_team.id, date: "2025-11-10" }

      expect(response).to have_http_status(:ok)
      expect(json["shifts"].map { |row| row["id"] }).to eq([ target_shift.id ])
      expect(json["date"]).to eq("2025-11-10")
    end
  end
end
