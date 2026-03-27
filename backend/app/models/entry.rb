class Entry < ApplicationRecord
  belongs_to :user
  belongs_to :room
  belongs_to :office

  validates :user_id, uniqueness: { scope: :room_id, message: "は既に追加されています" }
  validate :user_must_belong_to_same_office
  validate :room_must_belong_to_same_office

  private

  def user_must_belong_to_same_office
    return unless office && user
    return if user.office_id == office_id

    errors.add(:user, "は同じ事業所のユーザーを指定してください")
  end

  def room_must_belong_to_same_office
    return unless office && room
    return if room.office_id == office_id

    errors.add(:room, "は同じ事業所のルームを指定してください")
  end
end
