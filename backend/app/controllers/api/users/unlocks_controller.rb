class Api::Users::UnlocksController < Devise::UnlocksController
  respond_to :json
  skip_before_action :verify_authenticity_token, only: [:create]

  def create
    self.resource = resource_class.send_unlock_instructions(resource_params)
    yield resource if block_given?

    if successfully_sent?(resource)
      render json: { message: I18n.t("devise.unlocks.send_instructions") }, status: :ok
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end

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
