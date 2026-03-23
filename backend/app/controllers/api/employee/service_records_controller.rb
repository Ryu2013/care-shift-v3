class Api::Employee::ServiceRecordsController < Api::AuthorizationController
  before_action :set_service_record, only: %i[show update]

  def index
    date = params[:date].present? ? Date.strptime(params[:date], "%Y-%m") : Date.current
    service_records = current_user.service_records
                                  .joins(:shift)
                                  .includes(:service_type, shift: [ :client, :user ])
                                  .where(shifts: { date: date.beginning_of_month..date.end_of_month })
                                  .order("shifts.date ASC, shifts.start_time ASC")

    render json: service_records.map { |service_record| ServiceRecordSerializer.new(service_record) }
  end

  def show
    render json: ServiceRecordSerializer.new(@service_record)
  end

  def create
    shift = current_user.shifts.find(service_record_params[:shift_id])
    service_record = shift.build_service_record(service_record_params.except(:shift_id))

    if service_record.save
      service_record = load_service_record(service_record.id)
      render json: ServiceRecordSerializer.new(service_record), status: :created
    else
      render json: { errors: service_record.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if @service_record.update(service_record_params.except(:shift_id))
      render json: ServiceRecordSerializer.new(@service_record)
    else
      render json: { errors: @service_record.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def set_service_record
    @service_record = load_service_record(params[:id])
  end

  def load_service_record(id)
    current_user.service_records
                .includes(:service_type, shift: [ :client, :user ])
                .find(id)
  end

  def service_record_params
    params.require(:service_record).permit(
      :shift_id,
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
