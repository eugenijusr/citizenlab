import { randomString } from '../support/commands';

describe('Project overview page', () => {
  it('show 6 project by default and load 6 more when the show more button is pressed', () => {
    cy.visit('/projects/');
    cy.get('#e2e-projects-container');
    cy.get('#e2e-projects-list');
    cy.get('.e2e-project-card').should('have.length', 6);
    cy.get('.e2e-project-cards-show-more-button').click();
    cy.wait(2000);
    cy.get('.e2e-project-card').should('have.length', 12);
  });
});
