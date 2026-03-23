FactoryBot.define do
  factory :day_off_date do
    association :day_off_month
    office { day_off_month.office }
    request_date { day_off_month.target_month.beginning_of_month }
  end
end
