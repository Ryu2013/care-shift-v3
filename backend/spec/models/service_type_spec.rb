require "rails_helper"

RSpec.describe ServiceType, type: :model do
  describe "バリデーション" do
    it "事業所と名称があれば有効である" do
      expect(build(:service_type)).to be_valid
    end

    it "同じ事業所内で同名は無効である" do
      office = create(:office)
      create(:service_type, office: office, name: "身体介護")
      duplicate = build(:service_type, office: office, name: "身体介護")

      expect(duplicate).to be_invalid
      expect(duplicate.errors[:name]).to be_present
    end
  end
end
