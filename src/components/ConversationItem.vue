<template>
  <div
    v-bind:class="{
      user: isUser(),
      chatbot: isChatBot(),
      'my-2 row conversation-item': true
    }"
  >
    <div class="col">
      <i
        class="fas fa-robot fa-2x"
        v-if="isChatBot()"
        v-b-tooltip.hover
        v-bind:title="localDate"
      ></i>
    </div>
    <div class="col-8">
      <span class="text" v-if="isGreeting()">
        {{ $t("greeting") }}
      </span>
      <span
        class="text"
        v-html="htmlifyText(item.text)"
        v-if="!(isSuggestion() || isGreeting())"
      ></span>
      <response-rating
        :item="item"
        v-if="isChatbotResponse()"
      ></response-rating>
      <div v-if="isSuggestion()">
        <div v-if="!isInEnglish">
          <span class="text">
            {{ $t("suggestion.ask_in_english") }}
          </span>
          <div class="my-2 text-center">
            <b-button-group>
              <b-button
                size="sm"
                :variant="submitInEnglishVariantYes"
                :disabled="loading || disableSubmitInEnglish"
                @click="onEnglishYes"
              >
                {{ $t("suggestion.buttons.yes") }}
              </b-button>
              <b-button
                size="sm"
                :variant="submitInEnglishVariantNo"
                :disabled="loading || disableSubmitInEnglish"
                @click="onEnglishNo"
              >
                {{ $t("suggestion.buttons.no") }}
              </b-button>
            </b-button-group>
          </div>
        </div>
        <div v-if="showSuggestQuestion()">
          <span class="text">
            {{
              $t(
                isInEnglish
                  ? "suggestion.text_for_english"
                  : "suggestion.text_not_for_english"
              )
            }}
          </span>
          <div class="my-2 text-center">
            <b-button-group>
              <b-button
                size="sm"
                :variant="submitSuggestionVariantYes"
                :disabled="loading || disableSuggestion"
                @click="onYes"
              >
                <b-spinner
                  label="Loading..."
                  type="grow"
                  variant="secondary"
                  small
                  v-if="loading"
                ></b-spinner>
                {{ $t("suggestion.buttons.yes") }}
              </b-button>
              <b-button
                size="sm"
                :variant="submitSuggestionVariantNo"
                :disabled="loading || disableSuggestion"
                @click="onNo"
              >
                {{ $t("suggestion.buttons.no") }}
              </b-button>
            </b-button-group>
          </div>
        </div>
        <span class="text" v-if="congratulate">
          {{ $t("suggestion.congrats") }}
        </span>
      </div>
    </div>
    <div class="col">
      <i
        class="fas fa-user-circle fa-2x"
        v-if="isUser()"
        v-b-tooltip.hover
        v-bind:title="localDate"
      ></i>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import urlRegex from "url-regex";
import { ConversationEntry } from "../store";
import { knowledgeBaseService } from "../services/kb";
import { recaptchaService } from "../services/recaptcha";
import ResponseRating from "./ResponseRating.vue";

@Component({
  components: {
    ResponseRating
  }
})
export default class ConversationItem extends Vue {
  loading = false;
  submitSuggestionChoice = "";
  congratulate = false;
  submitInEnglishChoice = "";

  @Prop({ required: true })
  item!: ConversationEntry;

  mounted() {
    // TODO See if this is the best solution or could be improved upon
    recaptchaService.load();
  }

  get localDate(): string {
    return this.item.timestamp.toLocaleString();
  }

  get disableSuggestion(): boolean {
    return this.submitSuggestionChoice !== "";
  }

  get isInEnglish(): boolean {
    return this.item.locale === "en";
  }

  get disableSubmitInEnglish(): boolean {
    return this.submitInEnglishChoice !== "";
  }

  get submitSuggestionVariantYes(): string {
    return this.determineVariant(
      this.disableSuggestion,
      this.submitSuggestionChoice,
      "yes"
    );
  }

  get submitSuggestionVariantNo(): string {
    return this.determineVariant(
      this.disableSuggestion,
      this.submitSuggestionChoice,
      "no"
    );
  }

  get submitInEnglishVariantYes(): string {
    return this.determineVariant(
      this.disableSubmitInEnglish,
      this.submitInEnglishChoice,
      "yes"
    );
  }

  get submitInEnglishVariantNo(): string {
    return this.determineVariant(
      this.disableSubmitInEnglish,
      this.submitInEnglishChoice,
      "no"
    );
  }

  determineVariant(
    disabled: boolean,
    choice: string,
    expected: string
  ): string {
    if (disabled && choice === expected) {
      return "secondary";
    }

    return "outline-secondary";
  }

  isChatBot(): boolean {
    return ["chatbot", "suggestion", "greeting"].includes(this.item.type);
  }

  isUser(): boolean {
    return this.item.type === "user";
  }

  isSuggestion(): boolean {
    return this.item.type === "suggestion";
  }

  isGreeting(): boolean {
    return this.item.type === "greeting";
  }

  showSuggestQuestion(): boolean {
    return this.isInEnglish || this.submitInEnglishChoice === "no";
  }

  isChatbotResponse(): boolean {
    return this.item.type === "chatbot";
  }

