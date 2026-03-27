class UserClient < ApplicationRecord
  belongs_to :office
  belongs_to :user
  belongs_to :client

  before_validation :set_office_id

  validates :user_id, uniqueness: { scope: :client_id }
  validate :user_must_belong_to_same_office
  validate :client_must_belong_to_same_office

  private

  def set_office_id
    self.office_id ||= client&.office_id || user&.office_id
  end

  def user_must_belong_to_same_office
    return unless office && user
    return if same_office?(user.office)

    errors.add(:user, "は同じ事業所のユーザーを指定してください")
  end

  def client_must_belong_to_same_office
    return unless office && client
    return if same_office?(client.office)

    errors.add(:client, "は同じ事業所の利用者を指定してください")
  end

  def same_office?(other_office)
    return false unless other_office
    office == other_office || (office_id.present? && other_office.id == office_id)
  end
end
