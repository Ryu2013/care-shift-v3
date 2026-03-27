FactoryBot.define do
  factory :service_record do
    after(:build) do |service_record|
      service_record.shift ||= build(:shift)
      service_record.service_type ||= build(:service_type, office: service_record.shift.office)
    end

    appearance_status { :good }
    is_first_visit { false }
    is_emergency { false }
    schedule_changed { false }
    has_sweating { false }
    environment_preparation { false }
    consultation_support { false }
    information_collection_and_provision { false }
    record_checked { false }
    note { "記録あり" }
  end
end
