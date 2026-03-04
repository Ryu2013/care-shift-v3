class Api::MeController < Api::AuthorizationController
  def show
    render json: UserSerializer.new(current_user)
  end
end
