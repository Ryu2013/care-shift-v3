class ApplicationController < ActionController::API
  include ActionController::Cookies
  include ActionController::RequestForgeryProtection
  include Devise::Controllers::Helpers
  include Pundit::Authorization
  include DeviseWhitelist
end
