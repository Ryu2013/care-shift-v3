class Api::Admin::DayOffMonthsController < Api::Admin::AuthorizationController
  def index
    requests = current_user.office.day_off_months
                           .includes(:office, { user: :team }, :day_off_dates)
                           .for_month(target_month)
    requests = requests.for_team(params[:team_id]) if params[:team_id].present?

    render json: requests.order("teams.name ASC", "users.name ASC").references(:teams, :users).map { |request|
      DayOffMonthSerializer.new(request)
    }
  end

  private

  def target_month
    Date.strptime(params.fetch(:target_month), "%Y-%m").beginning_of_month
  end
end
