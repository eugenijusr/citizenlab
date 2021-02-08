module Polls
	module WebApi
		module V1
			class ResponsesController < PollsController
				before_action :set_participation_context

				def index_xlsx
					if @participation_context
			      authorize Project.find_by!(id: @participation_context.project.id), :index_xlsx?
			    else
			      authorize Response, :index_xlsx?
			    end
					@responses = policy_scope(Response)
						.where(participation_context: @participation_context)
						.includes(:user, response_options: [:option])
						.order(:created_at)
			    I18n.with_locale(current_user&.locale) do
			      xlsx = XlsxService.new.generate_poll_results_xlsx @participation_context, @responses
			      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'polling_results.xlsx'
			    end
			  end

				def create
					@response = Response.new(response_params)
					@response.user = current_user
					@response.participation_context = @participation_context
					authorize @response

					SideFxResponseService.new.before_create(@response, current_user)
					if @response.save(context: :response_submission)
						SideFxResponseService.new.after_create(@response, current_user)
						head :created
					else
						render json: { errors: @response.errors.details }, status: :unprocessable_entity
					end
				end

				private

				def set_participation_context
					if params[:project_id]
						@participation_context = Project.find(params[:project_id])
					elsif params[:phase_id]
						@participation_context = Phase.find(params[:phase_id])
					else
						head 404
					end
				end

				def response_params
					params.require(:response).permit(
						response_options_attributes: [:option_id],
					)
				end

			  def secure_controller?
			    false
			  end
			end
		end
	end
end