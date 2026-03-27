require "rails_helper"

RSpec.describe Client, type: :model do
  describe "バリデーション" do
    it "名前と事業所とチームがあれば有効である" do
      expect(build(:client)).to be_valid
    end

    it "名前がなければ無効である" do
      client = build(:client, name: nil)

      expect(client).to be_invalid
      expect(client.errors[:name]).to be_present
    end

    it "事業所がなければ無効である" do
      client = Client.new(name: "顧客A", team: build(:team))

      expect(client).to be_invalid
      expect(client.errors[:office]).to be_present
    end

    it "チームがなければ無効である" do
      client = Client.new(name: "顧客A", office: build(:office))

      expect(client).to be_invalid
      expect(client.errors[:team]).to be_present
    end

    it "別事業所のチームは無効である" do
      client = build(:client)
      outside_team = create(:team)
      client.team = outside_team

      expect(client).to be_invalid
      expect(client.errors[:team]).to be_present
    end
  end

  describe "関連削除" do
    let!(:client) { create(:client) }

    it "利用者が削除されるとシフトも削除される" do
      create(:shift, client: client, office: client.office)

      expect { client.destroy }.to change(Shift, :count).by(-1)
    end

    it "利用者が削除されると利用者ニーズも削除される" do
      create(:client_need, client: client, office: client.office)

      expect { client.destroy }.to change(ClientNeed, :count).by(-1)
    end

    it "利用者が削除されると利用者担当情報も削除される" do
      user = create(:user, office: client.office, team: client.team)
      create(:user_client, client: client, user: user, office: client.office)

      expect { client.destroy }.to change(UserClient, :count).by(-1)
    end
  end

  describe "ネストされた利用者担当情報" do
    it "利用者作成時に利用者担当情報も一緒に作成できる" do
      office = create(:office)
      team = create(:team, office: office)
      user = create(:user, office: office, team: team)

      expect {
        Client.create!(
          office: office,
          team: team,
          name: "顧客A",
          user_clients_attributes: [ { user_id: user.id } ]
        )
      }.to change(UserClient, :count).by(1)
    end

    it "更新時に `_destroy` を指定すると利用者担当情報を削除できる" do
      client = create(:client)
      user = create(:user, office: client.office, team: client.team)
      user_client = create(:user_client, client: client, user: user, office: client.office)

      expect {
        client.update!(user_clients_attributes: [ { id: user_client.id, _destroy: true } ])
      }.to change(UserClient, :count).by(-1)
    end
  end

  describe "関連" do
    it "利用者担当情報経由でユーザーを参照できる" do
      client = create(:client)
      user = create(:user, office: client.office, team: client.team)
      create(:user_client, client: client, user: user, office: client.office)

      expect(client.users).to contain_exactly(user)
    end
  end

  describe "ジオコーディング" do
    it "住所が変更されたときだけ geocode を実行する" do
      client = build(:client, address: "東京都千代田区")

      allow(client).to receive(:geocode)

      client.valid?

      expect(client).to have_received(:geocode)
    end

    it "住所が変更されていなければ geocode を実行しない" do
      client = create(:client, address: "東京都千代田区")

      allow(client).to receive(:geocode)

      client.valid?

      expect(client).not_to have_received(:geocode)
    end
  end
end
