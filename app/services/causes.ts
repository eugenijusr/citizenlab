import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc, ImageSizes } from 'typings';

const apiEndpoint = `${API_PATH}/causes`;

export interface ICauseData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    image: ImageSizes;
    volunteers_count: number;
  };
  relationships: {
    participation_context: {
      data: {
        type: 'project' | 'phase';
        id: string;
      }
    }
    user_volunteer?: {
      data: null | {
        id: string;
      }
    }
  };
}

export interface ICauseLinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface ICauses {
  data: ICauseData[];
  links: ICauseLinks;
}

export interface ICause {
  data: ICauseData;
}

export function causeByIdStream(causeId: string) {
  return streams.get<ICause>({ apiEndpoint: `${apiEndpoint}/${causeId}` });
}

export function causesStream(participationContextType: 'project' | 'phase', participationContextId: string, streamParams: IStreamParams | null = null) {
  return streams.get<ICauses>({ apiEndpoint: `${API_PATH}/${participationContextType}s/${participationContextId}/causes`, ...streamParams });
}

export function addCause(object) {
  return streams.add<ICause>(apiEndpoint, { cause: object });
}

export function updateCause(causeId: string, object) {
  return streams.update<ICause>(`${apiEndpoint}/${causeId}`, causeId, { area: object });
}

export function deleteCause(causeId: string) {
  return streams.delete(`${apiEndpoint}/${causeId}`, causeId);
}
