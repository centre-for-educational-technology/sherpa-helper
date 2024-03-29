////////////////////////////////////////////////////////////////
// For authoring Nightwatch tests, see
// https://nightwatchjs.org/guide
//
// For more information on working with page objects see:
//   https://nightwatchjs.org/guide/working-with-page-objects/
////////////////////////////////////////////////////////////////

module.exports = {
  beforeEach: browser => browser.init(),

  "e2e tests using page objects": browser => {
    const homepage = browser.page.homepage();
    homepage.waitForElementVisible("@appContainer");

    const app = homepage.section.app;
    app.assert.elementCount("@logo", 1);
    app.expect.section("@info").to.be.visible;
    app.expect
      .section("@header")
      .text.to.match(/^Hello! I'm the SELFIE CHATBOT\. How can I help you\?$/);

    browser.end();
  },

  'verify if string "e2e-nightwatch" is within the cli plugin links': browser => {
    const homepage = browser.page.homepage();
    const welcomeSection = homepage.section.app.section.info;

    welcomeSection.expect
      .element("@sampleQuestions")
      .text.to.contain("What is a school profile?");
  }
};
