<template>
  <div id="app">
    <chat-bot :locales="locales" />
    <div class="container">
      <a href="https://sherpa4selfie.eu/" target="_blank">
        <img
          alt="SHERPA4SELFIE logo"
          src="./assets/cropped-logo-large.jpg"
          class="mx-auto d-block img-fluid"
        />
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import ChatBot from "./components/ChatBot.vue";

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "@fortawesome/fontawesome-free/css/all.css";

@Component({
  components: {
    ChatBot
  }
})
export default class App extends Vue {
  locales = ["en", "et", "fi", "el", "it"];

  created() {
    let localeSet = false;
    try {
      if (window.localStorage.currentLocale) {
        this.$root.$i18n.locale = window.localStorage.currentLocale;
        localeSet = true;
      }
    } catch (e) {
      window.console.error(e);
    }

    if (!localeSet) {
      let languages = window.navigator.languages.map(language => {
        language = language.toLowerCase();

        return language.includes("-") ? language.split("-", 1)[0] : language;
      });
      languages = [...new Set(languages)];
      const intersection = languages.filter(language =>
        this.locales.includes(language)
      );

      if (intersection.length > 0) {
        this.$root.$i18n.locale = intersection[0];
      }
    }

    this.$root.$on("localeChanged", (locale: string) => {
      try {
        window.localStorage.currentLocale = locale;
      } catch (e) {
        window.console.error(e);
      }
    });
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

@media (min-width: 992px) {
  #app {
    margin-top: 60px;
  }
}

@media (max-width: 575.98px) {
  #app {
    & > .container {
      margin-top: 0 !important;
    }
  }
}
</style>
