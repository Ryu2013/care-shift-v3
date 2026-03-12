class Api::TestSupport::UsersController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    password = params[:password].presence || "E2E-#{SecureRandom.hex(10)}!safe"
    user = User.new(
      name: params[:name].presence || "Playwright User",
      email: params[:email].presence || "playwright-#{SecureRandom.hex(8)}@example.com",
      password: password,
      password_confirmation: password,
      confirmed_at: Time.current
    )
    user.setup_default_office_and_team!
    user.role = normalized_role
    user.save!

    render json: {
      id: user.id,
      email: user.email,
      password: password,
      role: user.role
    }, status: :created
  end

  private

  def normalized_role
    role = params[:role].presence_in(%w[admin employee])
    role || "admin"
  end
end
