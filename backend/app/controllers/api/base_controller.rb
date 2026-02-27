class Api::BaseController < ApplicationController
  before_action :authenticate_user!

  respond_to :json

  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from Pundit::NotAuthorizedError,   with: :forbidden

  private

  def not_found
    render json: { error: "Not found" }, status: :not_found
  end

  def forbidden
    render json: { error: "Forbidden" }, status: :forbidden
  end
end
