require "rails_helper"

RSpec.describe "管理者向けサブスクリプションAPI", type: :request do
  let(:admin) { create(:user, role: :admin, email: "admin-subscription-#{SecureRandom.hex(4)}@example.com") }
  let(:service) { instance_double(StripeSubscriptionService) }

  before do
    stub_const("ENV", ENV.to_h.merge("FRONTEND_URL" => "http://frontend.test"))
    allow(StripeSubscriptionService).to receive(:new).with(admin.office, admin).and_return(service)
  end

  describe "POST /api/admin/subscription/subscribe" do
    it "チェックアウトURLを返す" do
      allow(service).to receive(:create_checkout_session).and_return("http://checkout.test/session")
      api_sign_in(admin)

      post "/api/admin/subscription/subscribe", headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(json["url"]).to eq("http://checkout.test/session")
      expect(service).to have_received(:create_checkout_session).with(
        success_url: "http://frontend.test/settings?success=true",
        cancel_url: "http://frontend.test/subscription"
      )
    end
  end

  describe "POST /api/admin/subscription/portal" do
    it "ポータルURLを返す" do
      allow(service).to receive(:create_portal_session).and_return("http://portal.test/session")
      api_sign_in(admin)

      post "/api/admin/subscription/portal", headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(json["url"]).to eq("http://portal.test/session")
      expect(service).to have_received(:create_portal_session).with(
        return_url: "http://frontend.test/settings"
      )
    end
  end
end
