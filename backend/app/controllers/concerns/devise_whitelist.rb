module DeviseWhitelist
  extend ActiveSupport::Concern

  included do
    before_action :configure_permitted_parameters, if: :devise_controller?
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_in, keys: [ :otp_attempt, :remember_me ])
    devise_parameter_sanitizer.permit(:sign_up, keys: [ :name, :office_id, :team_id ])
    devise_parameter_sanitizer.permit(:account_update, keys: [ :name, :address ])
    devise_parameter_sanitizer.permit(:invite, keys: [ :name, :team_id, :role ])
    devise_parameter_sanitizer.permit(:accept_invitation, keys: [ :name, :password, :password_confirmation ])
  end
end
