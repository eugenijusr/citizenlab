require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Invites" do
  before do
    header "Content-Type", "application/json"
  end


  post "web_api/v1/invites" do
    context "when admin" do
      before do
        @admin = create(:admin)
        token = Knock::AuthToken.new(payload: { sub: @admin.id }).token
        header 'Authorization', "Bearer #{token}"

        @groups = create_list(:group, 5)
      end
      


      with_options scope: :invite do
        parameter :email, "The email of the invitee.", required: false
        parameter :first_name, "The first name of the invitee.", required: false
        parameter :last_name, "The last name of the invitee.", required: false
        parameter :password, "The password of the invitee.", required: false
        parameter :avatar, "The avatar of the invitee.", required: false
        parameter :locale, "The locale of the invitee.", required: false
        parameter :gender, "The gender of the invitee.", required: false
        parameter :roles, "Roles array, only allowed when admin", required: false
        parameter :gender, "Either 'male', 'female' or 'unspecified'", required: false
        parameter :birthyear, "The year, as an integer, the user was born", required: false
        parameter :domicile, "Either an exisiting Area id or 'outside', to specify the user does not live in the city", required: false
        parameter :education, "An integer from 0 to 8 (inclusive), corresponding to the ISCED 2011 standard", required: false
        parameter :bio_multiloc, "A little text, allowing the user to describe herself. Multiloc and non-html", required: false
        parameter :group_ids, "A list of group identifiers to which the invited user will be made member", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Invite)
      ValidationErrorHelper.new.error_fields(self, User)
      ValidationErrorHelper.new.error_fields(self, Membership)
      
      let(:email) { 'nonexistinguser@cocacola.gov' }
      let(:group_ids) { @groups.shuffle.take(3).map(&:id) }
      let(:roles) { [{'type' => 'admin'}] }

      example_request "Invite a non-existing user to become member of a group" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        invitee = User.find_by(email: email)
        expect(invitee.is_invited).to eq true
        expect(invitee.admin?).to eq true
        expect(Membership.count).to eq 3
      end

      #example "Inviting the same email to the same group twice fails", document: false do
      #  create(:invite, email: email, group: @group)

      #  do_request
      #  expect(response_status).to eq 422
      # end
    end
  end


  context "Accepting invites" do
    before do
      @invite = create(:invite)
    end

    post "web_api/v1/invites/:token/accept" do
      with_options scope: :invite do
        parameter :first_name, "The first name of the invitee.", required: true
        parameter :last_name, "The last name of the invitee.", required: true
        parameter :password, "The password of the invitee.", required: true
        parameter :avatar, "The avatar of the invitee.", required: false
        parameter :locale, "The locale of the invitee.", required: false
        parameter :gender, "The gender of the invitee.", required: false
        parameter :birthyear, "The birthyear of the invitee.", required: false
        parameter :domicile, "The domicile of the invitee.", required: false
        parameter :education, "The education level of the invitee.", required: false
        parameter :bio_multiloc, "The bio (multiloc) of the invitee.", required: false
      end
      ValidationErrorHelper.new.error_fields(self, User)
      ValidationErrorHelper.new.error_fields(self, Membership)

      let(:token) { @invite.token }
      let(:first_name) { 'Bart' }
      let(:last_name) { 'Boulettos' }
      let(:password) { 'I<3BouletteSpecial' }
      let(:locale) { 'nl' }
      example_request "Accept an invite with a valid token" do
        expect(status).to eq(202)
        #json_response = json_parse(response_body)
        #expect(
        #  json_response
        #    .dig(:included)
        #    .select{|inc| inc[:id] == json_response.dig(:data,:relationships,:user,:data,:id)}&.first
        #    &.dig(:attributes,:last_name)
        #).to eq last_name
        #expect(json_response.dig(:data,:relationships,:group,:data,:id)).to eq @invite.group_id
      end

      example "Accepting an invite with an invalid token, or an invite which has already been activated" do
        @invite.destroy!

        do_request
        expect(response_status).to eq 401 # unauthorized
      end
    
    end
  end
end