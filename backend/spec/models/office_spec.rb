require "rails_helper"

RSpec.describe Office, type: :model do
  describe "バリデーション" do
    it "名前があれば有効である" do
      expect(build(:office)).to be_valid
    end

    it "希望休上限が負数だと無効である" do
      office = build(:office, monthly_day_off_limit: -1)

      expect(office).to be_invalid
      expect(office.errors[:monthly_day_off_limit]).to be_present
    end

    it "提出期限日が 1 未満だと無効である" do
      office = build(:office, request_deadline_day: 0)

      expect(office).to be_invalid
      expect(office.errors[:request_deadline_day]).to be_present
    end

    it "提出期限日が 31 を超えると無効である" do
      office = build(:office, request_deadline_day: 32)

      expect(office).to be_invalid
      expect(office.errors[:request_deadline_day]).to be_present
    end

    it "名前がなければ無効である" do
      office = Office.new(name: nil)

      expect(office).to be_invalid
      expect(office.errors[:name]).to be_present
    end
  end

  describe "関連削除" do
    let!(:office) { create(:office) }

    it "事業所が削除されるとユーザーも削除される" do
      create(:user, office: office, team: create(:team, office: office))

      expect { office.destroy }.to change(User, :count).by(-1)
    end

    it "事業所が削除されると利用者も削除される" do
      create(:client, office: office, team: create(:team, office: office))

      expect { office.destroy }.to change(Client, :count).by(-1)
    end

    it "事業所が削除されるとチームも削除される" do
      create(:team, office: office)

      expect { office.destroy }.to change(Team, :count).by(-1)
    end

    it "事業所が削除されると利用者担当情報も削除される" do
      create(:user_client, office: office)

      expect { office.destroy }.to change(UserClient, :count).by(-1)
    end

    it "事業所が削除されると利用者ニーズも削除される" do
      create(:client_need, office: office)

      expect { office.destroy }.to change(ClientNeed, :count).by(-1)
    end

    it "事業所が削除されると希望休申請も削除される" do
      user = create(:user, office: office, team: create(:team, office: office))
      create(:day_off_month, office: office, user: user)

      expect { office.destroy }.to change(DayOffMonth, :count).by(-1)
    end

    it "事業所が削除されると希望休日も削除される" do
      user = create(:user, office: office, team: create(:team, office: office))
      day_off_month = create(:day_off_month, office: office, user: user)
      create(:day_off_date, office: office, day_off_month: day_off_month)

      expect { office.destroy }.to change(DayOffDate, :count).by(-1)
    end

    it "事業所が削除されるとシフトも削除される" do
      client = create(:client, office: office, team: create(:team, office: office))
      create(:shift, office: office, client: client)

      expect { office.destroy }.to change(Shift, :count).by(-1)
    end
  end
end
