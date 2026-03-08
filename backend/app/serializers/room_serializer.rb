class RoomSerializer
  def initialize(room, user: nil)
    @room = room
    @user = user
  end

  def as_json(*)
    data = {
      id: @room.id,
      name: @room.name,
      office_id: @room.office_id,
      users: @room.users.map { |u| UserSerializer.new(u) }
    }

    if @user
      latest_message = @room.messages.order(created_at: :desc).first
      data[:latest_message] = latest_message ? MessageSerializer.new(latest_message).as_json : nil
      data[:has_unread] = @room.has_unread_messages?(@user)
    end

    data
  end
end
