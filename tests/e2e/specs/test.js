// For authoring Nightwatch tests, see
// https://nightwatchjs.org/guide

module.exports = {
  "example e2e test using a custom command": browser => {
    browser
      .openHomepage()
      .assert.elementPresent(".chat-bot")
      .end();
  },

  "base elements e2e tests": browser => {
    browser
      .init()
      .waitForElementVisible("#app")
      .assert.elementPresent(".chat-bot")
      .assert.elementPresent(".chat-bot .info")
      .assert.elementPresent(".chat-bot .chat")
      .assert.elementPresent(".container > a > img")
      .assert.elementCount("img", 1)
      .end();
  },

  "info e2e tests": browser => {
    browser
      .init()
      .waitForElementVisible("#app")
      .assert.elementPresent(".info .header")
      .assert.containsText(".info > .header", "Hello! I'm the SELFIE CHATBOT. How can I help you?")
      .assert.elementPresent(".info ul.sample-questions")
      .assert.elementPresent(".info .language-chooser")
      .assert.containsText(".info .language-chooser button", "English")
      .end();
  },

  "conversation e2e tests": browser => {
    browser
      .init()
      .waitForElementVisible("#app")
      .assert.elementPresent(".chat .conversation")
      .assert.elementPresent(".chat .conversation .chatbot")
      .assert.elementPresent(".chat .conversation .chatbot .col > i.fas.fa-robot.fa-2x")
      .assert.containsText(".chat .conversation .chatbot .col-8 > span.text", "Hello! How can I help you?")
      .assert.elementPresent(".chat .question")
      .assert.elementPresent(".chat .question form .input-group input[type=\"text\"]")
      .assert.elementPresent(".chat .question form .input-group .input-group-append button.btn.btn-outline-secondary > i.fas.fa-paper-plane.fa-lg")
      .assert.elementPresent(".chat .question form .input-group .input-group-append button.btn.btn-outline-secondary > i.fas.fa-eraser.fa-lg")
      .end();
  },

  "language chooser e2e tests": browser => {
    browser
      .init()
      .waitForElementVisible("#app")
      .assert.elementPresent(".language-chooser")
      .assert.containsText(".language-chooser button.btn.dropdown-toggle", "English")
      .click(".language-chooser button.btn.dropdown-toggle")
      .waitForElementVisible(".language-chooser ul.dropdown-menu")
      .assert.containsText(".language-chooser ul.dropdown-menu li:nth-child(2) > a", "ESTONIAN")
      .click(".language-chooser ul.dropdown-menu li:nth-child(2) > a")
      .assert.containsText(".language-chooser button.btn.dropdown-toggle", "Eesti")
      .end();
  },

  "question input e2e tests": browser => {
    browser
      .openHomepage()
      .assert.elementPresent(".question input[type=\"text\"]")
      .assert.attributeEquals(".question input[type=\"text\"]", "placeholder", "Type your question here")
      .assert.value(".question input[type=\"text\"]", "")
      .setValue(".question input[type=\"text\"]", "What is SELFIE?")
      .click(".question button[type=\"submit\"")
      .assert.not.enabled(".question input[type=\"text\"]")
      .waitForElementVisible(".conversation .user.conversation-item")
      .assert.containsText(".conversation .user.conversation-item", "What is SELFIE?")
      .assert.enabled(".question button[type=\"button\"]")
      .click(".question button[type=\"button\"]")
      .waitForElementNotPresent(".conversation .user.conversation-item")
      .assert.not.enabled(".question button[type=\"button\"]")
      .assert.elementPresent(".conversation .chatbot")
      .assert.containsText(".conversation .chatbot", "Hello! How can I help you?")
      .end();
  }

};
