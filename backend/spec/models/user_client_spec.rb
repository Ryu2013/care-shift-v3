require "rails_helper"

RSpec.describe UserClient, type: :model do
  describe "バリデーション" do
    it "事業所とユーザーと利用者があれば有効である" do
      expect(build(:user_client)).to be_valid
    end

    it "ユーザーがなければ無効である" do
      user_client = build(:user_client)
      user_client.user = nil

      expect(user_client).to be_invalid
      expect(user_client.errors[:user]).to be_present
    end

    it "利用者がなければ無効である" do
      user_client = build(:user_client)
      user_client.client = nil

      expect(user_client).to be_invalid
      expect(user_client.errors[:client]).to be_present
    end

    it "事業所がなければ無効である" do
      user_client = build(:user_client)
      user_client.user = nil
      user_client.client = nil
      user_client.office = nil

      expect(user_client).to be_invalid
      expect(user_client.errors[:office]).to be_present
    end

    it "同じユーザーと利用者の組み合わせは重複できない" do
      existing = create(:user_client)
      duplicate = build(:user_client, user: existing.user, client: existing.client, office: existing.office)

      expect(duplicate).to be_invalid
      expect(duplicate.errors[:user_id]).to be_present
    end

    it "別事業所のユーザーは無効である" do
      office = create(:office)
      team = create(:team, office: office)
      client = create(:client, office: office, team: team)
      outside_user = create(:user, email: "outside-user-client-model-#{SecureRandom.hex(4)}@example.com")
      user_client = UserClient.new(office: office, client: client, user: outside_user)

      expect(user_client).to be_invalid
      expect(user_client.errors[:user]).to be_present
    end

    it "別事業所の利用者は無効である" do
      office = create(:office)
      team = create(:team, office: office)
      user = create(:user, office: office, team: team)
      outside_client = create(:client)
      user_client = UserClient.new(office: office, client: outside_client, user: user)

      expect(user_client).to be_invalid
      expect(user_client.errors[:client]).to be_present
    end
  end

  describe "関連削除" do
    it "事業所が削除されると一緒に削除される" do
      office = create(:office)
      create(:user_client, office: office)

      expect { office.destroy }.to change(UserClient, :count).by(-1)
    end

    it "ユーザーが削除されると一緒に削除される" do
      user = create(:user)
      create(:user_client, user: user, office: user.office, client: create(:client, office: user.office, team: user.team))

      expect { user.destroy }.to change(UserClient, :count).by(-1)
    end

    it "利用者が削除されると一緒に削除される" do
      client = create(:client)
      user = create(:user, office: client.office, team: client.team)
      create(:user_client, client: client, user: user, office: client.office)

      expect { client.destroy }.to change(UserClient, :count).by(-1)
    end
  end

  describe "コールバック" do
    it "office_id はまず利用者から補完される" do
      office_a = create(:office)
      office_b = create(:office)
      client = create(:client, office: office_a, team: create(:team, office: office_a))
      user = create(:user, office: office_b, team: create(:team, office: office_b))
      user_client = UserClient.new(user: user, client: client, office: nil)

      expect {
        user_client.valid?
      }.to change(user_client, :office_id).from(nil).to(client.office_id)
    end

    it "利用者がない場合はユーザーから office_id を補完する" do
      user = create(:user)
      user_client = UserClient.new(user: user, client: nil, office: nil)

      expect {
        user_client.valid?
      }.to change(user_client, :office_id).from(nil).to(user.office_id)
      expect(user_client.errors[:client]).to be_present
    end

    it "事業所が設定済みならその値を維持する" do
      office = create(:office)
      client_office = create(:office)
      user_office = create(:office)
      client = create(:client, office: client_office, team: create(:team, office: client_office))
      user = create(:user, office: user_office, team: create(:team, office: user_office))
      user_client = UserClient.new(user: user, client: client, office: office)

      expect {
        user_client.valid?
      }.not_to change(user_client, :office_id)
    end
  end
end
