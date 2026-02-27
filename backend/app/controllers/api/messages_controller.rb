class Api::MessagesController < Api::BaseController
  before_action :set_room

  def index
    messages = @room.messages.includes(:user).order(:created_at)
    entry = @room.entries.find_by(user: current_user)
    entry&.update(last_read_at: Time.current)
    render json: messages
  end

  def create
    message = @room.messages.build(message_params.merge(user: current_user, office: current_user.office))
    if message.save
      render json: message, status: :created
    else
      render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_room
    @room = current_user.office.rooms.find(params[:room_id])
  end

  def message_params
    params.require(:message).permit(:content)
  end
end
