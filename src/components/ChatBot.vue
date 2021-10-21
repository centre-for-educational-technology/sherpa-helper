<template>
  <div class="container main my-4 chat-bot">
    <div class="row">
      <div class="col-sm info p-4 d-flex flex-column">
        <div class="header my-4">
          {{ $t("info.header") }}
        </div>
        <div class="mt-4">
          <strong>{{ $t("info.sample_questions") }}</strong>
          <ul class="sample-questions pl-0">
            <li
              v-for="(question, index) in sampleQuestions"
              v-bind:key="index"
              class="mt-1"
            >
              <span @click="onAskSampleQuestion(question)">
                {{ question.text }}
              </span>
            </li>
          </ul>

          <!--div @click="onMoreQuestions" class="more-questions mt-4">
            {{ $t("info.see_more_questions") }}
          </div-->
        </div>

        <div class="mt-auto align-self-end">
          <language-chooser :locales="locales"></language-chooser>
        </div>
      </div>
      <div class="col-sm chat px-0">
        <div class="conversation p-2 px-4 mt-4" ref="conversation">
          <conversation-item
            v-for="(item, index) in conversation"
            v-bind:key="index"
            :item="item"
          ></conversation-item>
          <b-spinner
            label="Loading..."
            type="grow"
            variant="secondary"
            small
            v-if="loading"
          ></b-spinner>
        </div>
        <div class="container position-absolute question" ref="question">
          <div class="row">
            <div class="col">
              <b-form @submit="onSubmitQuestion">
                <b-input-group>
                  <b-form-input
                    v-model="question"
                    v-bind:placeholder="$t('conversation.question_placeholder')"
                    v-bind:disabled="loading"
                    size="lg"
                    trim
                  ></b-form-input>
                  <b-input-group-append>
                    <b-button
                      variant="outline-secondary"
                      type="submit"
                      v-bind:disabled="loading"
                    >
                      <i class="fas fa-paper-plane fa-lg"></i>
                    </b-button>
                    <b-button
                      variant="outline-secondary"
                      type="button"
                      v-bind:disabled="!canClear"
                      @click="onClearConversation()"
                    >
                      <i class="fas fa-eraser fa-lg"></i>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { SampleQuestion } from "../store";
import { chatBotService } from "../services/chatbot";
import { knowledgeBaseService } from "../services/kb";
import ConversationItem from "./ConversationItem.vue";
import LanguageChooser from "./LanguageChooser.vue";
import SampleQuestions from "../data/questions.json";

@Component({
  components: {
    ConversationItem,
    LanguageChooser
  },
  props: {
    locales: {
      type: Array,
      required: true
    }
  }
})
export default class ChatBot extends Vue {
  loading = false;
  question = "";

  created() {
    this.$root.$on("resubmitQuestionInEnglish", () => {
      this.scrollQuestionElementIntoView();
    });
  }

  mounted() {
    this.$store.dispatch("setSampleQuestions", SampleQuestions);
    this.addToConversation("greeting");
  }

  public get conversation(): Array<{ type: string; text: string }>[] {
    return this.$store.state.conversation;
  }

  public get sampleQuestions(): Array<SampleQuestion> {
    return this.$store.getters.sampleQuestionsForLocale(
      this.$root.$i18n.locale
    );
  }

  private get questionElement(): HTMLElement {
    return this.$refs.question as HTMLElement;
  }

  private get conversationElement(): HTMLElement {
    return this.$refs.conversation as HTMLElement;
  }

  public get canClear(): boolean {
    return this.conversation.length > 1 && !this.loading;
  }

  private addToConversation(
    type: string,
    text?: string,
    userInput?: string
  ): void {
    this.$store.dispatch("addToConversation", {
      type: type,
      text: text,
      timestamp: new Date(),
      locale: this.$i18n.locale,
      userInput: userInput
    });
  }

  onSubmitQuestion(evt: Event): void {
    evt.preventDefault();

    if (this.question.length <= 0) {
      return;
    }

    this.askQuestion(this.question).then(() => {
      this.question = "";
    });
  }

  onAskSampleQuestion(question: SampleQuestion): void {
    if (!this.loading) {
      this.askQuestion(question.text);
    }
  }

