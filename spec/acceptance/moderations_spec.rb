require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Moderations" do
  explanation "Moderations are pieces of user-generated content that need to be moderated"

  before do
    header "Content-Type", "application/json"
    @user = create(:admin)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end
 
  before do
    @time = Time.now
    @m3 = create(:idea, 
      title_multiloc: {'en' => 'More bicycle repairmen'}, 
      body_multiloc: {'en' => 'They are the true heroes of society'},
      published_at: @time - 1.day
      )
    create(:moderation_status, moderatable: @m3, status: 'read')
    @m2 = create(:comment, 
      body_multiloc: {'en' => 'I\'m glad there\'s still heroes around'},
      post: @m3, 
      created_at: @time - 1.hour
      )
    @m4 = create(:idea, 
      title_multiloc: {'en' => 'Fewer bicycle repairmen'}, 
      body_multiloc: {'en' => 'They are pretentious donkeys'},
      published_at: @time - 2.days
      )
    create(:moderation_status, moderatable: @m4, status: 'read')
    @m1 = create(:initiative, 
      title_multiloc: {'en' => 'Burn more leaves'}, 
      body_multiloc: {'en' => 'We must return that CO2 to our atmosphere at all cost'},
      published_at: @time - 1.minute
      )
  end

  get "web_api/v1/moderations" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of moderations per page"
    end

    parameter :moderation_status, "Filter by moderation status. One of #{ModerationStatus::MODERATION_STATUSES.join(", ")}.", required: false

    example_request "List all moderations" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 4
      expect(json_response[:data].map { |d| d.dig(:id) }).to eq [@m1.id, @m2.id, @m3.id, @m4.id]
      expect(json_response[:data].map { |d| d.dig(:attributes, :moderatable_type) }).to eq ['Initiative', 'Comment', 'Idea', 'Idea']
      expect(json_response[:data].map { |d| d.dig(:attributes, :content_body_multiloc).stringify_keys['en'] }).to eq ['We must return that CO2 to our atmosphere at all cost', 'I\'m glad there\'s still heroes around', 'They are the true heroes of society', 'They are pretentious donkeys']
      expect(json_response[:data].map { |d| d.dig(:attributes, :moderation_status)}).to eq ['unread', 'unread', 'read', 'read']
      expect(json_response[:data].map { |d| Time.parse(d.dig(:attributes, :created_at)).to_i }).to eq [@time - 1.minute, @time - 1.hour, @time - 1.day, @time - 2.days].map(&:to_i)
      expect(JSON.parse(JSON.generate(json_response))['data'].map { |d| d.dig('attributes', 'belongs_to')}).to eq [
        {},
        {'project' => {'id' => @m3.project.id, 'slug' => @m3.project.slug, 'title_multiloc' => @m3.project.title_multiloc}, 'idea' => {'id' => @m3.id, 'slug' => @m3.slug, 'title_multiloc' => {'en' => 'More bicycle repairmen'}}},
        {'project' => {'id' => @m3.project.id, 'slug' => @m3.project.slug, 'title_multiloc' => @m3.project.title_multiloc}},
        {'project' => {'id' => @m4.project.id, 'slug' => @m4.project.slug, 'title_multiloc' => @m4.project.title_multiloc}}
      ]
    end

    describe "" do
      let(:moderation_status) { 'unread' }

      example_request "List only unread moderations" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].map { |d| d.dig(:id) }).to eq [@m1.id, @m2.id]
        expect(json_response[:data].map { |d| d.dig(:attributes, :moderation_status)}).to eq ['unread', 'unread']
      end
    end

    describe "" do
      let(:moderation_status) { 'read' }

      example_request "List only read moderations" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].map { |d| d.dig(:id) }).to eq [@m3.id, @m4.id]
        expect(json_response[:data].map { |d| d.dig(:attributes, :moderation_status)}).to eq ['read', 'read']
      end
    end
  end

  patch "web_api/v1/moderations/:moderatable_type/:moderatable_id" do
    with_options scope: :moderation do
      parameter :moderation_status, "Either #{ModerationStatus::MODERATION_STATUSES.join(", ")}", required: true
    end
   
    let(:idea) { create(:idea) }
    let(:moderatable_type) { 'Idea' }
    let(:moderatable_id) { idea.id }

    describe do

      let (:moderation_status) { 'read' }

      example_request "Mark a moderation as read" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data][:attributes][:moderation_status]).to eq 'read'
      end
    end

    describe do
      before do
        create(:moderation_status, moderatable: idea, status: 'read')
      end

      let (:moderation_status) { 'unread' }

      example_request "Mark a moderation as unread" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data][:attributes][:moderation_status]).to eq 'unread'
      end
    end

  end
end
