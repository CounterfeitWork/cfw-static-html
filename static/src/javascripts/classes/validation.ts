// Don't forget to install the following dependancies
// "awesome-phonenumber": "^2.20.0"
// "validator": "^11.1.0"
// npm i -D validator @types/validator

interface InputElements {
  inputGroup: Element;
  input: HTMLInputElement;
  inputErrors: Element;
}

interface Filter {
  message: string;
  function: string;
  functionError: boolean;
  param?: any;
}

/**
 * Validation system
 *
 * @class Validation
 */
export class Validation {
  messages: Record<string, string>;
  keyValidationErrorField: string;
  inputSelector: string;
  inputGroupError: { class: string; selector: string };
  inputErrors: { class: string; selector: string };
  filters: Record<string, Filter>;
  countryCode: string;

  /**
   * Create a new validation system
   *
   * @param {object} messages A object with messages
   */
  constructor(messages: Record<string, string> = {}) {
    //Settings
    this.messages = messages;
    this.keyValidationErrorField = 'validation_error_field_';
    this.inputSelector = '[data-validation]:enabled';
    this.inputGroupError = {
      class: 'ui__input-group--error',
      selector: '.ui__input-group--error',
    };
    this.inputErrors = {
      class: 'ui__input-errors',
      selector: '.ui__input-errors',
    };

    //Filters
    this.filters = {
      isEmpty: {
        message: 'is_empty',
        function: 'isEmpty',
        functionError: true,
      },
      isChecked: {
        message: 'is_not_checked',
        function: 'isChecked',
        functionError: false,
      },
      hasInvalidName: {
        message: 'has_invalid_name',
        function: 'matches',
        // eslint-disable-next-line quotes
        param: "^[A-Za-zÀ-ÖØ-öø-ÿ-]+(?:['_.\\s][A-Za-zÀ-ÖØ-öø-ÿ]+)*$",
        functionError: false,
      },
      hasInvalidEmail: {
        message: 'has_invalid_email',
        function: 'isEmail',
        functionError: false,
      },
      hasInvalidPhoneNumber: {
        message: 'has_invalid_phone_number',
        function: 'isMobilePhone',
        param: ['en-CA'],
        functionError: false,
      },
      hasInvalidLength: {
        message: 'has_invalid_length',
        function: 'isLength',
        param: {
          min: 50,
          max: 5000,
        },
        functionError: false,
      },
      isURL: {
        message: 'has_invalid_url',
        function: 'isURL',
        functionError: false,
      },
    };

    /**
     * A 2-character ISO 3166-1 region codes
     *
     * @see https://github.com/grantila/awesome-phonenumber#country-codes
     * @param {string} countryCode The country code
     */
    this.countryCode = 'CA';
  }

  /**
   * Init validation form
   * Emit a 'submitValid' event on success
   *
   * @param  {HTMLFormElement} form The form element
   */
  init(form: HTMLFormElement): void {
    if (!form) return;
    form.addEventListener('submit', (e) => {
      this.initEvent(e, form);
    });
  }
  /**
   * Init validation form on event
   *
   * @param  {Event} e The event
   * @param  {Element} form The form element
   */
  initEvent(e: Event, form: HTMLFormElement): void {
    e.preventDefault();
    this.destroy(form);
    let hasError = false;
    const inputs: NodeListOf<HTMLInputElement> = form.querySelectorAll(this.inputSelector);
    const btn: HTMLInputElement = form.querySelector('[type=submit]');
    btn.blur();

    inputs.forEach((input) => {
      this.clearInput(input);
    });

    this.clearInputsErrorsOnChange(inputs);

    this.checkInputs(inputs).then((result) => {
      result.forEach((validation) => {
        const input = validation.input;
        const checks = validation.checks;

        checks.forEach((check) => {
          this.setMessage(check, input);
          hasError = true;
        });
      });

      if (!hasError) {
        const submitValid = new CustomEvent('submitValid');
        form.dispatchEvent(submitValid);
      }
    });
  }

  /**
   * Clear inputs errors on change
   *
   * @param  {HTMLInputElement[]} inputs A list of inputs
   */
  clearInputsErrorsOnChange(inputs: NodeListOf<HTMLInputElement>): void {
    inputs.forEach((input) => {
      const eventType = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(eventType, () => {
        this.clearInputEvent(input);
      });
    });
  }

  /**
   * Clear input on event
   *
   * @param {HTMLInputElement} input A input element
   */
  clearInputEvent(input: HTMLInputElement): void {
    const inputElements = this.getElementsByInput(input);
    if (inputElements.inputErrors.children.length === 0) return;

    this.checkInputs([input]).then((result) => {
      this.clearInput(result[0].input, result[0].checks);
    });
  }

  /**
   * Clear input error
   *
   * @param {HTMLInputElement} input The input element
   * @param {Array} [keepErrors] An array of error need to be keep
   */
  clearInput(input: HTMLInputElement, keepErrors: string[] = []): void {
    const inputElements = this.getElementsByInput(input);

    if (keepErrors && keepErrors.length > 0) {
      const inputErrorsChildren = Array.from(inputElements.inputErrors.children) as HTMLElement[];

      for (let i = 0; i < inputErrorsChildren.length; i++) {
        const item = inputErrorsChildren[i];
        if (!keepErrors.includes(item.dataset.filter)) {
          item.remove();
        }
      }

      if (inputElements.inputErrors.children.length === 0) {
        inputElements.inputGroup.classList.remove(this.inputGroupError.class);
      }
    } else {
      inputElements.inputErrors.innerHTML = '';
      inputElements.inputGroup.classList.remove(this.inputGroupError.class);
    }
  }

