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
      :toilet_assist,
      :portable_toilet_assist,
      :diaper_change,
      :pad_change,
      :linen_change,
      :perineal_cleaning,
      :urinal_washing,
      :urine_count,
      :urine_amount,
      :stool_count,
      :stool_status,
      :posture_support,
      :meal_assist_full,
      :meal_assist_partial,
      :water_intake,
      :meal_completed,
      :meal_leftover,
      :bathing_assist,
      :shower_bath,
      :hair_wash,
      :partial_bath_hand,
      :partial_bath_foot,
      :full_body_cleaning,
      :partial_cleaning,
      :face_wash,
      :oral_care,
      :dressing_assist,
      :nail_care,
      :ear_care,
      :hair_care,
      :beard_shave,
      :makeup,
      :position_change,
      :transfer_assist,
      :mobility_assist,
      :outing_preparation,
      :outing_accompaniment,
      :commute_assist,
      :shopping_assist,
      :wake_up_assist,
      :bedtime_assist,
      :medication_support,
      :medication_application,
      :suction,
      :enema,
      :tube_feeding,
      :hospital_assist,
      :watch_over,
      :independence_cleaning_support,
      :independence_laundry_support,
      :independence_bed_make_support,
      :independence_clothing_arrangement_support,
      :independence_cooking_support,
      :independence_shopping_support,
      :voice_toilet_meal,
      :voice_hygiene,
      :voice_hospital,
      :voice_sleep,
      :voice_medication,
      :cleaning_room,
      :cleaning_toilet,
      :cleaning_portable_toilet,
      :cleaning_table,
      :cleaning_kitchen,
      :cleaning_bathroom,
      :cleaning_entrance,
      :garbage_disposal,
      :laundry_wash,
      :laundry_dry,
      :laundry_store,
      :laundry_iron,
      :bed_make,
      :sheet_change,
      :futon_dry,
      :clothing_arrangement,
      :clothing_repair,
      :cooking,
      :cooking_preparation,
      :meal_serving,
      :menu_note,
      :shopping_daily_goods,
      :medicine_pickup,
      :money_advance,
      :money_spent,
      :money_change,
      :shopping_detail,
      :environment_preparation,
      :consultation_support,
      :information_collection_and_provision,
      :record_checked,
      :note,
      :special_note,
      :instruction_note,
      :report_note,
      :image_file,
      :image,
      :submitted_at
    )
  end
end
