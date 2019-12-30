import React, { PureComponent } from 'react';
import messages from './messages';
import { IConsentData, updateConsent, IConsent } from 'services/campaignConsents';
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { find } from 'lodash-es';

// components
import SubmitWrapper from 'components/admin/SubmitWrapper';
import T from 'components/T';
import Checkbox from 'components/UI/Checkbox';

// analytics
import { trackEventByName } from 'utils/analytics';
import { FormSectionTitle, FormSection } from 'components/UI/FormComponents';

const CheckboxContainer = styled.div`
  margin-bottom: 16px;
`;

const ConsentList = styled.div`
  margin-bottom: 40px;
`;

type Props = {
  consents: IConsentData[];
  trackEventName: string;
};

interface State {
  consentChanges: {};
  isSaving: boolean;
  saveButtonStatus: 'enabled' | 'disabled' | 'error' | 'success';
}

export default class ConsentForm extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props as any);
    this.state = {
      consentChanges: {},
      isSaving: false,
      saveButtonStatus: 'disabled',
    };
  }

  handleOnChange = (consent: IConsentData) => () => {
    const becomesConsented = this.isConsented(consent.id);
    this.setState(prevState => ({
      consentChanges: {
        ...prevState.consentChanges,
        [consent.id]: !becomesConsented,
      },
      saveButtonStatus: 'enabled'
    }));
  }

  isConsented = (consentId) => {
    const { consents } = this.props;
    if (!isNilOrError(consents)) {
      const consent = find(consents, { id: consentId }) as IConsentData;
      if (typeof(this.state.consentChanges[consentId]) === 'undefined') {
        return (consent && consent.attributes.consented);
      } else {
        return this.state.consentChanges[consentId];
      }
    }
    return false;
  }

  handleOnSubmit = () => {
    const { trackEventName } = this.props;
    const { consentChanges } = this.state;
    let consentUpdates: Promise<IConsent>[] = [];

    // analytics
    trackEventByName(trackEventName, { extra: { consentChanges } });

    this.setState({ isSaving: true, saveButtonStatus: 'disabled' });
    if (consentChanges) {
      consentUpdates = Object.keys(consentChanges).map(consentId => {
        return updateConsent(consentId, { consented: this.isConsented(consentId) });
      });
    }

    Promise.all(consentUpdates).then(() => {
      this.setState({
        consentChanges: {},
        isSaving: false,
        saveButtonStatus: 'success'
      });
    }).catch(() => {
      this.setState({ saveButtonStatus: 'error' });
    });
  }

  render() {
    const { consents } = this.props;
    const { isSaving, saveButtonStatus } = this.state;

    return (
      <FormSection>
        <form action="">
          <FormSectionTitle message={messages.notificationsTitle} subtitleMessage={messages.notificationsSubTitle} />
          <ConsentList>
            {!isNilOrError(consents) && consents.map((consent) => (
              <CheckboxContainer key={consent.id}>
                <Checkbox
                  id={consent.id}
                  checked={this.isConsented(consent.id)}
                  onChange={this.handleOnChange(consent)}
                  label={<T value={consent.attributes.campaign_type_description_multiloc}/>}
                />
              </CheckboxContainer>
            ))}
          </ConsentList>
          <SubmitWrapper
            status={saveButtonStatus}
            style="primary"
            loading={isSaving}
            onClick={this.handleOnSubmit}
            messages={{
              buttonSave: messages.submit,
              buttonSuccess: messages.buttonSuccessLabel,
              messageSuccess: messages.messageSuccess,
              messageError: messages.messageError,
            }}
          />
        </form>
      </FormSection>
    );
  }
}
