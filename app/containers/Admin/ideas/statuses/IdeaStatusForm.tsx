import React from 'react';
import { isEmpty, values as getValues, every } from 'lodash-es';
import styled from 'styled-components';

import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikTextAreaMultiloc from 'components/UI/FormikTextAreaMultiloc';
import FormikColorPickerInput from 'components/UI/FormikColorPickerInput';
import FormikRadio from 'components/UI/FormikRadio';
import Error from 'components/UI/Error';
import {
  Section,
  SectionField,
  SubSectionTitle,
  SectionDescription,
} from 'components/admin/Section';
import { Form, Field, InjectedFormikProps, FormikErrors } from 'formik';
import { Label, IconTooltip } from 'cl2-component-library';

import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { Multiloc } from 'typings';
import messages from '../messages';

export interface FormValues {
  color: string;
  code: string;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  ideas_count: number;
  ordering: number;
}

export interface Props {
  mode: 'new' | 'edit';
  ideaStatusId: string;
  builtInField: boolean;
}

const RadioSection = styled(SectionField)`
  max-width: unset;
  margin-bottom: 5rem;
`;

const SubSectionDescription = styled(SectionDescription)`
  margin-bottom: 3rem;
`;

const RadioInputGroup = styled(SectionField)`
  padding: 0 1rem 0 2rem;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  max-width: unset;
`;

const RadioLabel = styled(Label)`
  display: block;
  line-height: 1.4;
  padding-left: 1rem;
`;

const RadioLabelTitle = styled.span`
  display: flex;
  font-weight: 500;
  font-size: 1.1rem;
`;

const StyledIconTooltip = styled(IconTooltip)`
  margin-left: 0.5rem;

  svg {
    fill: #aeaeae;
  }
`;

const StyledSectionField = styled(SectionField)`
  margin-bottom: 5rem;
`;

class IdeaStatusForm extends React.Component<
  InjectedFormikProps<Props & InjectedIntlProps, FormValues>
> {
  public static validate = (values: FormValues): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};

    if (every(getValues(values.title_multiloc), isEmpty)) {
      errors.title_multiloc = [{ error: 'blank' }] as any;
    }

    return errors;
  };

  inputTypeOptions = () => {
    const fieldTypes = [
      'text',
      'number',
      'multiline_text',
      'select',
      'multiselect',
      'checkbox',
      'date',
    ];
    return fieldTypes.map((inputType) => ({
      value: inputType,
      label: this.props.intl.formatMessage(messages[`inputType_${inputType}`]),
    }));
  };

  codeRadioButtons = () => {
    const { CodeRadio } = this;
    const codes = [
      'proposed',
      'viewed',
      'under_consideration',
      'accepted',
      'implemented',
      'rejected',
      'other',
    ];

    return codes.map((code) => <CodeRadio key={code} code={code} />);
  };

  CodeRadio = ({ code }) => {
    const { touched, errors } = this.props;
    const titleMessage = messages[`${code}FieldCodeTitle`];
    const descriptionMessage = messages[`${code}FieldCodeDescription`];

    return (
      <RadioInputGroup>
        <FormikRadio name="code" value={code} />
        <RadioLabel>
          <RadioLabelTitle>
            <FormattedMessage {...titleMessage} />
            <StyledIconTooltip
              iconSize="12px"
              placement="top"
              content={<FormattedMessage {...descriptionMessage} />}
            />
          </RadioLabelTitle>
        </RadioLabel>
        {touched.code && <Error apiErrors={errors.code as any} />}
      </RadioInputGroup>
    );
  };

  render() {
    const {
      isSubmitting,
      errors,
      isValid,
      touched,
      builtInField,
      status,
      intl: { formatMessage },
    } = this.props;

    return (
      <Form>
        <Section>
          <RadioSection>
            <SubSectionTitle>
              <FormattedMessage {...messages.fieldCode} />
              <IconTooltip
                content={<FormattedMessage {...messages.fieldCodeTooltip} />}
              />
            </SubSectionTitle>
            <SubSectionDescription>
              <FormattedMessage {...messages.fieldCodeDescription} />
            </SubSectionDescription>

            {this.codeRadioButtons()}
          </RadioSection>
        </Section>

        <Section>
          <SubSectionTitle>
            <FormattedMessage {...messages.visualFields} />
          </SubSectionTitle>
          <SubSectionDescription>
            <FormattedMessage {...messages.visualFieldsDescription} />
          </SubSectionDescription>

          <StyledSectionField>
            <Label>
              <FormattedMessage {...messages.fieldColor} />
            </Label>
            <Field name="color" component={FormikColorPickerInput} />
          </StyledSectionField>

          <StyledSectionField>
            <Field
              name="title_multiloc"
              component={FormikInputMultiloc}
              label={formatMessage(messages.fieldTitle)}
              labelTooltipText={formatMessage(messages.fieldTitleTooltip)}
              disabled={builtInField}
            />
            {touched.title_multiloc && (
              <Error
                fieldName="title_multiloc"
                apiErrors={errors.title_multiloc as any}
              />
            )}
          </StyledSectionField>

          <StyledSectionField>
            <Field
              name="description_multiloc"
              component={FormikTextAreaMultiloc}
              label={formatMessage(messages.fieldDescription)}
              labelTooltipText={formatMessage(messages.fieldDescriptionTooltip)}
              disabled={builtInField}
            />
            {touched.description_multiloc && (
              <Error
                fieldName="description_multiloc"
                apiErrors={errors.description_multiloc as any}
              />
            )}
          </StyledSectionField>
        </Section>

        <FormikSubmitWrapper {...{ isValid, isSubmitting, status, touched }} />
      </Form>
    );
  }
}

export default injectIntl(IdeaStatusForm);
