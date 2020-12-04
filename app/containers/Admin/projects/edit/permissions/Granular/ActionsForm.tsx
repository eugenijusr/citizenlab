import React, { memo } from 'react';
import styled from 'styled-components';
import { isEmpty } from 'lodash-es';

import {
  IPermissionData,
  IGlobalPermissionAction,
  IPCPermissionAction,
} from 'services/actionPermissions';

import ActionForm from './ActionForm';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { inputTermMessages } from 'utils/i18n';

// hooks
import useProject from 'hooks/useProject';
import { isNilOrError } from 'utils/helperUtils';

const ActionPermissionWrapper = styled.div`
  margin-bottom: 30px;

  &.last {
    margin-bottom: 0;
  }
`;

type PostTypeProps =
  | {
      postType: 'idea';
      projectId: string;
    }
  | {
      postType: 'initiative';
      projectId: null;
    };

type SharedProps = {
  permissions: IPermissionData[];
  onChange: (
    permission: IPermissionData,
    permittedBy: IPermissionData['attributes']['permitted_by'],
    groupIds: string[]
  ) => void;
};

type Props = PostTypeProps & SharedProps;

const ActionsForm = memo(
  ({ permissions, postType, onChange, projectId }: Props) => {
    const project = useProject({ projectId });
    const handlePermissionChange = (permission: IPermissionData) => (
      permittedBy: IPermissionData['attributes']['permitted_by'],
      groupIds: string[]
    ) => {
      onChange(permission, permittedBy, groupIds);
    };

    const getPermissionActionMessage = (
      permissionAction: IPCPermissionAction | IGlobalPermissionAction
    ) => {
      if (postType === 'idea' && !isNilOrError(project)) {
        const projectInputTerm = project.attributes.input_term;

        return {
          posting_idea: inputTermMessages(projectInputTerm, {
            idea: messages.permissionAction_posting_idea,
          }),
          voting_idea: messages.permissionAction_voting_idea,
          commenting_idea: messages.permissionAction_commenting_idea,
          taking_survey: messages.permissionAction_taking_survey,
          taking_poll: messages.permissionAction_taking_poll,
        }[permissionAction];
      }

      if (postType === 'initiative') {
        return {
          voting_initiative: messages.permissionAction_voting_initiative,
          commenting_initiative:
            messages.permissionAction_commenting_initiative,
          posting_initiative: messages.permissionAction_posting_initiative,
        }[permissionAction];
      }
    };

    if (isEmpty(permissions)) {
      return (
        <p>
          <FormattedMessage {...messages.noActionsCanBeTakenInThisProject} />
        </p>
      );
    } else {
      return (
        <>
          {permissions.map((permission, index) => {
            const permissionAction = permission.attributes.action;

            return (
              <ActionPermissionWrapper
                key={permission.id}
                className={`${index === 0 ? 'first' : ''} ${
                  index === permissions.length - 1 ? 'last' : ''
                }`}
              >
                <h4>
                  <FormattedMessage
                    {...getPermissionActionMessage(permissionAction)}
                  />
                </h4>
                <ActionForm
                  permissionData={permission}
                  groupIds={permission.relationships.groups.data.map(
                    (p) => p.id
                  )}
                  onChange={handlePermissionChange(permission)}
                />
              </ActionPermissionWrapper>
            );
          })}
        </>
      );
    }
  }
);

export default ActionsForm;
