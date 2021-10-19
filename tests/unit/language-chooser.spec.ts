import { expect } from "chai";
import {
  shallowMount,
  createLocalVue,
  createWrapper,
  mount,
  Wrapper
} from "@vue/test-utils";
import LanguageChooser from "@/components/LanguageChooser.vue";
import { DropdownPlugin } from "bootstrap-vue";
import { BDropdown } from "bootstrap-vue";
import { BDropdownItem } from "bootstrap-vue";

const locales = ["en", "et", "fi", "el", "it"];

function createLanguageChooserWrapper(
  shallow = false
): Wrapper<LanguageChooser> {
  const localVue = createLocalVue();
  localVue.use(DropdownPlugin);
  const $i18n = {
    locale: "en"
  };
  const $t = (key: string) => {
    return key;
  };

  const cb = shallow ? shallowMount : mount;

  return cb(LanguageChooser, {
    localVue,
    mocks: {
      $i18n,
      $t
    },
    propsData: { locales }
  });
}

describe("LanguageChooser.vue", () => {
  it("renders LanguageChooser and checks internal behaviour", () => {
    const wrapper = createLanguageChooserWrapper(true);

    expect(wrapper.props().locales).to.eq(locales);
    expect(wrapper.vm.$i18n.locale).to.eq("en");
    expect(wrapper.vm.$root.$i18n.locale).to.eq("en");
    expect(wrapper.vm.language).to.eq("languages.en");

    expect(wrapper.contains(BDropdown)).to.eq(true);
    expect(wrapper.findAll(BDropdownItem).length).to.eq(5);
    expect(wrapper.text()).to.include(
      "languages.en  languages.et  languages.fi  languages.el  languages.it"
    );

    wrapper.vm.onChangeLocale("et");
    expect(wrapper.vm.$i18n.locale).to.eq("et");
    expect(wrapper.vm.$root.$i18n.locale).to.eq("et");
    expect(wrapper.vm.language).to.eq("languages.et");

    const rootWrapper = createWrapper(wrapper.vm.$root);
    expect(rootWrapper.emitted("localeChanged")).to.exist;
    expect(rootWrapper.emitted().localeChanged.length).to.eq(1);
    expect(rootWrapper.emitted().localeChanged[0]).to.eql(["et"]);

    wrapper.destroy();
    rootWrapper.destroy();
  });

  it("renders language chooser and checks user behaviour", async () => {
    const wrapper = createLanguageChooserWrapper(false);
    const rootWrapper = createWrapper(wrapper.vm.$root);

    const elements = wrapper.findAll("ul > li > a");

    elements.at(1).trigger("click");
    await rootWrapper.vm.$nextTick();
    expect(wrapper.vm.$i18n.locale).to.eq("et");
    expect(wrapper.vm.$root.$i18n.locale).to.eq("et");
    expect(wrapper.vm.language).to.eq("languages.et");
    expect(rootWrapper.emitted().localeChanged.length).to.eq(1);
    expect(rootWrapper.emitted().localeChanged[0]).to.eql(["et"]);

    elements.at(0).trigger("click");
    await rootWrapper.vm.$nextTick();
    expect(wrapper.vm.$i18n.locale).to.eq("en");
    expect(wrapper.vm.$root.$i18n.locale).to.eq("en");
    expect(wrapper.vm.language).to.eq("languages.en");
    expect(rootWrapper.emitted().localeChanged.length).to.eq(2);
    expect(rootWrapper.emitted().localeChanged[1]).to.eql(["en"]);

    wrapper.destroy();
    rootWrapper.destroy();
  });
});
