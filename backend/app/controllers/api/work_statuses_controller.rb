class Api::WorkStatusesController < Api::BaseController
  def index
    date   = params[:date].present? ? Date.parse(params[:date]) : Date.current
    team   = params[:team_id] ? current_user.office.teams.find(params[:team_id]) : current_user.team

    shifts = current_user.office.shifts
      .joins(:client)
      .where(date: date, clients: { team_id: team.id })
      .includes(:user, :client)
      .order("clients.name ASC, start_time ASC")

    render json: {
      date: date,
      shifts: shifts,
      work_count: shifts.count { |s| s.work_status == "work" },
      not_work_count: shifts.count { |s| s.work_status == "not_work" }
    }
  end
end
