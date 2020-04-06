import React, { memo, useCallback, useState } from 'react';

// hooks
import useLocalize from 'hooks/useLocalize';
import useGraphqlTenantLocales from 'hooks/useGraphqlTenantLocales';

// graphql
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

// components
import FilterSelector, { IFilterSelectorValue } from 'components/FilterSelector';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

interface Props {
  onChange: (value: string[]) => void;
}

const ParticipationlevelFilter = memo<Props & InjectedIntlProps>(({  intl: { formatMessage }, onChange }) => {

  const localize = useLocalize();
  const graphqlTenantLocales = useGraphqlTenantLocales();

  const PARTICIPATIONLEVELS_QUERY = gql`
    {
      participationLevels {
        nodes {
          id
          titleMultiloc {
            ${graphqlTenantLocales}
          }
        }
      }
    }
  `;

  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const { data } = useQuery(PARTICIPATIONLEVELS_QUERY);

  let options: IFilterSelectorValue[] = [];

  if (data) {
    options = data.participationLevels.nodes.map((node) => ({
      value: node.id,
      text: localize(node.titleMultiloc)
    }));
  }

  const handleOnChange = useCallback((selectedValues: string[]) => {
    setSelectedValues(selectedValues);
    onChange(selectedValues);
  }, []);

  return (
    <FilterSelector
      title={formatMessage(messages.participationLevels)}
      name={formatMessage(messages.participationLevels)}
      selected={selectedValues}
      values={options}
      onChange={handleOnChange}
      multipleSelectionAllowed={true}
      last={false}
      left="-5px"
      mobileLeft="-5px"
    />
  );
});

export default injectIntl(ParticipationlevelFilter);
