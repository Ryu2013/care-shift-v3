require "rails_helper"

RSpec.describe Shift, type: :model do
  describe "バリデーション" do
    it "事業所と利用者と日付と開始時刻と終了時刻があれば有効である" do
      expect(build(:shift)).to be_valid
    end

    it "ユーザーがなくても有効である" do
      shift = build(:shift)

      expect(shift.user).to be_nil
      expect(shift).to be_valid
    end

    it "事業所がなければ無効である" do
      shift = build(:shift)
      shift.office = nil

      expect(shift).to be_invalid
      expect(shift.errors[:office]).to be_present
    end

    it "利用者がなければ無効である" do
      shift = build(:shift)
      shift.client = nil

      expect(shift).to be_invalid
      expect(shift.errors[:client]).to be_present
    end

    it "日付がなければ無効である" do
      shift = build(:shift, date: nil)

      expect(shift).to be_invalid
      expect(shift.errors[:date]).to be_present
    end

    it "開始時刻がなければ無効である" do
      shift = build(:shift, start_time: nil)

      expect(shift).to be_invalid
      expect(shift.errors[:start_time]).to be_present
    end

    it "終了時刻がなければ無効である" do
      shift = build(:shift, end_time: nil)

      expect(shift).to be_invalid
      expect(shift.errors[:end_time]).to be_present
    end

    it "同じユーザーの同日の重複シフトは無効である" do
      user = create(:user)
      client = create(:client, office: user.office, team: user.team)
      date = Date.current
      create(:shift, office: user.office, client: client, user: user, date: date, start_time: "09:00", end_time: "12:00")

      duplicate = build(:shift, office: user.office, client: client, user: user, date: date, start_time: "11:00", end_time: "14:00")

      expect(duplicate).to be_invalid
      expect(duplicate.errors[:base]).to be_present
    end

    it "同じユーザーの同日でも重複しなければ有効である" do
      user = create(:user)
      client = create(:client, office: user.office, team: user.team)
      date = Date.current
      create(:shift, office: user.office, client: client, user: user, date: date, start_time: "09:00", end_time: "12:00")

      duplicate = build(:shift, office: user.office, client: client, user: user, date: date, start_time: "12:00", end_time: "16:00")

      expect(duplicate).to be_valid
    end

    it "23時間59分以上の時間帯は無効である" do
      shift = build(:shift, start_time: "00:00", end_time: "23:59")

      expect(shift).to be_invalid
      expect(shift.errors[:base]).to be_present
    end

    it "開始時刻と終了時刻が同じ場合は無効である" do
      shift = build(:shift, start_time: "09:00", end_time: "09:00")

      expect(shift).to be_invalid
      expect(shift.errors[:base]).to be_present
    end
  end

  describe "関連削除" do
    it "利用者が削除されると一緒に削除される" do
      client = create(:client)
      create(:shift, office: client.office, client: client)

      expect { client.destroy }.to change(Shift, :count).by(-1)
    end

    it "ユーザーが削除されてもレコードは残り user_id は nil になる" do
      user = create(:user)
      client = create(:client, office: user.office, team: user.team)
      shift = create(:shift, office: user.office, client: client, user: user)

      expect {
        user.destroy
        shift.reload
      }.not_to change(Shift, :count)
      expect(shift.user_id).to be_nil
    end

    it "事業所が削除されると一緒に削除される" do
      office = create(:office)
      client = create(:client, office: office, team: create(:team, office: office))
      create(:shift, office: office, client: client)

      expect { office.destroy }.to change(Shift, :count).by(-1)
    end
  end

  describe "スコープ" do
    it "`scope_month` は指定月のレコードだけを返す" do
      month = Date.new(2025, 11, 1)
      in_month = create(:shift, date: month + 10.days)
      prev_month = create(:shift, date: month - 1.day)
      next_month = create(:shift, date: month.next_month)

      result = Shift.scope_month(month)

      expect(result).to include(in_month)
      expect(result).not_to include(prev_month)
      expect(result).not_to include(next_month)
    end
  end

  describe "列挙型" do
    it "定義済みのシフト種別を受け付ける" do
      expect(build(:shift, shift_type: :day).shift_type).to eq("day")
      expect(build(:shift, shift_type: :night).shift_type).to eq("night")
      expect(build(:shift, shift_type: :escort).shift_type).to eq("escort")
    end

    it "未定義のシフト種別は受け付けない" do
      shift = build(:shift)

      expect { shift.shift_type = :invalid }.to raise_error(ArgumentError)
    end

    it "勤務状態のデフォルトは `not_work` である" do
      expect(build(:shift).work_status).to eq("not_work")
    end

    it "勤務状態を `work` に変更できる" do
      shift = build(:shift)
      shift.work_status = :work

      expect(shift.work_status).to eq("work")
    end
  end

  describe "重複判定" do
    it "更新時に自分自身は重複シフトとして扱われない" do
      user = create(:user)
      client = create(:client, office: user.office, team: user.team)
      shift = create(:shift, office: user.office, client: client, user: user, date: Date.current, start_time: "09:00", end_time: "12:00")

      shift.start_time = "09:30"
      shift.end_time = "12:30"

      expect(shift).to be_valid
    end
  end

  describe "#duration" do
    it "通常の日勤時間を計算できる" do
      expect(build(:shift, start_time: "09:00", end_time: "18:00").duration).to eq(9.0)
    end

    it "分を含む勤務時間を計算できる" do
      expect(build(:shift, start_time: "09:00", end_time: "18:30").duration).to eq(9.5)
    end

    it "日をまたぐ勤務時間を計算できる" do
      expect(build(:shift, start_time: "22:00", end_time: "05:00").duration).to eq(7.0)
    end

    it "時刻がない場合は 0 を返す" do
      expect(build(:shift, start_time: nil).duration).to eq(0)
    end
  end
end
