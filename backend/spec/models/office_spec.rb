require "rails_helper"

RSpec.describe Office, type: :model do
  describe "バリデーション" do
    it "名前があれば有効である" do
      expect(build(:office)).to be_valid
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

    it "事業所が削除されるとシフトも削除される" do
      client = create(:client, office: office, team: create(:team, office: office))
      create(:shift, office: office, client: client)

      expect { office.destroy }.to change(Shift, :count).by(-1)
    end
  end
end
