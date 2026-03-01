class RoomChannel < ApplicationCable::Channel
  def subscribed
    room = current_user.office.rooms.find_by(id: params[:room_id])
    if room && room.users.include?(current_user)
      stream_from "room_#{room.id}"
    else
      reject
    end
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
