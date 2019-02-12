import React from 'react';

import { addAdminFeedbackToIdea } from 'services/adminFeedback';

import { Formik } from 'formik';
import AdminFeedbackForm, { FormValues } from './AdminFeedbackForm';
import { CLErrorsJSON } from 'typings';

interface Props {
  ideaId: string;
}

export default class AdminFeedbackNew extends React.Component<Props> {

  handleSubmit = (values: FormValues, { setErrors, setSubmitting }) => {
    const { ideaId } = this.props;
    setSubmitting(true);
    addAdminFeedbackToIdea(ideaId, values)
      .then(() => {
        console.log('hi');
        setSubmitting(false);
      }).catch((errorResponse) => {
        const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      });
  }

  renderFn = (props) => {
    return <AdminFeedbackForm {...props} />;
  }

  initialValues = () => ({
    author_multiloc: {},
    body_multiloc: {}
  })

  render() {
    return (
        <Formik
          initialValues={this.initialValues()}
          render={this.renderFn}
          onSubmit={this.handleSubmit}
          validate={AdminFeedbackForm.validate}
        />
    );
  }
}
