class Api::TeamsController < Api::BaseController
  before_action :set_team, only: %i[update destroy]

  def index
    teams = current_user.office.teams.includes(:clients, :users).order(:id)
    render json: teams
  end

  def create
    team = current_user.office.teams.build(team_params)
    if team.save
      render json: team, status: :created
    else
      render json: { errors: team.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @team.update(team_params)
      render json: @team
    else
      render json: { errors: @team.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @team.destroy!
    head :no_content
  end

  private

  def set_team
    @team = current_user.office.teams.find(params[:id])
  end

  def team_params
    params.require(:team).permit(:name)
  end
end
