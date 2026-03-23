require "rails_helper"

RSpec.describe "従業員向け希望休API", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  let(:office) { create(:office, monthly_day_off_limit: 2, request_deadline_day: 20) }
  let(:team) { create(:team, office: office) }
  let(:employee) { create(:user, office: office, team: team, email: "employee-day-off-#{SecureRandom.hex(4)}@example.com") }

  describe "GET /api/employee/day_off_months" do
    it "対象月の希望休設定と申請内容を返す" do
      day_off_month = create(:day_off_month, office: office, user: employee, target_month: Date.new(2026, 4, 1))
      create(:day_off_date, office: office, day_off_month: day_off_month, request_date: Date.new(2026, 4, 3))
      create(:day_off_date, office: office, day_off_month: day_off_month, request_date: Date.new(2026, 4, 10))
      api_sign_in(employee)

      get "/api/employee/day_off_months", params: { target_month: "2026-04" }

      expect(response).to have_http_status(:ok)
      expect(json["office"]["monthly_day_off_limit"]).to eq(2)
      expect(json["office"]["request_deadline_day"]).to eq(20)
      expect(json["day_off_month"]["target_month"]).to eq("2026-04-01")
      expect(json["day_off_month"]["request_dates"]).to eq([ "2026-04-03", "2026-04-10" ])
      expect(json["deadline_date"]).to eq("2026-04-20")
    end
  end

  describe "POST /api/employee/day_off_months" do
    before do
      travel_to Date.new(2026, 4, 10)
    end

    after do
      travel_back
    end

    it "希望休を新規作成できる" do
      api_sign_in(employee)

      expect {
        post "/api/employee/day_off_months",
             params: {
               target_month: "2026-04",
                 day_off_month: {
                 request_dates: [ "2026-04-03", "2026-04-10" ]
                 }
             },
             headers: csrf_headers,
             as: :json
      }.to change(DayOffMonth, :count).by(1)
       .and change(DayOffDate, :count).by(2)

      expect(response).to have_http_status(:created)
      expect(json["submitted_at"]).to be_present
      expect(json["request_dates"]).to eq([ "2026-04-03", "2026-04-10" ])
    end

    it "同月の既存申請を更新できる" do
      day_off_month = create(:day_off_month, office: office, user: employee, target_month: Date.new(2026, 4, 1))
      create(:day_off_date, office: office, day_off_month: day_off_month, request_date: Date.new(2026, 4, 3))
      api_sign_in(employee)

      expect {
        post "/api/employee/day_off_months",
             params: {
               target_month: "2026-04",
               day_off_month: {
                 request_dates: [ "2026-04-05" ]
               }
             },
             headers: csrf_headers,
             as: :json
      }.not_to change(DayOffMonth, :count)

      expect(response).to have_http_status(:ok)
      expect(day_off_month.reload.submitted_at).to be_present
      expect(day_off_month.day_off_dates.pluck(:request_date)).to eq([ Date.new(2026, 4, 5) ])
    end

    it "上限を超える日数は保存できない" do
      api_sign_in(employee)

      post "/api/employee/day_off_months",
           params: {
             target_month: "2026-04",
             day_off_month: {
               request_dates: [ "2026-04-03", "2026-04-10", "2026-04-17" ]
             }
           },
           headers: csrf_headers,
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to eq([ "希望休は月2日までです" ])
    end

    it "提出期限後は保存できない" do
      travel_back
      travel_to Date.new(2026, 4, 21)
      api_sign_in(employee)

      post "/api/employee/day_off_months",
           params: {
             target_month: "2026-04",
             day_off_month: {
               request_dates: [ "2026-04-03" ]
             }
           },
           headers: csrf_headers,
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to eq([ "提出期限を過ぎているため更新できません" ])
    end
  end
end
