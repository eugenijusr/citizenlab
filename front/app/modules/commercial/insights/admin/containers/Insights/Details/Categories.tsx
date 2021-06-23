import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';
import Tag from 'modules/commercial/insights/admin/components/Tag';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { IconTooltip } from 'cl2-component-library';
import Button from 'components/UI/Button';

type CategoryProps = WithRouterProps & InjectedIntlProps;

const Container = styled.div`
  background-color: #fff;
  padding: 28px;

  h1 {
    color: ${colors.adminTextColor};
    font-size: ${fontSizes.large}px;
    display: flex;
    align-items: center;
    button {
      margin-left: 10px;
    }
  }
`;

const CategoriesContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  .categoryTag {
    margin-right: 8px;
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: ${colors.clBlueLightest};
  color: ${colors.adminTextColor};
  border-radius: 3px;

  .content {
    width: 80%;
  }

  .title {
    margin: 0;
    padding: 0;
    font-size: ${fontSizes.base}px;
    font-weight: bold;
  }
`;

const Categories = ({
  location: { pathname },
  params: { viewId },
  intl: { formatMessage },
}: CategoryProps) => {
  const categories = useInsightsCategories(viewId);
  if (isNilOrError(categories)) {
    return null;
  }

  return (
    <Container data-testid="insightsDetailsCategories">
      <h1>
        {formatMessage(messages.categoriesTitle)}
        <IconTooltip content={formatMessage(messages.categoriesTitleTooltip)} />
      </h1>
      {categories.length > 0 ? (
        <CategoriesContainer>
          <div>
            {categories.map((category) => (
              <Tag
                key={category.id}
                label={category.attributes.name}
                variant="secondary"
                count={category.attributes.inputs_count}
                className="categoryTag"
              />
            ))}
          </div>
          <Button buttonStyle="admin-dark" linkTo={`${pathname}/edit`}>
            {formatMessage(messages.editCategories)}
          </Button>
        </CategoriesContainer>
      ) : (
        <EmptyStateContainer data-testid="insightsDetailsCategoriesEmpty">
          <div className="content">
            <p className="title">
              {formatMessage(messages.categoriesEmptyTitle)}
            </p>
            <p> {formatMessage(messages.categoriesEmptyDescription)}</p>
          </div>

          <Button buttonStyle="admin-dark" linkTo={`${pathname}/edit`}>
            {formatMessage(messages.categoriesEmptyButton)}
          </Button>
        </EmptyStateContainer>
      )}
    </Container>
  );
};

export default withRouter(injectIntl(Categories));

// categoriesSeeAll: {
//   id: 'app.containers.Admin.Insights.Details.categoriesSeeAll',
//   defaultMessage: 'See all',
// },
