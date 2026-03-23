class ServiceRecordSerializer
  include Rails.application.routes.url_helpers

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
      toilet_assist: @service_record.toilet_assist,
      portable_toilet_assist: @service_record.portable_toilet_assist,
      diaper_change: @service_record.diaper_change,
      pad_change: @service_record.pad_change,
      linen_change: @service_record.linen_change,
      perineal_cleaning: @service_record.perineal_cleaning,
      urinal_washing: @service_record.urinal_washing,
      urine_count: @service_record.urine_count,
      urine_amount: @service_record.urine_amount,
      stool_count: @service_record.stool_count,
      stool_status: @service_record.stool_status,
      posture_support: @service_record.posture_support,
      meal_assist_full: @service_record.meal_assist_full,
      meal_assist_partial: @service_record.meal_assist_partial,
      water_intake: @service_record.water_intake,
      meal_completed: @service_record.meal_completed,
      meal_leftover: @service_record.meal_leftover,
      bathing_assist: @service_record.bathing_assist,
      shower_bath: @service_record.shower_bath,
      hair_wash: @service_record.hair_wash,
      partial_bath_hand: @service_record.partial_bath_hand,
      partial_bath_foot: @service_record.partial_bath_foot,
      full_body_cleaning: @service_record.full_body_cleaning,
      partial_cleaning: @service_record.partial_cleaning,
      face_wash: @service_record.face_wash,
      oral_care: @service_record.oral_care,
      dressing_assist: @service_record.dressing_assist,
      nail_care: @service_record.nail_care,
      ear_care: @service_record.ear_care,
      hair_care: @service_record.hair_care,
      beard_shave: @service_record.beard_shave,
      makeup: @service_record.makeup,
      position_change: @service_record.position_change,
      transfer_assist: @service_record.transfer_assist,
      mobility_assist: @service_record.mobility_assist,
      outing_preparation: @service_record.outing_preparation,
      outing_accompaniment: @service_record.outing_accompaniment,
      commute_assist: @service_record.commute_assist,
      shopping_assist: @service_record.shopping_assist,
      wake_up_assist: @service_record.wake_up_assist,
      bedtime_assist: @service_record.bedtime_assist,
      medication_support: @service_record.medication_support,
      medication_application: @service_record.medication_application,
      suction: @service_record.suction,
      enema: @service_record.enema,
      tube_feeding: @service_record.tube_feeding,
      hospital_assist: @service_record.hospital_assist,
      watch_over: @service_record.watch_over,
      independence_cleaning_support: @service_record.independence_cleaning_support,
      independence_laundry_support: @service_record.independence_laundry_support,
      independence_bed_make_support: @service_record.independence_bed_make_support,
      independence_clothing_arrangement_support: @service_record.independence_clothing_arrangement_support,
      independence_cooking_support: @service_record.independence_cooking_support,
      independence_shopping_support: @service_record.independence_shopping_support,
      voice_toilet_meal: @service_record.voice_toilet_meal,
      voice_hygiene: @service_record.voice_hygiene,
      voice_hospital: @service_record.voice_hospital,
      voice_sleep: @service_record.voice_sleep,
      voice_medication: @service_record.voice_medication,
      cleaning_room: @service_record.cleaning_room,
      cleaning_toilet: @service_record.cleaning_toilet,
      cleaning_portable_toilet: @service_record.cleaning_portable_toilet,
      cleaning_table: @service_record.cleaning_table,
      cleaning_kitchen: @service_record.cleaning_kitchen,
      cleaning_bathroom: @service_record.cleaning_bathroom,
      cleaning_entrance: @service_record.cleaning_entrance,
      garbage_disposal: @service_record.garbage_disposal,
      laundry_wash: @service_record.laundry_wash,
      laundry_dry: @service_record.laundry_dry,
      laundry_store: @service_record.laundry_store,
      laundry_iron: @service_record.laundry_iron,
      bed_make: @service_record.bed_make,
      sheet_change: @service_record.sheet_change,
      futon_dry: @service_record.futon_dry,
      clothing_arrangement: @service_record.clothing_arrangement,
      clothing_repair: @service_record.clothing_repair,
      cooking: @service_record.cooking,
      cooking_preparation: @service_record.cooking_preparation,
      meal_serving: @service_record.meal_serving,
      menu_note: @service_record.menu_note,
      shopping_daily_goods: @service_record.shopping_daily_goods,
      medicine_pickup: @service_record.medicine_pickup,
      money_advance: @service_record.money_advance,
      money_spent: @service_record.money_spent,
      money_change: @service_record.money_change,
      shopping_detail: @service_record.shopping_detail,
      environment_preparation: @service_record.environment_preparation,
      consultation_support: @service_record.consultation_support,
      information_collection_and_provision: @service_record.information_collection_and_provision,
      record_checked: @service_record.record_checked,
      note: @service_record.note,
      special_note: @service_record.special_note,
      instruction_note: @service_record.instruction_note,
      report_note: @service_record.report_note,
      image_file: @service_record.image_file,
      image_url: image_url,
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

  private

  def image_url
    return nil unless @service_record.image.attached?

    rails_blob_path(@service_record.image, only_path: true)
  end
end
