class WebApi::V1::Notifications::CommentMarkedAsSpamSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :initiating_user_first_name do |object|
    object.initiating_user&.first_name
  end

  attribute :initiating_user_last_name do |object|
    object.initiating_user&.last_name
  end

  attribute :initiating_user_slug do |object|
    object.initiating_user&.slug
  end

  belongs_to :initiating_user, record_type: :user, serializer: WebApi::V1::UserSerializer
  belongs_to :spam_report
  belongs_to :idea
  belongs_to :initiative
  belongs_to :comment
  belongs_to :project
end