  escapeHtml(value: string): string {
    // Solution is based on how Prototype.js and Underscore.js are handing it
    // https://github.com/prototypejs/prototype/blob/d9411e5/src/prototype/lang/string.js#L408
    // https://github.com/jashkenas/underscore/blob/master/underscore.js#L825
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/`/g, "&#x60;");
  }

  htmlifyText(value: string): string {
    // Escape before converting linebrakes and links to HTML
    value = this.escapeHtml(value);

    let processed = value;
    processed = processed.replace(/\\n/g, "<br>");
    processed = processed.replace(urlRegex(), url => {
      if (url.endsWith(",") || url.endsWith(".")) {
        const ending = url.charAt(url.length - 1);
        url = url.slice(0, -1);
        return `<a href="${url}" target="_blank">${url}</a>${ending}`;
      }

      return `<a href="${url}" target="_blank">${url}</a>`;
    });

    return processed;
  }

  makeSuggestion(suggestion: string): void {
    this.loading = true;

    recaptchaService.execute("suggest").then(token => {
      knowledgeBaseService
        .postSuggestion(suggestion, this.$i18n.locale, token)
        .then(() => {
          this.loading = false;
          this.submitSuggestionChoice = "yes";
          this.congratulate = true;
        })
        .catch(error => {
          this.loading = false;
          window.console.error(error);
          this.$bvToast.toast(error.message, {
            toaster: "b-toaster-bottom-left",
            title: this.$t("toast.error.title").toString(),
            variant: "danger"
          });
        });
    });
  }

  onYes(): void {
    this.makeSuggestion(this.item.text);
  }

  onNo(): void {
    this.submitSuggestionChoice = "no";
  }

  onEnglishYes(): void {
    this.$root.$i18n.locale = "en";
    this.$root.$emit("resubmitQuestionInEnglish");
    this.submitInEnglishChoice = "yes";
  }

  onEnglishNo(): void {
    this.submitInEnglishChoice = "no";
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.conversation-item {
  &.chatbot {
    text-align: left;
  }

  &.user {
    text-align: right;

    .text {
      background-color: rgba(64, 75, 182, 1);
      color: #fff;
      border-radius: 1em;
      padding: 0.5em;
      border-bottom-right-radius: 0;
      display: inline-block;
      word-wrap: break-word;
    }
  }

  .fa-robot {
    color: #8cc152;
  }

  .fa-user-circle {
    color: #d770ad;
  }
}
</style>

<i18n>
{
  "en": {
    "greeting": "Hello! How can I help you?",
    "suggestion": {
      "ask_in_english": "There is no answer defined for your question! Would you like to submit your question again in English?",
      "text_for_english": "I’m unable to find an answer to your question. Would you like to suggest this question to my database?",
      "text_not_for_english": "Would you like to suggest this question to my database?",
      "congrats": "Great! Do you have any further questions?",
      "buttons": {
        "yes": "Yes",
        "no": "No"
      }
    }
  },
  "et": {
    "greeting": "Tere! Kuidas saan abiks olla?",
    "suggestion": {
      "ask_in_english": "Ma ei leia kahjuks vastust Sinu küsimusele. Kas sa sooviksid selle küsimuse Inglise keeles esitada?",
      "text_for_english": "Ma ei leia kahjuks vastust Sinu küsimusele. Kas Sa sooviksid selle küsimuse andmebaasi lisada",
      "text_not_for_english": "Kas Sa sooviksid selle küsimuse andmebaasi lisada",
      "congrats": "Tore! Kas Sul on veel küsimusi?",
      "buttons": {
        "yes": "Jah",
        "no": "Ei"
      }
    }
  },
  "fi": {
    "greeting": "Hei! Kuinka voin auttaa ?",
    "suggestion": {
      "ask_in_english": "En löydä vastausta kysymykseesi. Haluatko tehdä saman kysymyksen uudelleen, mutta englanniksi?",
      "text_for_english": "En valitettavasti löydä vastausta kysymykseesi. Haluatko että tämä kysymys siirretään tietokantaani vastattavaksi ?",
      "text_not_for_english": "Haluatko että tämä kysymys siirretään tietokantaani vastattavaksi ?",
      "congrats": "Hienoa!, Onko sinulla lisää kysymyksiä ?",
      "buttons": {
        "yes": "Kyllä",
        "no": "Ei"
      }
    }
  },
  "it": {
    "greeting": "Ciao! Come posso aiutarti?",
    "suggestion": {
      "ask_in_english": "There is no answer defined for your question! Would you like to submit your question again in English?",
      "text_for_english": "Non trovo una risposta alla tua domanda. Vuoi che questa domanda venga inoltrata alla mia banca dati?",
      "text_not_for_english": "Vuoi che questa domanda venga inoltrata alla mia banca dati?",
      "congrats": "Ottimo! Hai altre domande?",
      "buttons": {
        "yes": "Sì",
        "no": "No"
      }
    }
  },
  "gr": {
    "greeting": "Γεια! Πώς μπορώ να βοηθήσω;",
    "suggestion": {
      "ask_in_english": "Δεν υπάρχει η απάντηση για την ερώτησή σας! Θα θέλατε να υποβάλετε ξανά την ερώτησή σας στα Αγγλικά;",
      "text_for_english": "Δεν μπορώ να βρω απάντηση στην ερώτησή σας. Θα θέλατε να προσθέσετε αυτήν την ερώτηση στη βάση δεδομένων των ερωτήσεων;",
      "text_not_for_english": "Θα θέλατε να προσθέσετε αυτήν την ερώτηση στη βάση δεδομένων των ερωτήσεων;",
      "congrats": "Ωραία! Έχεις περαιτέρω απορίες;",
      "buttons": {
        "yes": "Ναι",
        "no": "Οχι"
      }
    }
  }
}
</i18n>
