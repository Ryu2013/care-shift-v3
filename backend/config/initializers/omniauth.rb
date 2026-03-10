# frozen_string_literal: true

OmniAuth.config.allowed_request_methods = [ :post ]

# omniauth-rails_csrf_protection は ActionController::Base を前提としているため
# APIモードでは ActionController::InvalidAuthenticityToken が発生しやすい。
# そのため、保護を一部緩和するか、フロントエンドからの直接のリクエストを許可する設定を追加します。
OmniAuth.config.logger = Rails.logger
OmniAuth.config.request_validation_phase = nil

if Rails.env.development?
  OmniAuth.config.full_host = "http://localhost:5173"
end
