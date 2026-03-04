class EntrySerializer
  def initialize(entry)
    @entry = entry
  end

  def as_json(*)
    {
      id: @entry.id,
      room_id: @entry.room_id,
      user_id: @entry.user_id,
      office_id: @entry.office_id
    }
  end
end
