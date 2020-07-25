import { AjaxPayload, AjaxPayloadForm } from './../typings';

interface HTMLInputElementIE extends HTMLInputElement {
  createTextRange: () => IHTMLTxtRange;
}

interface IHTMLTxtRange extends Range {
  select: () => number;
}

/**
 * Update is active navigation
 *
 * @param {string} selector The selector of elements
 * @param {AjaxPayload} data The ajax payload
 */
export const updateIsActive = (selector: string, data: AjaxPayload): void => {
  const path = data.path;
  const navPrimaryListSelector = selector ? selector : '.js-ajax-update-is-active';
  const lists = document.querySelectorAll(navPrimaryListSelector);

  if (!lists || !path) {
    return;
  }

  lists.forEach((list) => {
    const listItems = list.querySelectorAll('li');
    if (listItems) {
      listItems.forEach((item) => {
        const link = item.querySelector('a');

        if (link && link.getAttribute('href').includes(path)) {
          link.classList.add('is-active');
        } else {
          link.classList.remove('is-active');
        }
      });
    }
  });
};

/**
 * Update title tag
 *
 * @param {AjaxPayload} data The ajax payload
 */
export const updateTitleTag = (data: AjaxPayload): void => {
  const titleElement = document.getElementsByTagName('title')[0];

  if (titleElement) {
    titleElement.innerHTML = decodeURI(data.titleTag);
  } else {
    document.title = decodeURI(data.titleTag);
  }
};

/**
 * Update lang link
 *
 * @param {AjaxPayload} data The ajax payload
 */
export const updateLangLink = (data: AjaxPayload): void => {
  const linkLangs: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('.js-lang');
  document.documentElement.lang = data.currentLang;

  linkLangs.forEach((link) => {
    link.href = data.switchUrl;
  });
};

/**
 * Handle form response
 *
 * @param {AjaxPayloadForm} data - Payload from ajax call
 */
export const handleFormResponse = (data: AjaxPayloadForm): void => {
  const form: HTMLFormElement | null =
    data.containerIds && data.containerIds.form
      ? (document.getElementById(data.containerIds.form) as HTMLFormElement)
      : null;

  if (!form) return;

  const formMessage: HTMLElement =
    data.containerIds && data.containerIds.formMessage
      ? document.getElementById(data.containerIds.formMessage)
      : null;
  const formErrorMessage: HTMLElement =
    data.containerIds && data.containerIds.formErrorMessage
      ? document.getElementById(data.containerIds.formErrorMessage)
      : null;

  if (data.contactFormEmailSent && data.successMessage && formMessage) {
    formMessage.classList.add('is-success');
    formMessage.innerHTML = data.successMessage;

    //reset form
    const inputs: NodeListOf<HTMLInputElement | HTMLTextAreaElement> = form.querySelectorAll(
      'input:not([type=checkbox]):not([type=radio]),textarea'
    );
    inputs.forEach((input) => {
      input.value = '';
    });

    form.reset();
    form.classList.add('is-hidden');
  } else if (!data.contactFormEmailSent && data.errorMessage && formErrorMessage) {
    formErrorMessage.classList.add('is-error');
    formErrorMessage.innerHTML = data.errorMessage;
  }
};

/**
 * Update body class
 *
 * @param {AjaxPayload} data The ajax payload
 */
export const updateBodyClass = (data: AjaxPayload): void => {
  const bodyClassPrefix = 'route-';

  document.body.classList.forEach((val) => {
    if (val.startsWith(bodyClassPrefix)) {
      document.body.classList.remove(val);
      document.body.classList.add(`${bodyClassPrefix}${data.route}`);
    }
  });
};

/**
 * Focus on input
 *
 * @param {string} id The id of the element
 */
export const focusOnInput = (id: string): void => {
  const el = document.getElementById(id) as HTMLInputElementIE;

  if (el) {
    el.focus();

    if (typeof el.selectionStart == 'number') {
      el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != 'undefined') {
      const range = el.createTextRange();
      range.collapse(false);
      range.select();
    }
  }
};
