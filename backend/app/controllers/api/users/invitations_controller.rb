class Api::Users::InvitationsController < Devise::InvitationsController
  skip_before_action :verify_authenticity_token
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    if resource.errors.empty?
      render json: { message: "Invitation sent" }, status: :ok
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
