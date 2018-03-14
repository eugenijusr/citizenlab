const crypto = require('crypto');
const hash = crypto.randomBytes(5).toString('hex');
const title = `Test Phase ${hash}`;
const startDate = '2017-11-05';
const endDate = '2017-11-12';
const afterEach = require('../../updateBSStatus');

module.exports = {
  '@tags': ['city', 'projects', 'phases'],
  afterEach,
  phaseCreateAndDelete: (browser) => {
    const signinPage = browser.page.signin();
    const adminProjectsPage = browser.page.adminProjects();

    let phaseLineId = '';

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    adminProjectsPage
    .navigate()
    .waitForElementVisible('.e2e-project-card.process-timeline')
    .click('.e2e-project-card.process-timeline a')
    .waitForElementVisible('@phasesTab')
    .click('@phasesTab')
    .waitForElementVisible('@addPhaseButton')
    .click('@addPhaseButton')
    .assert.urlContains('/timeline/new');

    // Phase insertion form
    adminProjectsPage
    .fillMultiloc('#title', title)
    .fillMultiloc('#description', 'Lorem Ipsum dolor sit amet')
    .setValue('#startDate', startDate)
    .setValue('#endDate', endDate)
    .click('@submitButton')
    .waitForElementVisible('@submitSuccess');

    // Check for phase presence in the list
    browser
    .refresh();

    adminProjectsPage
    .waitForElementVisible('@phasesTab')
    .click('@phasesTab')
    .waitForElementVisible('.e2e-phases-table .e2e-phase-line')
    .assert.containsText('.e2e-phases-table .e2e-phase-line.last .e2e-phase-title span', title);

    // Delete the phase
    adminProjectsPage
    .getAttribute('.e2e-phase-line', 'id', (result) => {
      phaseLineId = result.value;
    })
    .click('.e2e-phase-line .e2e-delete-phase');

    browser
    .acceptAlert()
    .waitForElementNotPresent(`#${phaseLineId}`);

    browser.end();
  },
};