  /**
   * Get elements (group, list of errors) in a single object
   *
   * @param  {HTMLInputElement} input an input element
   * @returns {object} inputsElements
   */
  getElementsByInput(input: HTMLInputElement): InputElements {
    const inputGroupEl = input.parentNode;
    const inputErrorsEl = inputGroupEl.querySelector(this.inputErrors.selector);

    return {
      inputGroup: inputGroupEl as Element,
      input,
      inputErrors: inputErrorsEl,
    };
  }

  /**
   * Create and set the error message
   *
   * @param {string} filterKey the filter key
   * @param {HTMLInputElement} input Input element
   */
  setMessage(filterKey: string, input: HTMLInputElement): void {
    if (!Object.prototype.hasOwnProperty.call(this.filters, filterKey)) return;
    const filter = this.filters[filterKey];
    const messageKey = this.keyValidationErrorField + filter.message;

    if (!Object.prototype.hasOwnProperty.call(this.messages, messageKey)) {
      console.error('No message available for ' + messageKey);
      return;
    }

    const message = this.messages[messageKey];
    const inputElements = this.getElementsByInput(input);

    //create list item element
    const messageEl = document.createElement('li');
    messageEl.setAttribute('data-filter', filterKey);
    messageEl.textContent = message;

    inputElements.inputErrors.append(messageEl);
    inputElements.inputGroup.classList.add(this.inputGroupError.class);
  }

  /**
   * Checks given inputs
   *
   * @param {HTMLInputElement[] | [HTMLInputElement]} inputs The inputs elements
   * @returns {Promise} Promise with an array of input and checks
   */
  checkInputs(
    inputs: NodeListOf<HTMLInputElement> | [HTMLInputElement]
  ): Promise<
    {
      input: HTMLInputElement;
      checks: string[];
    }[]
  > {
    const checks = Array.from(inputs).map(async (input) => {
      const inputFilters = input.dataset.validation.replace(/\s+/g, '').split(',');
      return {
        input,
        checks: (await Promise.all(
          inputFilters.map((filter) => {
            return this.check(input, filter);
          })
        ).then((result) => result.filter((check) => check !== false))) as string[],
      };
    });

    return Promise.all(checks);
  }

  /**
   * Check the input with the given filter
   *
   * @param {HTMLInputElement} input An input element
   * @param {string} filterKey The key of the filter
   * @returns {(boolean|string)} Return the key of the filter if error else false
   */
  async check(input: HTMLInputElement, filterKey: string): Promise<string | false> {
    if (!Object.prototype.hasOwnProperty.call(this.filters, filterKey)) return false;

    const filter = this.filters[filterKey];
    let value = input.value;
    let validation: boolean;

    if (filter.function === 'isMobilePhone') {
      value = await this.checkPhoneNumber(input.value);
    }

    if (filter.function === 'isChecked') {
      validation = input.checked;
    } else {
      validation = await this.validator(value, filter);
    }

    if (!filter.functionError) {
      validation = !validation;
    }

    return validation === true ? filterKey : false;
  }

  /**
   * Validator function
   *
   * @see https://github.com/validatorjs/validator.js
   * @param {(string|number)} value The value of the input
   * @param {object} filter The filter to use
   * @returns {boolean} Return validation result
   */
  validator(value: string | number, filter: Filter): Promise<boolean> {
    return new Promise((resolve) => {
      import(/* webpackChunkName: "validator" */ 'validator').then((validator) => {
        let validation: boolean;
        if (value || (!value && filter.function === 'isEmpty')) {
          if (filter.param && filter.function === 'matches') {
            validation = validator[filter.function](value, filter.param, 'i');
          } else if (filter.param) {
            validation = validator[filter.function](value, filter.param);
          } else {
            validation = validator[filter.function](value);
          }
        } else {
          validation = true;
        }
        resolve(validation);
      });
    });
  }

  /**
   * Format the phone number to check is readable
   *
   * @see https://github.com/grantila/awesome-phonenumber
   * @param {string} value A phone number
   * @returns {Promise<string>} The value formated on success or the value given on failed
   */
  checkPhoneNumber(value: string): Promise<string> {
    return new Promise((resolve) => {
      import(/* webpackChunkName: "awesome-phonenumber" */ 'awesome-phonenumber').then(
        ({ default: PhoneNumber }) => {
          const pn = new PhoneNumber(value, this.countryCode);
          const phoneNumber = pn.getNumber('significant');
          value = phoneNumber ? phoneNumber : value;
          resolve(value);
        }
      );
    });
  }

  /**
   * Destroy validation form
   * Remove linked events
   *
   * @param  {HTMLFormElement} form The form element
   */
  destroy(form: HTMLFormElement): void {
    if (!form) return;

    form.removeEventListener('submit', (e) => {
      this.initEvent(e, form);
    });
    const inputs: NodeListOf<HTMLInputElement> = form.querySelectorAll(this.inputSelector);

    inputs.forEach((input) => {
      const eventType = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(eventType, () => {
        this.clearInputEvent(input);
      });
    });
  }
}
