class Api::Users::SessionsController < Devise::SessionsController
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    render json: UserSerializer.new(resource), status: :ok
  end

  def respond_to_on_destroy
    render json: { message: "ログアウトしました" }, status: :ok
  end
end
