class Api::Users::InvitationsController < Devise::InvitationsController
  skip_before_action :verify_authenticity_token
  before_action :authenticate_user!, only: :create
  before_action :authorize_admin!, only: :create
  respond_to :json

  private

  def invite_resource
    team = current_user.office.teams.find(invite_params.fetch(:team_id))

    User.invite!(
      {
        email: invite_params.fetch(:email),
        name: invite_params.fetch(:name),
        team: team,
        office: current_user.office,
        role: invite_params[:role].presence || "employee"
      },
      current_user
    )
  end

  def invite_params
    params.require(:user).permit(:email, :name, :team_id, :role)
  end

  def authorize_admin!
    authorize :admin, :allow?
  end

  def respond_with(resource, _opts = {})
    if resource.errors.empty?
      render json: { message: "Invitation sent" }, status: :ok
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_content
    end
  end
end
