class ClientNeedSerializer
  def initialize(client_need)
    @client_need = client_need
  end

  def as_json(*)
    {
      id: @client_need.id,
      client_id: @client_need.client_id,
      week: @client_need.week,
      shift_type: @client_need.shift_type,
      start_time: @client_need.start_time&.strftime("%H:%M"),
      end_time: @client_need.end_time&.strftime("%H:%M"),
      slots: @client_need.slots
    }
  end
end
