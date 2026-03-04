class TeamSerializer
  def initialize(team)
    @team = team
  end

  def as_json(*)
    {
      id: @team.id,
      name: @team.name,
      office_id: @team.office_id
    }
  end
end
