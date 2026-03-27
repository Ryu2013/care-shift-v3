require "rails_helper"

RSpec.describe "管理者向けシフトAPI", type: :request do
  let(:admin) { create(:user, role: :admin, email: "admin-shifts-#{SecureRandom.hex(4)}@example.com") }
  let(:office) { admin.office }
  let(:team) { admin.team }
  let(:client) { create(:client, office: office, team: team) }

  describe "GET /api/admin/shifts" do
    it "指定月のシフト一覧を返す" do
      target = create(:shift, office: office, client: client, date: Date.new(2025, 11, 10))
      create(:shift, office: office, client: client, date: Date.new(2025, 12, 1))
      api_sign_in(admin)

      get "/api/admin/shifts", params: { date: "2025-11" }

      expect(response).to have_http_status(:ok)
      expect(json.map { |row| row["id"] }).to include(target.id)
      expect(json.map { |row| row["id"] }).not_to include(Shift.order(:id).last.id) if Shift.count > 1
    end
  end

  describe "POST /api/admin/shifts" do
    it "サブスクリプションが有効ならシフトを作成する" do
      office.update!(subscription_status: "active")
      api_sign_in(admin)

      expect {
        post "/api/admin/shifts", params: {
          shift: {
            client_id: client.id,
            user_id: admin.id,
            shift_type: :day,
            date: "2025-11-10",
            start_time: "09:00",
            end_time: "17:00"
          }
        }, headers: csrf_headers, as: :json
      }.to change(Shift, :count).by(1)

      expect(response).to have_http_status(:created)
    end

    it "サブスクリプションが無効で事業所が無料枠超過なら payment_required を返す" do
      office.update!(subscription_status: "canceled")
      4.times do |index|
        create(:user, office: office, team: team, email: "inactive-shift-user-#{index}-#{SecureRandom.hex(2)}@example.com")
      end
      api_sign_in(admin)

      post "/api/admin/shifts", params: {
        shift: {
          client_id: client.id,
          shift_type: :day,
          date: "2025-11-10",
          start_time: "09:00",
          end_time: "17:00"
        }
      }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:payment_required)
      expect(json["errors"]).to eq([ "サブスクリプションが有効ではありません" ])
    end

    it "別事業所の利用者は not_found を返す" do
      office.update!(subscription_status: "active")
      outside_client = create(:client)
      api_sign_in(admin)

      post "/api/admin/shifts", params: {
        shift: {
          client_id: outside_client.id,
          user_id: admin.id,
          shift_type: :day,
          date: "2025-11-10",
          start_time: "09:00",
          end_time: "17:00"
        }
      }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:not_found)
      expect(json["errors"]).to eq([ "Not found" ])
    end

    it "別事業所のユーザーは not_found を返す" do
      office.update!(subscription_status: "active")
      outside_user = create(:user, email: "outside-shift-user-#{SecureRandom.hex(4)}@example.com")
      api_sign_in(admin)

      post "/api/admin/shifts", params: {
        shift: {
          client_id: client.id,
          user_id: outside_user.id,
          shift_type: :day,
          date: "2025-11-10",
          start_time: "09:00",
          end_time: "17:00"
        }
      }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:not_found)
      expect(json["errors"]).to eq([ "Not found" ])
    end
  end

  describe "POST /api/admin/shifts/generate_monthly" do
    it "作成したシフト件数を返す" do
      create(:client_need, office: office, client: client, week: :monday, shift_type: :day, start_time: "09:00", end_time: "17:00", slots: 1)
      api_sign_in(admin)

      post "/api/admin/shifts/generate_monthly", params: { client_id: client.id, date: "2025-02" }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(json["created"]).to be > 0
    end
  end
end