  askQuestion(question: string): Promise<void> {
    this.loading = true;

    this.addToConversation("user", question);

    this.scrollQuestionElementIntoView();

    const languageCode = this.$i18n.locale;

    return chatBotService
      .getAnswer(question, languageCode)
      .then(response => {
        let chatbotAnswer = "";
        this.loading = false;

        if (response.data && response.data.length > 0) {
          chatbotAnswer = response.data[0];
        }

        if (chatbotAnswer) {
          this.addToConversation("chatbot", chatbotAnswer, question);
        } else {
          this.addToConversation("suggestion", question);
        }

        knowledgeBaseService.logActivity(question, chatbotAnswer, languageCode);
      })
      .catch(error => {
        this.loading = false;
        window.console.error(error);
        this.$bvToast.toast(error.message, {
          toaster: "b-toaster-bottom-left",
          title: this.$t("toast.error.title").toString(),
          variant: "danger"
        });
      })
      .then(() => {
        this.scrollQuestionElementIntoView();
      });
  }

  onMoreQuestions(): void {
    this.$bvToast.toast("This feature has not been implemented yet!", {
      toaster: "b-toaster-bottom-left",
      title: "NB!",
      variant: "warning"
    });
  }

  scrollQuestionElementIntoView(): void {
    Vue.nextTick(() => {
      const conversationStyle = getComputedStyle(this.conversationElement);

      // This one does not check if scrolling is really required
      // It might make sense to do that not to trigger scrolling when it is not required
      if (conversationStyle.getPropertyValue("overflow-y") === "auto") {
        this.conversationElement.scroll({
          top: this.conversationElement.scrollHeight,
          behavior: "smooth"
        });
      }

      this.questionElement.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
    });
  }

  onClearConversation(): void {
    this.$store.dispatch("clearConversation");
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.container.main {
  > .row {
    min-height: 75vh;
  }

  .info {
    background-color: rgb(80, 181, 187);
    text-align: left;
    color: rgb(255, 255, 255);
    font-weight: 500;
    font-size: 125%;

    .header {
      font-size: 150%;
    }

    .sample-questions {
      list-style-type: none;

      li > span {
        text-decoration: underline;
        cursor: pointer;
      }
    }

    .more-questions {
      text-decoration: underline;
      cursor: pointer;
    }
  }

  .chat {
    background-color: rgba(245, 245, 245, 1);

    .conversation {
      margin-bottom: 5em;
    }

    .container.question {
      bottom: 1em;
    }
  }
}

@media (min-width: 992px) {
  .container.main {
    > .row {
      > .chat {
        > .conversation {
          overflow-y: auto;
          max-height: 60vh;
        }
      }
    }
  }
}
</style>

<i18n>
{
  "en": {
    "info": {
      "header": "Hello! I'm the SELFIE CHATBOT. How can I help you?",
      "sample_questions": "To start with, here are some sample questions:",
      "see_more_questions": "See more common questions"
    },
    "conversation": {
      "question_placeholder": "Type your question here"
    }
  },
  "et": {
    "info": {
      "header": "Tere! Olen SELFIE CHATBOT, kuidas saan abiks olla?",
      "sample_questions": "Siin on mõned näidisküsimused:",
      "see_more_questions": "Rohkem küsimusi"
    },
    "conversation": {
      "question_placeholder": "Trüki oma küsimus siia"
    }
  },
  "fi": {
    "info": {
      "header": "Hei, Olen SELFIE chatbot, kuinka voin auttaa sinua ?",
      "sample_questions": "Tässä joitakin esimerkkikysymyksiä:",
      "see_more_questions": "Haluatko nähdä lisää yleisimpiä kysymyksiä?"
    },
    "conversation": {
      "question_placeholder": "Kirjoita kysymyksesi tähän"
    }
  },
  "it": {
    "info": {
      "header": "Ciao. Sono il Chatbot di SELFIE. Come posso aiutarti?",
      "sample_questions": "Per cominciare, ecco alcune domande di esempio:",
      "see_more_questions": "Visualizza altre domande comuni."
    },
    "conversation": {
      "question_placeholder": "Inserisci qui la tua domanda"
    }
  },
  "el": {
    "info": {
      "header": "Γεια! Είμαι ο SELFIE CHATBOT, πώς μπορώ να βοηθήσω;",
      "sample_questions": "Για αρχή, εδώ είναι μερικά δείγματα ερωτήσεων:",
      "see_more_questions": "Δες περισσότερες κοινές ερωτήσεις"
    },
    "conversation": {
      "question_placeholder": "Πληκτρολόγησε την ερώτηση σου εδώ"
    }
  }
}
</i18n>
