require "rails_helper"

RSpec.describe "Google OAuth コールバックAPI", type: :request do
  before do
    OmniAuth.config.test_mode = true
    stub_const("ENV", ENV.to_h.merge("FRONTEND_URL" => "http://frontend.test"))
  end

  after do
    OmniAuth.config.mock_auth[:google_oauth2] = nil
    OmniAuth.config.test_mode = false
  end

  describe "GET /api/users/auth/google_oauth2/callback" do
    let(:auth_hash) do
      OmniAuth::AuthHash.new(
        provider: "google_oauth2",
        uid: "google-uid-123",
        info: {
          email: "google-user@example.com",
          name: "Google User"
        }
      )
    end

    it "ユーザー作成または取得に成功したらシフト画面へリダイレクトする" do
      user = create(:user, confirmed_at: Time.current, email: "google-user@example.com")
      allow(User).to receive(:from_omniauth).and_return(user)
      OmniAuth.config.mock_auth[:google_oauth2] = auth_hash

      get "/api/users/auth/google_oauth2/callback"

      expect(response).to redirect_to("http://frontend.test/shifts")
    end

    it "ユーザー保存に失敗したらエラーパラメータ付きでログイン画面へ戻す" do
      invalid_user = User.new
      invalid_user.errors.add(:base, "Google authentication failed")
      allow(User).to receive(:from_omniauth).and_return(invalid_user)
      OmniAuth.config.mock_auth[:google_oauth2] = auth_hash

      get "/api/users/auth/google_oauth2/callback"

      expect(response).to redirect_to("http://frontend.test/login?error=Google+authentication+failed")
    end
  end
end
