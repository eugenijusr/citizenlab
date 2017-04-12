/*
 *
 * UsersEditPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  STORE_AVATAR, CURRENT_USER_LOAD_SUCCESS, CURRENT_USER_LOAD_ERROR, STORE_CURRENT_USER, CURRENT_USER_STORE_SUCCESS,
  CURRENT_USER_STORE_ERROR, AVATAR_STORE_ERROR, UPDATE_USER_LOCALE, AVATAR_STORE_SUCCESS,
} from './constants';
import { LOAD_CURRENT_USER } from '../App/constants';

export const usersEditPageInitialState = fromJS({
  loading: false,
  loadError: false,
  storeError: false,
  processing: false,
  stored: false,
  currentUser: { },
  avatarStored: false,
  avatarUploadError: false,
  avatarURL: '',
});

export default function usersEditPageReducer(state = usersEditPageInitialState, action) {
  let currentUserWithId;

  if (action.payload) {
    const userId = action.userId;
    if (userId) {
      currentUserWithId = fromJS(action.payload).set('userId', userId).toJS();
    }
  }

  switch (action.type) {
    case LOAD_CURRENT_USER:
      return state
        .set('loading', true)
        .set('loadError', false);
    case CURRENT_USER_LOAD_SUCCESS:
      return state
        .set('currentUser', currentUserWithId)
        .set('loading', false);
    case CURRENT_USER_LOAD_ERROR:
      return state
        .set('loadError', true)
        .set('loading', false);
    case STORE_CURRENT_USER:
      return state
        .set('currentUser', currentUserWithId)
        .set('stored', false)
        .set('processing', true)
        .set('storeError', false);
    case CURRENT_USER_STORE_SUCCESS:
      return state
        .set('processing', false)
        .set('stored', true);
    case CURRENT_USER_STORE_ERROR:
      return state
        // restore existing currentUser data to keep form state consistency
        .set('currentUser', state.get('currentUser'))
        .set('processing', false)
        .set('storeError', true);
    case STORE_AVATAR:
      return state
        .set('avatarUploadError', false)
        .set('currentUser', fromJS(state.get('currentUser')).set('avatar', action.avatarBase64).toJS());
    case AVATAR_STORE_SUCCESS:
      return state
        .set('avatarUploadError', false);
    case AVATAR_STORE_ERROR:
      return state
        .set('avatarUploadError', true);
    case UPDATE_USER_LOCALE:
      return state
        .set('currentUser', fromJS(state.get('currentUser')).set('locale', action.userLocale).toJS());
    default:
      return state;
  }
}
