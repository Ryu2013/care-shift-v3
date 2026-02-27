class Api::UserClientsController < Api::BaseController
  def create
    client = current_user.office.clients.find(params[:user_client][:client_id])
    user_client = client.user_clients.build(user_client_params.merge(office: current_user.office))
    if user_client.save
      render json: user_client, status: :created
    else
      render json: { errors: user_client.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    user_client = current_user.office.user_clients.find(params[:id])
    user_client.destroy!
    head :no_content
  end

  private

  def user_client_params
    params.require(:user_client).permit(:user_id, :client_id, :note)
  end
end
