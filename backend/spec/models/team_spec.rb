require "rails_helper"

RSpec.describe Team, type: :model do
  describe "バリデーション" do
    it "名前と事業所があれば有効である" do
      expect(build(:team)).to be_valid
    end

    it "名前がなければ無効である" do
      team = build(:team, name: nil)

      expect(team).to be_invalid
      expect(team.errors[:name]).to be_present
    end

    it "事業所がなければ無効である" do
      team = Team.new(name: "部署A")

      expect(team).to be_invalid
      expect(team.errors[:office]).to be_present
    end
  end

  describe "関連削除" do
    let!(:team) { create(:team) }

    it "チームが削除されると利用者も削除される" do
      create(:client, team: team, office: team.office)

      expect { team.destroy }.to change(Client, :count).by(-1)
    end

    it "チームが削除されるとユーザーも削除される" do
      create(:user, team: team, office: team.office)

      expect { team.destroy }.to change(User, :count).by(-1)
    end
  end
end
