class Api::UsersController < Api::AuthorizationController
  def index
    users = current_user.office.users
    render json: users.order(:name)
  end
end
