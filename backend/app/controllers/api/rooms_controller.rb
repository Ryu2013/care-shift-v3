class Api::RoomsController < Api::AuthorizationController
  before_action :set_room, only: %i[show update destroy]

  def index
    render json: current_user.office.rooms.order(:name).map { |r| RoomSerializer.new(r, user: current_user) }
  end

  def show
    render json: RoomSerializer.new(@room, user: current_user)
  end

  def create
    room = current_user.office.rooms.build(room_params)

    begin
      ActiveRecord::Base.transaction do
        room.save!
        room.entries.create!(user: current_user, office: current_user.office)
      end
      render json: RoomSerializer.new(room), status: :created
    rescue ActiveRecord::RecordInvalid => e
      render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if @room.update(room_params)
      render json: RoomSerializer.new(@room)
    else
      render json: { errors: @room.errors.full_messages }, status: :unprocessable_content
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
