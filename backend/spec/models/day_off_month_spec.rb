require "rails_helper"

RSpec.describe DayOffMonth, type: :model do
  describe "バリデーション" do
    it "必須属性がそろっていれば有効である" do
      expect(build(:day_off_month)).to be_valid
    end

    it "ユーザーがなければ無効である" do
      day_off_month = build(:day_off_month)
      day_off_month.user = nil

      expect(day_off_month).to be_invalid
      expect(day_off_month.errors[:user]).to be_present
    end

    it "target_month がなければ無効である" do
      day_off_month = build(:day_off_month, target_month: nil)

      expect(day_off_month).to be_invalid
      expect(day_off_month.errors[:target_month]).to be_present
    end

    it "同一事業所・同一ユーザー・同一月の申請は重複できない" do
      existing = create(:day_off_month)
      duplicate = build(:day_off_month, office: existing.office, user: existing.user, target_month: existing.target_month)

      expect(duplicate).to be_invalid
      expect(duplicate.errors[:user_id]).to be_present
    end
  end

  describe "関連削除" do
    it "事業所が削除されると一緒に削除される" do
      office = create(:office)
      user = create(:user, office: office, team: create(:team, office: office))
      create(:day_off_month, office: office, user: user)

      expect { office.destroy }.to change(DayOffMonth, :count).by(-1)
    end

    it "ユーザーが削除されると一緒に削除される" do
      request = create(:day_off_month)

      expect { request.user.destroy }.to change(DayOffMonth, :count).by(-1)
    end
  end

  describe "コールバック" do
    it "事業所がなければユーザーから office_id を補完する" do
      user = create(:user)
      day_off_month = DayOffMonth.new(user: user, office: nil, target_month: Date.new(2026, 4, 15))

      expect {
        day_off_month.valid?
      }.to change(day_off_month, :office_id).from(nil).to(user.office_id)
    end

    it "target_month を月初に正規化する" do
      day_off_month = build(:day_off_month, target_month: Date.new(2026, 4, 15))

      expect {
        day_off_month.valid?
      }.to change(day_off_month, :target_month).from(Date.new(2026, 4, 15)).to(Date.new(2026, 4, 1))
    end
  end
end
