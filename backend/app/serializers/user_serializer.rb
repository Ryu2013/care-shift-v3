class UserSerializer
  def initialize(user)
    @user = user
  end

  def as_json(*)
    {
      id: @user.id,
      email: @user.email,
      name: @user.name,
      role: @user.role,
      office_id: @user.office_id,
      team_id: @user.team_id
    }
  end
end
