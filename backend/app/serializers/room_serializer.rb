class RoomSerializer
  def initialize(room)
    @room = room
  end

  def as_json(*)
    {
      id: @room.id,
      name: @room.name,
      office_id: @room.office_id,
      users: @room.users.map { |u| UserSerializer.new(u) }
    }
  end
end
