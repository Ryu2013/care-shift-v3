FactoryBot.define do
  factory :user do
    after(:build) do |user|
      user.office ||= build(:office)
      user.team ||= build(:team, office: user.office)
    end

    sequence(:name) { |n| "従業員#{n}" }
    email { "user-#{SecureRandom.hex(8)}@example.com" }
    confirmed_at { Time.current }
    password { "password123" }
    password_confirmation { "password123" }
  end
end
