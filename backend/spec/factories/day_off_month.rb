FactoryBot.define do
  factory :day_off_month do
    association :user
    office { user.office }
    target_month { Date.current.beginning_of_month }
    submitted_at { nil }
  end
end
