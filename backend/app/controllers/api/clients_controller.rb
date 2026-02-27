class Api::ClientsController < Api::BaseController
  before_action :set_client, only: %i[update destroy]

  def index
    clients = if params[:team_id]
      current_user.office.teams.find(params[:team_id]).clients
    else
      current_user.office.clients
    end
    render json: clients.order(:name)
  end

  def create
    client = current_user.office.clients.build(client_params)
    if client.save
      render json: client, status: :created
    else
      render json: { errors: client.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @client.update(client_params)
      render json: @client
    else
      render json: { errors: @client.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @client.destroy!
    head :no_content
  end

  private

  def set_client
    @client = current_user.office.clients.find(params[:id])
  end

  def client_params
    params.require(:client).permit(:team_id, :name, :address,
      user_clients_attributes: [:id, :user_id, :note, :_destroy])
  end
end
