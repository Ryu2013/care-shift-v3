require "rails_helper"

RSpec.describe "共通サービス種別API", type: :request do
  describe "GET /api/service_types" do
    it "現在の事業所のサービス種別一覧を返す" do
      user = create(:user)
      target = create(:service_type, office: user.office, name: "身体介護")
      create(:service_type)
      api_sign_in(user)

      get "/api/service_types"

      expect(response).to have_http_status(:ok)
      expect(json.map { |row| row["id"] }).to eq([ target.id ])
    end
  end
end
