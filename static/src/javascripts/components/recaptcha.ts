//TODO: Remove or keep this file
// Don't forget to install the dependancies
// npm i -D recaptcha-v3

import { load, getInstance, ReCaptchaInstance } from 'recaptcha-v3';

/**
 * The client api key for recaptcha v3
 */
const websiteKey = '6LeBcNEUAAAAAAg1I2N0UhBT1ZAdkhq2CpweRmih'; //local
// const websiteKey = '';

/**
 * Init recaptcha
 * The badge is hidden by default, don't forget to add Google conditions
 *
 * @see https://developers.google.com/recaptcha/docs/v3
 * @see https://developers.google.com/recaptcha/docs/faq#id-like-to-hide-the-recaptcha-v3-badge-what-is-allowed
 * @returns {Promise} A recaptcha promise when it is ready
 */
export const initRecaptcha = (): Promise<ReCaptchaInstance> => {
  return load(websiteKey, { autoHideBadge: true });
};

/**
 * Execute Recaptcha
 *
 * @param {string} action The name of the action
 * @see https://developers.google.com/recaptcha/docs/v3#actions
 * @returns {Promise} A promise with the tokem associated with the action
 */
export const executeRecaptcha = (action: string): Promise<string> => {
  return getInstance().execute(action);
};
