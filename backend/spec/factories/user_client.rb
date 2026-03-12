FactoryBot.define do
  factory :user_client do
    after(:build) do |user_client|
      if user_client.office
        user_client.user ||= build(:user, office: user_client.office)
        user_client.client ||= build(:client, office: user_client.office)
      else
        user_client.user ||= build(:user)
        user_client.client ||= build(:client, office: user_client.user.office)
        user_client.office ||= user_client.user.office
      end
    end
  end
end
