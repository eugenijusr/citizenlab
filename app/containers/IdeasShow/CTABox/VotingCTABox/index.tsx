import React from 'react';
import styled from 'styled-components';
import Voting from './Voting';
import GoToCommentsButton from '../Buttons/GoToCommentsButton';
import SharingButton from '../Buttons/SharingButton';
import useIdea from 'hooks/useIdea';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

import useLocalize from 'hooks/useLocalize';
import useAuthUser from 'hooks/useAuthUser';

const Container = styled.div`
  background-color: #edeff0; // TODO: add color to component library
  border-radius: 2px;
  padding: 25px 15px;
`;

const StyledVoting = styled(Voting)`
  margin-bottom: 30px;
`;

const StyledGoToCommentsButton = styled(GoToCommentsButton)`
  margin-bottom: 10px;
`;

interface Props {
  className?: string;
  ideaId: string;
  projectId: string;
}

const CTABox = ({
  className,
  ideaId,
  projectId,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const idea = useIdea({ ideaId });
  const authUser = useAuthUser();
  const localize = useLocalize();

  if (!isNilOrError(idea)) {
    const commentingEnabled =
      idea.attributes.action_descriptor.commenting.enabled;
    const ideaUrl = location.href;
    const titleMultiloc = idea.attributes.title_multiloc;
    const ideaTitle = localize(titleMultiloc);

    const utmParams = !isNilOrError(authUser)
      ? {
          source: 'share_idea',
          campaign: 'share_content',
          content: authUser.data.id,
        }
      : {
          source: 'share_idea',
          campaign: 'share_content',
        };

    // TODO: a11y title
    return (
      <Container className={className}>
        <StyledVoting ideaId={ideaId} projectId={projectId} />
        {commentingEnabled && <StyledGoToCommentsButton />}
        <SharingButton
          url={ideaUrl}
          twitterMessage={formatMessage(messages.twitterMessage, {
            ideaTitle,
          })}
          emailSubject={formatMessage(messages.emailSharingSubject, {
            ideaTitle,
          })}
          emailBody={formatMessage(messages.emailSharingBody, {
            ideaUrl,
            ideaTitle,
          })}
          utmParams={utmParams}
        />
      </Container>
    );
  }

  return null;
};

export default injectIntl(CTABox);
