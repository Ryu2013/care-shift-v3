class Api::MeController < Api::BaseController
  def show
    render json: UserSerializer.new(current_user)
  end
end
