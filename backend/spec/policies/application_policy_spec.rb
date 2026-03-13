require "rails_helper"

RSpec.describe ApplicationPolicy, type: :policy do
  let(:user) { build(:user) }
  let(:record) { instance_double("Record") }

  subject(:policy) { ApplicationPolicy.new(user, record) }

  describe "デフォルト権限" do
    it "`index?` は false を返す" do
      expect(policy.index?).to be(false)
    end

    it "`show?` は false を返す" do
      expect(policy.show?).to be(false)
    end

    it "`create?` は false を返す" do
      expect(policy.create?).to be(false)
    end

    it "`new?` は false を返す" do
      expect(policy.new?).to be(false)
    end

    it "`update?` は false を返す" do
      expect(policy.update?).to be(false)
    end

    it "`edit?` は false を返す" do
      expect(policy.edit?).to be(false)
    end

    it "`destroy?` は false を返す" do
      expect(policy.destroy?).to be(false)
    end
  end

  describe ApplicationPolicy::Scope do
    it "`resolve` が未実装なら例外を送出する" do
      scope = ApplicationPolicy::Scope.new(user, Object.new)

      expect { scope.resolve }.to raise_error(NoMethodError, /resolve/)
    end
  end
end
