require "rails_helper"

RSpec.describe "CSRF API", type: :request do
  describe "GET /api/csrf" do
    it "CSRFトークンを返す" do
      get "/api/csrf"

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["csrf_token"]).to be_present
    end
  end
end
