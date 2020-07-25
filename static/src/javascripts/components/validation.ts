import { Validation } from '@classes/validation';

//TODO: Choose the right validation system for your setup

// For static / wordpress
const validationMessages = {
  validation_error_field_is_empty: 'Ce champs est requis',
  validation_error_field_has_invalid_email: 'Email non valide',
};

/**
 * Init validations on form elements
 *
 * @param  {string} [selector=.js-validation] The form selector
 */
export const initValidations = (selector = '.js-validation'): void => {
  const validation = new Validation(validationMessages);
  const forms: NodeListOf<HTMLFormElement> = document.querySelectorAll(selector);
  forms.forEach((form) => {
    validation.init(form);
  });
};

// // For express
// /**
//  * Init validations on form elements
//  *
//  * @param  {string} [selector=.js-validation] The form selector
//  * @param {string[]} [locales=['fr_CA', 'en_CA']] Locales code
//  */
// export const initValidations = (
//   selector = '.js-validation',
//   locales = ['fr_CA', 'en_CA']
// ): void => {
//   locales.forEach((locale) => {
//     import(
//       /* webpackChunkName: 'json_translation_strings' */
//       `app/locales/${locale}.json`
//     ).then(({ default: catalog }) => {
//       const messages = Object.keys(catalog)
//         .filter((key) => key.startsWith('validation_error_'))
//         .reduce((obj, key) => {
//           obj[key] = catalog[key];
//           return obj;
//         }, {});

//       const currentLocale = document.documentElement.lang;

//       if (locale.replace('_', '-') === currentLocale) {
//         const validation = new Validation(messages);
//         const forms: NodeListOf<HTMLFormElement> = document.querySelectorAll(selector);
//         forms.forEach((form) => {
//           validation.init(form);
//         });
//       }
//     });
//   });
// };
