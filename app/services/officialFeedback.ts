import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';

export interface IOfficialFeedbackData {
  id: string;
  type: 'official_feedbacks';
  attributes: {
    body_multiloc: Multiloc;
    author_multiloc: Multiloc;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    idea: {
      data: IRelationship;
    };
    user: {
      data: IRelationship | null;
    };
  };
}

export interface IOfficialFeedback {
  data: IOfficialFeedbackData;
}

export interface IOfficialFeedbacks {
  data: IOfficialFeedbackData[];
}

export interface INewFeedback {
  author_multiloc: Multiloc;
  body_multiloc: Multiloc;
}

export function officialFeedbackStream(officialFeedbackId: string) {
  return streams.get<IOfficialFeedback>({ apiEndpoint: `${API_PATH}/official_feedback/${officialFeedbackId }` });
}

export function officialFeedbacksForIdeaStream(ideaId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IOfficialFeedbacks>({ apiEndpoint: `${API_PATH}/ideas/${ideaId}/official_feedback`, ...streamParams });
}

export async function addOfficialFeedbackToIdea(ideaId: string, feedBack: INewFeedback) {
  const bodyData = {
    official_feedback: feedBack
  };

  const response = await streams.add<IOfficialFeedback>(`${API_PATH}/ideas/${ideaId}/official_feedback`, bodyData);
  await streams.fetchAllWith({ apiEndpoint: [`${API_PATH}/ideas/${ideaId}/official_feedback`] });
  return response;
}

export function updateOfficialFeedback(officialFeedbackId: string, object: INewFeedback) {
  const bodyData = {
    official_feedback: object
  };
  return streams.update<IOfficialFeedback>(`${API_PATH}/official_feedback/${officialFeedbackId}`, officialFeedbackId, bodyData);
}

export function deleteOfficialfeedback(projectId: string) {
  return streams.delete(`${API_PATH}/official_feedback/${projectId}`, projectId);
}
