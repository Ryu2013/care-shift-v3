class ApplicationController < ActionController::API
  include ActionController::Cookies
  include ActionController::RequestForgeryProtection
  include Devise::Controllers::Helpers
  include Pundit::Authorization
  include DeviseWhitelist

  protect_from_forgery with: :exception, unless: -> { request.path.start_with?("/api/users/auth/") } # OmniAuthルートのCSRF検証を除外
  after_action :set_csrf_cookie # CSRFトークンをクッキーに設定

  private

  def set_csrf_cookie
    cookies["XSRF-TOKEN"] = {
      value: form_authenticity_token, # 上のRequestForgeryProtectionモジュールで生成されたトークン
      same_site: :lax,
      secure: Rails.env.production?,
      domain: :all
    }
  end
end
