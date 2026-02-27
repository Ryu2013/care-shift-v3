class Api::ClientNeedsController < Api::BaseController
  def index
    client = current_user.office.clients.find(params[:client_id])
    render json: client.client_needs.order(:week, :shift_type, :start_time)
  end

  def create
    client = current_user.office.clients.find(client_need_params[:client_id])
    need = client.client_needs.build(client_need_params)
    if need.save
      render json: need, status: :created
    else
      render json: { errors: need.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    need = current_user.office.client_needs.find(params[:id])
    need.destroy!
    head :no_content
  end

  private

  def client_need_params
    params.require(:client_need).permit(:client_id, :shift_type, :week, :start_time, :end_time, :slots)
  end
end
