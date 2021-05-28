# frozen_string_literal: true

module Insights
  module WebApi
    module V1
      class InputSerializer < ::WebApi::V1::BaseSerializer
        belongs_to :source, record_type: 'idea', serializer: ::WebApi::V1::IdeaSerializer do |idea, _params|
          idea
        end

        has_many :categories do |idea, _params|
          ::Insights::CategoryAssignment.where(input: idea).map(&:category)
        end
      end
    end
  end
end
