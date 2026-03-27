FactoryBot.define do
  factory :service_type do
    association :office
    sequence(:name) { |n| "サービス種別#{n}" }
  end
end
