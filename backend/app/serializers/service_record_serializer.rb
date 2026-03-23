class ServiceRecordSerializer
  def initialize(service_record)
    @service_record = service_record
  end

  def as_json(*)
    shift = @service_record.shift
    client = shift.client
    user = shift.user

    {
      id: @service_record.id,
      shift_id: @service_record.shift_id,
      service_type_id: @service_record.service_type_id,
      is_first_visit: @service_record.is_first_visit,
      is_emergency: @service_record.is_emergency,
      schedule_changed: @service_record.schedule_changed,
      appearance_status: @service_record.appearance_status,
      has_sweating: @service_record.has_sweating,
      body_temperature: @service_record.body_temperature&.to_f,
      systolic_bp: @service_record.systolic_bp,
      diastolic_bp: @service_record.diastolic_bp,
      environment_preparation: @service_record.environment_preparation,
      consultation_support: @service_record.consultation_support,
      information_collection_and_provision: @service_record.information_collection_and_provision,
      record_checked: @service_record.record_checked,
      note: @service_record.note,
      submitted_at: @service_record.submitted_at,
      created_at: @service_record.created_at,
      updated_at: @service_record.updated_at,
      service_type: {
        id: @service_record.service_type.id,
        name: @service_record.service_type.name
      },
      shift: {
        id: shift.id,
        office_id: shift.office_id,
        client_id: shift.client_id,
        user_id: shift.user_id,
        date: shift.date,
        start_time: shift.start_time&.strftime("%H:%M"),
        end_time: shift.end_time&.strftime("%H:%M"),
        client: client ? {
          id: client.id,
          name: client.name,
          team_id: client.team_id
        } : nil,
        user: user ? {
          id: user.id,
          name: user.name
        } : nil
      }
    }
  end
end
