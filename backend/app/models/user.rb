class User < ApplicationRecord
  include UserSetup

  devise :database_authenticatable, :registerable, :recoverable, :rememberable,
         :validatable, :confirmable, :lockable, :two_factor_authenticatable,
         :invitable,
         :omniauthable, omniauth_providers: [:google_oauth2]
  devise :pwned_password unless Rails.env.test?

  encrypts :otp_secret

  belongs_to :office
  belongs_to :team
  has_many :user_clients, dependent: :destroy
  has_many :clients, through: :user_clients
  has_many :shifts, dependent: :nullify
  has_many :entries, dependent: :destroy
  has_many :rooms, through: :entries
  has_many :messages, dependent: :destroy

  validates :name, presence: true

  enum :role, { employee: 0, admin: 1 }

  delegate :subscription_active?, to: :office, allow_nil: true

  geocoded_by :address, latitude: :latitude, longitude: :longitude
  after_validation :geocode, if: :address_changed?

  # session_controllerで使用
  def validate_otp(otp_attempt)
    if otp_required_for_login
      if otp_attempt.blank?
        return false
      else
        return validate_and_consume_otp!(otp_attempt)
      end
    else
      return true
    end
  end

  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.email = auth.info.email
      user.password = Devise.friendly_token[0, 20]
      user.name = auth.info.name
      user.confirmed_at = Time.current
      user.setup_default_office_and_team!
    end
  end

  def has_unread_messages?
    rooms.any? { |room| room.has_unread_messages?(self) }
  end

  private

  def validate_user_limit
    return unless office.present?
    if office.users.count >= 5 && !office.subscription_active?
      errors.add(:base, "無料プランの上限（5名）に達しました。メンバーを追加するにはサブスクリプション登録が必要です。")
    end
  end
end
