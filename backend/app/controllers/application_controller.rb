class ApplicationController < ActionController::API
  include ActionController::Cookies
  include ActionController::RequestForgeryProtection
  include Devise::Controllers::Helpers
  include Pundit::Authorization
  include DeviseWhitelist

  protect_from_forgery with: :exception, unless: -> { request.path == "/api/users/auth/google_oauth2/callback" } # OmniAuth callbackのみCSRF検証を除外
end
