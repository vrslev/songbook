require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-typescript/recommended",
    "./.eslintrc-auto-import.json",
  ],
  env: {
    "vue/setup-compiler-macros": true,
    node: true,
  },
  rules: {
    "@typescript-eslint/ban-ts-comment": "off",
    "vue/multi-word-component-names": "off",
    "@intlify/vue-i18n/no-missing-keys": "off",
  },
};
