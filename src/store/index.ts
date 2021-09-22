import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export interface ConversationEntry {
  type: string;
  text: string;
  timestamp: Date;
  locale: string;
  userInput: string;
}

export interface SampleQuestion {
  text: string;
  locale: string;
}

export default new Vuex.Store({
  state: {
    conversation: Array<ConversationEntry>(),
    sampleQuestions: Array<SampleQuestion>()
  },
  getters: {
    sampleQuestionsForLocale: state => (locale: string) => {
      const questions = state.sampleQuestions.filter(
        item => item.locale === locale
      );

      if (questions.length > 0) {
        return questions;
      }

      return state.sampleQuestions.filter(item => item.locale === "en");
    }
  },
  mutations: {
    addToConversation(state, entry: ConversationEntry) {
      state.conversation.push(entry);
    },
    addToSampleQuestions(state, question: SampleQuestion) {
      state.sampleQuestions.push(question);
    },
    setSampleQuestions(state, questions: Array<SampleQuestion>) {
      state.sampleQuestions = questions;
    },
    clearConversation(state) {
      state.conversation.splice(1);
    }
  },
  actions: {
    addToConversation(context, entry: ConversationEntry) {
      context.commit("addToConversation", entry);
    },
    addToSampleQuestions(context, question: SampleQuestion) {
      context.commit("addToSampleQuestions", question);
    },
    setSampleQuestions(context, questions: Array<SampleQuestion>) {
      context.commit("setSampleQuestions", questions);
    },
    clearConversation(context) {
      context.commit("clearConversation");
    }
  },
  modules: {}
});
