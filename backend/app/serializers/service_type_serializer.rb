class ServiceTypeSerializer
  def initialize(service_type)
    @service_type = service_type
  end

  def as_json(*)
    {
      id: @service_type.id,
      office_id: @service_type.office_id,
      name: @service_type.name
    }
  end
end
