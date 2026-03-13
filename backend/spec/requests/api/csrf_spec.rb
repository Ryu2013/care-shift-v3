require "rails_helper"

RSpec.describe "CSRF API", type: :request do
  describe "GET /api/csrf" do
    it "no_content と CSRF cookie を返す" do
      get "/api/csrf"

      expect(response).to have_http_status(:no_content)
      expect(cookies["XSRF-TOKEN"]).to be_present
    end
  end
end
