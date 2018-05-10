/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

// Sentry error tracking
if (process.env.NODE_ENV !== 'development' && process.env.SENTRY_DSN) {
  import('raven-js').then((Raven) => {
    Raven.config(process.env.SENTRY_DSN, {
      environment: process.env.NODE_ENV,
      release: process.env.CIRCLE_BUILD_NUM,
      tags: {
        git_commit: process.env.CIRCLE_SHA1,
        branch: process.env.CIRCLE_BRANCH,
      },
    }).install();
  });
}

// Import all the third party stuff
import React from 'react';
import ReactDOM from 'react-dom';
import { applyRouterMiddleware, Router } from 'react-router';
import FontFaceObserver from 'fontfaceobserver';
import { useScroll } from 'react-router-scroll';
import 'sanitize.css/sanitize.css';
import 'react-select/dist/react-select.css';

// Creates the LazyImages Observer
import 'utils/lazyImagesObserver';

// Import root app
import App from 'containers/App';

// Import Language Provider
import LanguageProvider from 'containers/LanguageProvider';

// Load the favicon, the manifest.json file and the .htaccess file
/* eslint-disable import/no-unresolved, import/extensions */
import '!file-loader?name=[name].[ext]!./favicon.ico';
import '!file-loader?name=[name].[ext]!./manifest.json';
import 'file-loader?name=[name].[ext]!./.htaccess';
/* eslint-enable import/no-unresolved, import/extensions */

// Import i18n messages
import { translationMessages } from './i18n';

/* eslint-disable import/first */
import 'semantic-ui-css/semantic.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './global-styles';
/* eslint-enable import/first */

// Import root routes
import createRoutes from './routes';

import { initializeAnalytics } from 'utils/analytics';

// Observe loading of custom font
const visuelt = new FontFaceObserver('visuelt');

// When custom font is loaded, add a 'fontLoaded' class to the body tag
visuelt.load().then(() => {
  document.body.classList.add('fontLoaded');
}, () => {
  document.body.classList.remove('fontLoaded');
});

initializeAnalytics();

// Set up the router, wrapping all Routes in the App component
const rootRoute = {
  component: App,
  childRoutes: createRoutes(),
};

const render = (messages) => {
  ReactDOM.render(
    <LanguageProvider messages={messages}>
      <Router
        history={history}
        routes={rootRoute}
        render={
          // Scroll to top when going to a new page, imitating default browser
          // behaviour
          applyRouterMiddleware(useScroll())
        }
      />
    </LanguageProvider>,
    document.getElementById('app')
  );
};

// Hot reloadable translation json files
if (module.hot) {
  // modules.hot.accept does not accept dynamic dependencies,
  // have to be constants at compile-time
  module.hot.accept('./i18n', () => {
    render(translationMessages);
  });
}

// Chunked polyfill for browsers without Intl support
if (!window.Intl) {
  (new Promise((resolve) => {
    resolve(import('intl'));
  }))
    .then(() => Promise.all([
      import('intl/locale-data/jsonp/en.js'),
    ]))
    .then(() => render(translationMessages))
    .catch((err) => {
      throw err;
    });
} else {
  render(translationMessages);
}
