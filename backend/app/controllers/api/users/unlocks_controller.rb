class Api::Users::UnlocksController < Devise::UnlocksController
  def show
    self.resource = User.unlock_access_by_token(params[:unlock_token])# Deviseのメソッドでロックを解除
    if block_given?
      yield resource
    end

    frontend_url = ENV.fetch("FRONTEND_URL", "http://localhost:5173")

    if resource.errors.empty?
      redirect_to "#{frontend_url}/login?unlocked=true", allow_other_host: true
    else
      redirect_to "#{frontend_url}/login?unlocked=false", allow_other_host: true
    end
  end
end
