/** @type {import("stylelint").Config} */
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-standard-scss'],
  plugins: [
    './packages/common-utils/scripts/stylelint-plugin-css-vars/plugin.js',
  ],
  rules: {
    'css-vars/valid-css-vars': true,
    'custom-property-pattern': null,
    'selector-class-pattern': null,
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
        ],
      },
    ],
  },
};
