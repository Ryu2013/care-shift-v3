class OfficeSerializer
  def initialize(office)
    @office = office
  end

  def as_json(*)
    {
      id: @office.id,
      name: @office.name,
      monthly_day_off_limit: @office.monthly_day_off_limit,
      request_deadline_day: @office.request_deadline_day,
      subscription_active: @office.subscription_active?,
      subscription_status: @office.subscription_status,
      current_period_end: @office.current_period_end,
      cancel_at_period_end: @office.cancel_at_period_end
    }
  end
end
