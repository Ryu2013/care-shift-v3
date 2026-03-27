require "rails_helper"

RSpec.describe DayOffDate, type: :model do
  describe "バリデーション" do
    it "必須属性がそろっていれば有効である" do
      expect(build(:day_off_date)).to be_valid
    end

    it "申請がなければ無効である" do
      day_off_date = build(:day_off_date)
      day_off_date.day_off_month = nil

      expect(day_off_date).to be_invalid
      expect(day_off_date.errors[:day_off_month]).to be_present
    end

    it "request_date がなければ無効である" do
      day_off_date = build(:day_off_date, request_date: nil)

      expect(day_off_date).to be_invalid
      expect(day_off_date.errors[:request_date]).to be_present
    end

    it "同一申請内で同じ日付は重複できない" do
      existing = create(:day_off_date)
      duplicate = build(:day_off_date, day_off_month: existing.day_off_month, office: existing.office, request_date: existing.request_date)

      expect(duplicate).to be_invalid
      expect(duplicate.errors[:request_date]).to be_present
    end

    it "対象月の範囲外の日付は無効である" do
      day_off_month = create(:day_off_month, target_month: Date.new(2026, 4, 1))
      day_off_date = build(:day_off_date, day_off_month: day_off_month, office: day_off_month.office, request_date: Date.new(2026, 5, 1))

      expect(day_off_date).to be_invalid
      expect(day_off_date.errors[:request_date]).to be_present
    end
  end

  describe "関連削除" do
    it "事業所が削除されると一緒に削除される" do
      office = create(:office)
      user = create(:user, office: office, team: create(:team, office: office))
      day_off_month = create(:day_off_month, office: office, user: user)
      create(:day_off_date, office: office, day_off_month: day_off_month)

      expect { office.destroy }.to change(DayOffDate, :count).by(-1)
    end

    it "申請が削除されると一緒に削除される" do
      day_off_date = create(:day_off_date)

      expect { day_off_date.day_off_month.destroy }.to change(DayOffDate, :count).by(-1)
    end
  end

  describe "コールバック" do
    it "事業所がなければ申請から office_id を補完する" do
      day_off_month = create(:day_off_month)
      day_off_date = DayOffDate.new(day_off_month: day_off_month, office: nil, request_date: day_off_month.target_month)

      expect {
        day_off_date.valid?
      }.to change(day_off_date, :office_id).from(nil).to(day_off_month.office_id)
    end
  end
end
