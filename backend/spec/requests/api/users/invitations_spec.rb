require "rails_helper"

RSpec.describe "招待API", type: :request do
  let(:admin) { create(:user, role: :admin, confirmed_at: Time.current, email: "admin-invitation-#{SecureRandom.hex(4)}@example.com") }

  describe "POST /api/users/invitation" do
    it "招待送信成功時に ok を返す" do
      invited_user = build_stubbed(:user, email: "invited-#{SecureRandom.hex(4)}@example.com")
      allow(User).to receive(:invite!).and_return(invited_user)
      api_sign_in(admin)

      post "/api/users/invitation", params: {
        user: {
          email: "invited-#{SecureRandom.hex(4)}@example.com",
          name: "招待ユーザー"
        }
      }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(json["message"]).to eq("Invitation sent")
    end

    it "不正なパラメータでは unprocessable_content を返す" do
      api_sign_in(admin)

      post "/api/users/invitation", params: {
        user: {
          email: "",
          name: "招待ユーザー"
        }
      }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to be_present
    end
  end
end
