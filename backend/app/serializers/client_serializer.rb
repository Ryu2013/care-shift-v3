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
      longitude: @client.longitude,
      user_clients: @client.user_clients.includes(:user).map do |uc|
        {
          id: uc.id,
          user_id: uc.user_id,
          user_name: uc.user.name
        }
      end
    }
  end
end
