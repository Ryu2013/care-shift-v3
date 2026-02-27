class Api::UsersController < Api::BaseController
  before_action :set_user, only: %i[update destroy]

  def index
    team_id = params[:team_id]
    users = team_id ? current_user.office.teams.find(team_id).users : current_user.office.users
    render json: users.order(:name)
  end

  def update
    attributes = user_params.compact_blank
    attributes.delete(:password) if attributes[:password].blank?
    attributes.delete(:password_confirmation) if attributes[:password].blank?

    if @user.update(attributes)
      render json: @user
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @user.destroy!
    head :no_content
  end

  private

  def set_user
    @user = current_user.office.users.find(params[:id])
  end

  def user_params
    permitted = [:team_id, :name, :email, :address, :password, :password_confirmation]
    permitted << :role if current_user != @user
    params.require(:user).permit(permitted)
  end
end
