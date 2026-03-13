require "rails_helper"

RSpec.describe "勤務状態シナリオ作成API", type: :request do
  describe "POST /api/test_support/work_status_scenarios" do
    it "管理者、従業員、利用者、シフトのシナリオを作成する" do
      expect {
        post "/api/test_support/work_status_scenarios",
             params: {
               admin_email: "scenario-admin@example.com",
               employee_name: "Scenario Employee",
               client_name: "Scenario Client",
               date: "2026-03-10",
               work_status: "work"
             },
             as: :json
      }.to change(User, :count).by(2)
        .and change(Client, :count).by(1)
        .and change(Shift, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json.dig("admin", "email")).to eq("scenario-admin@example.com")
      expect(json.dig("employee", "name")).to eq("Scenario Employee")
      expect(json.dig("employee", "email")).to eq(User.find_by!(name: "Scenario Employee").email)
      expect(json.dig("employee", "password")).to be_present
      expect(json.dig("client", "name")).to eq("Scenario Client")
      expect(json.dig("shift", "work_status")).to eq("work")
      expect(json.dig("shift", "start_time")).to eq("09:00")
      expect(json.dig("shift", "end_time")).to eq("18:00")
    end
  end
end
