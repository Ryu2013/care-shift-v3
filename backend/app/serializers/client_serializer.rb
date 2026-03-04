class ClientSerializer
  def initialize(client)
    @client = client
  end

  def as_json(*)
    {
      id: @client.id,
      team_id: @client.team_id,
      office_id: @client.office_id,
      name: @client.name,
      address: @client.address,
      latitude: @client.latitude,
      longitude: @client.longitude
    }
  end
end
