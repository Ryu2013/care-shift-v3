class Message < ApplicationRecord
  belongs_to :user
  belongs_to :room
  belongs_to :office

  validates :content, presence: true

  before_validation :set_office_id

  private

  def set_office_id
    self.office_id = room.office_id
  end
end
