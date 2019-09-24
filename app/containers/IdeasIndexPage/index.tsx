import React, { memo } from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import Footer from 'components/Footer';
import IdeasIndexMeta from './IdeaIndexMeta';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';

const Container = styled.div`
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: ${colors.background};

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  flex: 1 1 auto;
  padding-top: 60px;
  padding-bottom: 100px;

  ${media.smallerThanMinTablet`
    padding-top: 30px;
  `}
`;

const PageTitle = styled.div`
  h1 {
    font-size: ${fontSizes.xxxxl}px;
    line-height: normal;
    font-weight: 500;
  }
  margin-bottom: 35px;
  color: ${colors.text};
  text-align: center;
  margin: 0;
  padding: 0;

  ${media.smallerThanMaxTablet`
    text-align: left;
    margin-bottom: 20px;
  `}

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.xxxl}px;
  `}
`;

export default memo(() => (
  <>
    <IdeasIndexMeta />
    <Container>
      <StyledContentContainer maxWidth="100%">
        <PageTitle>
          <FormattedMessage tagName="h1" {...messages.pageTitle} />
        </PageTitle>
        <IdeaCards
          type="load-more"
          allowProjectsFilter={true}
          projectPublicationStatus="published"
          showViewToggle={false}
          showFiltersSidebar={true}
          invisibleTitleMessage={messages.invisibleIdeasListTitle}
        />
      </StyledContentContainer>
      <Footer />
    </Container>
  </>
));
