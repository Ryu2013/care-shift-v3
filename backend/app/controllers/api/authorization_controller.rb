class Api::AuthorizationController < ApplicationController
  before_action :authenticate_user!

  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from Pundit::NotAuthorizedError,   with: :forbidden

  private

  def not_found
    render json: { errors: [ "Not found" ] }, status: :not_found
  end

  def forbidden
    render json: { errors: [ "Forbidden" ] }, status: :forbidden
  end
end
