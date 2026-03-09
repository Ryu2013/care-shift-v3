class MessageSerializer
  def initialize(message)
    @message = message
  end

  def as_json(*)
    {
      id: @message.id,
      room_id: @message.room_id,
      user_id: @message.user_id,
      user: UserSerializer.new(@message.user),
      content: @message.content,
      created_at: @message.created_at
    }
  end
end
