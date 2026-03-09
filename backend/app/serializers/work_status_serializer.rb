class WorkStatusSerializer
  def initialize(work_status)
    @work_status = work_status
  end

  def as_json(*)
    {
      id: @work_status.id,
      user_name: @work_status.user&.name,
      status: @work_status.status,
      timestamp: @work_status.created_at
    }
  end
end
