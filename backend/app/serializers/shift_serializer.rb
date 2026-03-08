class ShiftSerializer
  def initialize(shift)
    @shift = shift
  end

  def as_json(*)
    {
      id: @shift.id,
      user_id: @shift.user_id,
      client_id: @shift.client_id,
      shift_type: @shift.shift_type,
      note: @shift.note,
      date: @shift.date,
      start_time: @shift.start_time&.strftime("%H:%M"),
      end_time: @shift.end_time&.strftime("%H:%M"),
      work_status: @shift.work_status,
      client: { name: @shift.client&.name },
      user: @shift.user ? { name: @shift.user.name } : nil,
      is_escort: @shift.is_escort,
      office_id: @shift.office_id
    }
  end
end
