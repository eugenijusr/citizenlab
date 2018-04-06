class User < ApplicationRecord
  include PgSearch

  has_secure_password validations: false
  mount_base64_uploader :avatar, AvatarUploader

  pg_search_scope :search_by_all, 
    :against => [:first_name, :last_name, :email], 
    :using => { :tsearch => {:prefix => true} }

  has_many :ideas, foreign_key: :author_id, dependent: :nullify
  has_many :comments, foreign_key: :author_id, dependent: :nullify
  has_many :votes, dependent: :nullify
  has_many :notifications, foreign_key: :recipient_id, dependent: :destroy
  has_many :initiator_notifications, class_name: 'Notification', foreign_key: :initiating_user_id, dependent: :nullify
  has_many :memberships, dependent: :destroy
  has_many :groups, through: :memberships
  has_many :invites, foreign_key: :inviter_id, dependent: :destroy
  has_many :identities, dependent: :destroy
  has_many :spam_reports, dependent: :nullify
  has_many :activities, dependent: :nullify
  has_many :inviter_invites, class_name: 'Invite', foreign_key: :inviter_id, dependent: :nullify
  has_one :invitee_invite, class_name: 'Invite', foreign_key: :invitee_id, dependent: :destroy

  store_accessor :custom_field_values, :gender, :birthyear, :domicile, :education

  validates :email, :first_name, :slug, :locale, presence: true, unless: :invite_pending?

  validates :email, uniqueness: true, allow_nil: true
  validates :slug, uniqueness: true, format: {with: SlugService.new.regex }, unless: :invite_pending?
  validates :email, format: { with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i }, allow_nil: true
  validates :locale, inclusion: { in: proc {Tenant.settings('core','locales')} }
  validates :bio_multiloc, multiloc: {presence: false}
  validates :gender, inclusion: {in: %w(male female unspecified)}, allow_nil: true
  validates :birthyear, numericality: {only_integer: true, greater_than: Time.now.year - 120, less_than: Time.now.year}, allow_nil: true
  validates :domicile, inclusion: {in: proc {['outside'] + Area.select(:id).map(&:id)}}, allow_nil: true
  # Follows ISCED2011 scale
  validates :education, numericality: {only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 8}, allow_nil: true

  INVITE_STATUSES = %w(pending accepted)
  validates :invite_status, inclusion: {in: INVITE_STATUSES}, allow_nil: true

  validates :custom_field_values, json: {
    schema: lambda { CustomFieldService.new.fields_to_json_schema(CustomField.fields_for(User)) },
    message: ->(errors) { errors }
  }, if: [:custom_field_values_changed?, :active?]

  validates :password, length: { in: 5..72 }, allow_nil: true
  validate do |record|
    record.errors.add(:last_name, :blank) unless (record.last_name.present? or record.cl1_migrated or record.invite_pending?)
    record.errors.add(:password, :blank) unless (record.password_digest.present? or record.identities.any? or record.invite_pending?)
  end

  ROLES_JSON_SCHEMA = Rails.root.join('config', 'schemas', 'user_roles.json_schema').to_s
  validates :roles, json: { schema: ROLES_JSON_SCHEMA, message: ->(errors) { errors } }

  before_validation :set_cl1_migrated, on: :create
  before_validation :generate_slug

  scope :order_role, -> (direction=:asc) {  
    subquery = User.select("jsonb_array_elements(roles) as ro, id")
    joins("LEFT OUTER JOIN (#{subquery.to_sql}) as r ON users.id = r.id")
    .order("ro->>'type' #{direction}")
  }

  scope :admin, -> { 
    where("roles @> '[{\"type\":\"admin\"}]'")
  }

  scope :active, -> {
    where("registration_completed_at IS NOT NULL AND invite_status is distinct from 'pending'")
  } 
  
  def self.build_with_omniauth(auth)
    extra_user_attrs = SingleSignOnService.new.profile_to_user_attrs(auth.provider, auth)
    new({
      first_name: auth.info['first_name'],
      last_name: auth.info['last_name'],
      email: auth.info['email'],
      remote_avatar_url: auth.info['image'],
    }.merge(extra_user_attrs))
  end

  def avatar_blank?
    avatar.file.nil?
  end

  def invite_pending?
    invite_status == 'pending'
  end

  def display_name
    [first_name, last_name].join(" ")
  end

  def admin?
    !!self.roles.find{|r| r["type"] == "admin"}
  end

  def project_moderator? project_id
    !!self.roles.find{|r| r["type"] == "project_moderator" && r["project_id"] == project_id}
  end

  def add_role type, options={}
    self.roles << {"type" => type}.merge(options)
  end

  def authenticate(unencrypted_password)
    if !password_digest
      false
    elsif cl1_authenticate(unencrypted_password)
      self.password_digest = BCrypt::Password.create(unencrypted_password)
      self
    else
      original_authenticate(unencrypted_password) && self
    end
  end

  def member_of? group_id
    !self.memberships.select{ |m| m.group_id == group_id }.empty?
  end

  def active?
    self.registration_completed_at.present? && !self.invite_pending?
  end
  
  private

  def generate_slug
    if !self.slug && self.first_name.present?
      self.slug = SlugService.new.generate_slug self, self.display_name
    end
  end

  def set_cl1_migrated
    self.cl1_migrated ||= false
  end

  def original_authenticate(unencrypted_password)
    BCrypt::Password.new(password_digest).is_password?(unencrypted_password)
  end

  def cl1_authenticate(unencrypted_password)
    original_authenticate(::Digest::SHA256.hexdigest(unencrypted_password))
  end

end
