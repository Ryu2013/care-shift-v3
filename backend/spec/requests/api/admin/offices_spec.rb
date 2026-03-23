require "rails_helper"

RSpec.describe "管理者向け事業所API", type: :request do
  let(:admin) { create(:user, role: :admin, email: "admin-office-#{SecureRandom.hex(4)}@example.com") }
  let(:employee) { create(:user, office: admin.office, team: admin.team, email: "employee-office-#{SecureRandom.hex(4)}@example.com") }

  describe "GET /api/admin/office" do
    it "現在の事業所情報を返す" do
      api_sign_in(admin)

      get "/api/admin/office"

      expect(response).to have_http_status(:ok)
      expect(json["id"]).to eq(admin.office.id)
      expect(json["name"]).to eq(admin.office.name)
      expect(json["monthly_day_off_limit"]).to eq(admin.office.monthly_day_off_limit)
      expect(json["request_deadline_day"]).to eq(admin.office.request_deadline_day)
    end

    it "管理者以外には forbidden を返す" do
      api_sign_in(employee)

      get "/api/admin/office"

      expect(response).to have_http_status(:forbidden)
      expect(json["errors"]).to eq([ "Forbidden" ])
    end
  end

  describe "PATCH /api/admin/office" do
    it "現在の事業所を更新する" do
      api_sign_in(admin)

      patch "/api/admin/office",
            params: { office: { name: "更新後事業所", monthly_day_off_limit: 4, request_deadline_day: 31 } },
            headers: csrf_headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(admin.office.reload.name).to eq("更新後事業所")
      expect(admin.office.monthly_day_off_limit).to eq(4)
      expect(admin.office.request_deadline_day).to eq(31)
    end

    it "不正なパラメータでは unprocessable_content を返す" do
      api_sign_in(admin)

      patch "/api/admin/office", params: { office: { name: "" } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to be_present
    end
  end
end
