class Api::Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  skip_before_action :verify_authenticity_token, only: :google_oauth2

  def google_oauth2
    user = User.from_omniauth(request.env["omniauth.auth"])
    frontend_url = ENV.fetch("FRONTEND_URL", "http://localhost:5173")

    if user.persisted?
      sign_in user
      redirect_to "#{frontend_url}/shifts", allow_other_host: true
    else
      error_message = user.errors.full_messages.join(", ")
      redirect_to "#{frontend_url}/login?error=#{CGI.escape(error_message)}", allow_other_host: true
    end
  end
end
