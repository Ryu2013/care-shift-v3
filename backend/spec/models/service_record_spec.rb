require "rails_helper"

RSpec.describe ServiceRecord, type: :model do
  describe "バリデーション" do
    it "shift と service_type があれば有効である" do
      expect(build(:service_record)).to be_valid
    end

    it "1つの shift に複数の記録は作れない" do
      shift = create(:shift)
      create(:service_record, shift: shift)
      duplicate = build(:service_record, shift: shift)

      expect(duplicate).to be_invalid
      expect(duplicate.errors[:shift_id]).to be_present
    end

    it "別事業所の service_type は無効である" do
      shift = create(:shift)
      other_service_type = create(:service_type)
      service_record = build(:service_record, shift: shift, service_type: other_service_type)

      expect(service_record).to be_invalid
      expect(service_record.errors[:service_type]).to include("は対象シフトと同じ事業所のサービス種別を選択してください")
    end
  end

  describe "列挙型" do
    it "appearance_status に good と poor を持つ" do
      expect(build(:service_record, appearance_status: :good).appearance_status).to eq("good")
      expect(build(:service_record, appearance_status: :poor).appearance_status).to eq("poor")
    end
  end
end
