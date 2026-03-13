require "rails_helper"

RSpec.describe ClientNeed, type: :model do
  describe "バリデーション" do
    it "必須属性がそろっていれば有効である" do
      expect(build(:client_need)).to be_valid
    end

    it "利用者がなければ無効である" do
      client_need = build(:client_need)
      client_need.client = nil

      expect(client_need).to be_invalid
      expect(client_need.errors[:client]).to be_present
    end

    it "事業所がなければ無効である" do
      # Client_needモデルのset_office_id対策で先にclientをnilにしている
      client_need = build(:client_need)
      client_need.client = nil
      client_need.office = nil

      expect(client_need).to be_invalid
      expect(client_need.errors[:office]).to be_present
    end

    it "曜日がなければ無効である" do
      client_need = build(:client_need, week: nil)

      expect(client_need).to be_invalid
      expect(client_need.errors[:week]).to be_present
    end

    it "シフト種別がなければ無効である" do
      client_need = build(:client_need, shift_type: nil)

      expect(client_need).to be_invalid
      expect(client_need.errors[:shift_type]).to be_present
    end

    it "開始時刻がなければ無効である" do
      client_need = build(:client_need, start_time: nil)

      expect(client_need).to be_invalid
      expect(client_need.errors[:start_time]).to be_present
    end

    it "終了時刻がなければ無効である" do
      client_need = build(:client_need, end_time: nil)

      expect(client_need).to be_invalid
      expect(client_need.errors[:end_time]).to be_present
    end

    it "必要人数がなければ無効である" do
      client_need = build(:client_need, slots: nil)

      expect(client_need).to be_invalid
      expect(client_need.errors[:slots]).to be_present
    end

    it "23時間59分以上の時間帯は無効である" do
      client_need = build(:client_need, start_time: "00:00", end_time: "23:59")

      expect(client_need).to be_invalid
      expect(client_need.errors[:base]).to be_present
    end

    it "開始時刻と終了時刻が同じ場合は無効である" do
      client_need = build(:client_need, start_time: "09:00", end_time: "09:00")

      expect(client_need).to be_invalid
      expect(client_need.errors[:base]).to be_present
    end
  end

  describe "関連削除" do
    it "利用者が削除されると一緒に削除される" do
      client = create(:client)
      create(:client_need, client: client, office: client.office)

      expect { client.destroy }.to change(ClientNeed, :count).by(-1)
    end

    it "事業所が削除されると一緒に削除される" do
      office = create(:office)
      create(:client_need, office: office)

      expect { office.destroy }.to change(ClientNeed, :count).by(-1)
    end
  end

  describe "列挙型" do
    it "定義済みのシフト種別を受け付ける" do
      expect(build(:client_need, shift_type: :day).shift_type).to eq("day")
      expect(build(:client_need, shift_type: :night).shift_type).to eq("night")
    end

    it "定義済みの曜日を受け付ける" do
      expect(build(:client_need, week: :monday).week).to eq("monday")
    end

    it "未定義のシフト種別は受け付けない" do
      client_need = build(:client_need)

      expect { client_need.shift_type = :invalid }.to raise_error(ArgumentError)
    end

    it "未定義の曜日は受け付けない" do
      client_need = build(:client_need)

      expect { client_need.week = :funday }.to raise_error(ArgumentError)
    end
  end

  describe "コールバック" do
    it "事業所がない場合は利用者から office_id を補完する" do
      client = create(:client)
      client_need = ClientNeed.new(
        client: client,
        office: nil,
        week: :monday,
        shift_type: :day,
        start_time: "09:00",
        end_time: "17:00",
        slots: 1
      )

      expect {
        client_need.valid?
      }.to change(client_need, :office_id).from(nil).to(client.office_id)
    end

    it "事業所があっても利用者の office_id で上書きする" do
      client = create(:client)
      other_office = create(:office)
      client_need = ClientNeed.new(
        client: client,
        office: other_office,
        week: :monday,
        shift_type: :day,
        start_time: "09:00",
        end_time: "17:00",
        slots: 1
      )

      expect {
        client_need.valid?
      }.to change(client_need, :office_id).from(other_office.id).to(client.office_id)
    end
  end

  describe "勤務時間制限" do
    it "日をまたいでも 23時間59分未満なら有効である" do
      client_need = build(:client_need, start_time: "22:00", end_time: "05:00")

      expect(client_need).to be_valid
    end
  end
end
