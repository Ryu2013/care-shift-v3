class Api::RoomsController < Api::BaseController
  before_action :set_room, only: %i[show update destroy]

  def index
    render json: current_user.office.rooms.order(:name)
  end

  def show
    render json: @room
  end

  def create
    room = current_user.office.rooms.build(room_params)
    if room.save
      render json: room, status: :created
    else
      render json: { errors: room.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @room.update(room_params)
      render json: @room
    else
      render json: { errors: @room.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @room.destroy!
    head :no_content
  end

  private

  def set_room
    @room = current_user.office.rooms.find(params[:id])
  end

  def room_params
    params.require(:room).permit(:name)
  end
end
