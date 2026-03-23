class Api::Admin::ServiceRecordsController < Api::Admin::AuthorizationController
  before_action :set_service_record, only: %i[show update]

  def index
    date = params[:date].present? ? Date.strptime(params[:date], "%Y-%m") : Date.current
    service_records = current_user.office.service_records
                                  .joins(shift: :client)
                                  .includes(:service_type, shift: [ :client, :user ])
                                  .where(shifts: { date: date.beginning_of_month..date.end_of_month })
                                  .order("shifts.date ASC, shifts.start_time ASC")

    service_records = service_records.where(shifts: { client_id: params[:client_id] }) if params[:client_id].present?
    service_records = service_records.where(shifts: { user_id: params[:user_id] }) if params[:user_id].present?
    service_records = service_records.where(service_type_id: params[:service_type_id]) if params[:service_type_id].present?
    service_records = service_records.where(clients: { team_id: params[:team_id] }) if params[:team_id].present?

    render json: service_records.map { |service_record| ServiceRecordSerializer.new(service_record) }
  end

  def show
    render json: ServiceRecordSerializer.new(@service_record)
  end

  def update
    if @service_record.update(service_record_params)
      render json: ServiceRecordSerializer.new(@service_record)
    else
      render json: { errors: @service_record.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def set_service_record
    @service_record = current_user.office.service_records
                                  .includes(:service_type, shift: [ :client, :user ])
                                  .find(params[:id])
  end

  def service_record_params
    params.require(:service_record).permit(
      :service_type_id,
      :is_first_visit,
      :is_emergency,
      :schedule_changed,
      :appearance_status,
      :has_sweating,
      :body_temperature,
      :systolic_bp,
      :diastolic_bp,
      :environment_preparation,
      :consultation_support,
      :information_collection_and_provision,
      :record_checked,
      :note,
      :submitted_at
    )
  end
end
