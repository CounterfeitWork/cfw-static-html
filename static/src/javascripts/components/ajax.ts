import config from '@config/ajax.config.js';
import { AjaxPayload, ContainerIds, AjaxDirection, AjaxJsonData } from './../typings';

interface AjaxCallArgs {
  url?: string;
  callback?: string;
  action?: AjaxActions;
  containerIds?: ContainerIds;
  transition?: boolean;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT' | 'HEAD';
  body?: BodyInit | null;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  submitBtn?: Element;
}

type AjaxActions = 'replace' | 'prepend' | 'append' | '';

interface HTMLSelectElementSlim extends HTMLSelectElement {
  slim: any;
}

let isUpdating = false;

// TODO: replace bellow w/ import statements if needed, or remove this TODO
const toggleSubmitButtonStyle = null;
const startAjaxTransition: () => void = null;
const stopAjaxTransition: () => void = null;
const useRecaptcha = false;
// the name of the action and the class selector
const recaptchaActions = {
  apply_form: 'js-apply-form',
  sales_inquiry: 'js-sales-form',
  job_offers: 'js-job-offers-form',
};

// TODO: keep or remove bellow
// disable history scroll restoration
// if ('scrollRestoration' in history) {
//   history.scrollRestoration = 'manual';
// }

/**
 * Exectute callback
 *
 * @param {Array} directives The directives
 * @param {AjaxPayload} payload the payload
 * @param {string} [direction] the direction
 */
function executeCallback(directives: any[], payload: AjaxPayload, direction: AjaxDirection): void {
  if (!Array.isArray(directives)) {
    return;
  }

  directives.forEach((func) => {
    const args = [];

    func.args.forEach(function (arg: any) {
      if (Number.isInteger(arg)) {
        args.push(arguments[arg]);
      } else if (arg === 'payload') {
        args.push(payload);
      } else if (arg === 'direction') {
        args.push(direction);
      } else {
        args.push(arg);
      }
    });

    import(/* webpackChunkName: '[request]' */ `src/javascripts/${func.path}`).then((obj) => {
      if (func.callback) {
        const funcWithCallback = new Promise((resolve) => {
          resolve(obj[func.name](...args));
        });

        funcWithCallback.then(() => {
          executeCallback(func.callback, payload, direction);
        });
      } else {
        obj[func.name](...args);
      }
    });
  });
}

/**
 * Ajax call
 *
 * @param {object} args arguments
 * @returns {(Promise<boolean>| Promise<AjaxPayload>)} A promise
 */
export const ajaxCall = async function ajaxCall(
  args: AjaxCallArgs
): Promise<boolean | AjaxPayload> {
  const options = Object.assign(
    {
      url: '',
      callback: '',
      action: '',
      containerIds: null,
      transition: false,
      method: 'GET',
      body: null,
      headers: {},
      credentials: 'same-origin',
      submitBtn: null,
    },
    args
  );
  const containerIds = options.containerIds || getDefaultContainerIds(options.action);
  const reqUrl = new URL(options.url);
  const transitionDuration = parseInt(document.body.dataset.transitionDuration);
  const hasSubmitBtn = options.submitBtn && options.submitBtn.nodeName;
  let startTime: number;
  let endTime: number;
  let elapsedTime: number;
  let waitTime: number;
  let directives;

  const headers = Object.assign(
    {
      Accept: 'application/json',
      'Principal-Callback': options.callback,
    },
    options.headers
  );

  // make sure cache isn't served
  reqUrl.searchParams.set('_ts', Date.now().toString());

  const reqOpts: RequestInit = {
    headers: headers,
    method: options.method.toUpperCase(),
    credentials: options.credentials as RequestCredentials,
  };

  if (options.body && reqOpts.method !== 'GET' && reqOpts.method !== 'HEAD') {
    reqOpts.body = options.body;
  }

  const req = new Request(reqUrl.href, reqOpts);

  showLoader();
  takeOverContainers('disable', containerIds);

  if (hasSubmitBtn && toggleSubmitButtonStyle) {
    toggleSubmitButtonStyle(options.submitBtn);
  }

  if (options.transition) {
    startAjaxTransition();
  }

  if (options.transition || hasSubmitBtn) {
    startTime = performance.now();
  }

  takeOverContainers('disable', containerIds);

  const res = await fetch(req)
    .then((res) => res.json())
    .then((payload) => {
      endTime = performance.now();
      elapsedTime = endTime - startTime;
      waitTime = transitionDuration - elapsedTime;

      if (typeof payload !== 'boolean') {
        payload.containerIds = containerIds;
      }

      // setup callback
      if (typeof payload !== 'boolean' && config.routes[payload.route]) {
        directives = config.routes[payload.route].callback[options.callback];
      }

      if (!directives && typeof payload !== 'boolean') {
        console.error(
          `No callback defined for ${payload.route} route in 'src/config/ajax.config.js'`
        );
      }

      setTimeout(() => {
        executeCallback(directives, payload, options.action as AjaxDirection);
        hideLoader();

        if (options.submitBtn && options.submitBtn.nodeName && toggleSubmitButtonStyle) {
          toggleSubmitButtonStyle(options.submitBtn);
        }

        if (options.transition) {
          stopAjaxTransition();
        }

        takeOverContainers('enable', containerIds);
        isUpdating = false;
      }, waitTime);

      return payload;
    })
    .catch((error) => {
      if (!config.goToUrlOnError || options.method !== 'GET') {
        hideLoader();
        takeOverContainers('enable', containerIds);
        isUpdating = false;
        console.error(error);

        return false;
      } else if (options.method === 'GET') {
        window.location.href = options.url;
      }
    });

  return res;
};

/**
 * Show loader
 */
function showLoader(): void {
  if (!document.body.classList.contains('is-waiting')) {
    document.body.classList.add('is-waiting');
  }
}

/**
 * Hide loader
 */
function hideLoader(): void {
  if (document.body.classList.contains('is-waiting')) {
    document.body.classList.remove('is-waiting');
  }
}

/**
 * Insert paginated content HTML
 *
 * @param {object} jsonData JSON Data return by the API (see AjaxJsonData)
 * @param {object} action The action (see AjaxActions)
 * @param {boolean} [updateUrl] Update the url
 * @param {object} [containerIds] The ids of the container (see ContainerIds)
 */
export const insertPagedContentHtml = (
  jsonData: AjaxJsonData,
  action: AjaxActions,
  updateUrl = false,
  containerIds: ContainerIds
): void => {
  containerIds = containerIds || getDefaultContainerIds(action);
  const contentContainer = document.getElementById(containerIds.pagedContent);
  let spies: NodeListOf<HTMLElement>;

  if (contentContainer) {
    if (action === 'replace') {
      contentContainer.innerHTML = jsonData.pagedContentHtml;
    } else if (action === 'prepend') {
      contentContainer.innerHTML = jsonData.pagedContentHtml + contentContainer.innerHTML;
    } else if (action === 'append') {
      contentContainer.innerHTML += jsonData.pagedContentHtml;
    }

    spies = document.querySelectorAll('[data-page]');

    if (spies) {
      changePageParamOnIntersection(spies);
    }
  }

  replaceLoadMoreContent(
    jsonData.loadMorePrevHtml,
    jsonData.hasPrevPage,
    'prev',
    action,
    containerIds.loadMorePrev,
    null,
    updateUrl
  );
  replaceLoadMoreContent(
    jsonData.loadMoreNextHtml,
    jsonData.hasNextPage,
    'next',
    action,
    containerIds.loadMoreNext,
    null,
    updateUrl
  );
  replacePaginationContent(jsonData.paginationHtml, containerIds.pagination);
};

/**
 * Insert main content HTML
 *
 * @param {AjaxJsonData} jsonData JSON Data return by the API (see AjaxJsonData)
 * @param {ContainerIds} [containerIds] The ids of the container (see ContainerIds)
 */
export const insertMainContentHtml = (jsonData: AjaxJsonData, containerIds: ContainerIds): void => {
  containerIds = containerIds || getDefaultContainerIds();
  const contentContainer = document.getElementById(containerIds.mainContent);

  if (contentContainer && jsonData.mainContentHtml) {
    contentContainer.innerHTML = jsonData.mainContentHtml;
  }
};

/**
 * Get default container IDs
 *
 * @param {object} [action] The action (see AjaxActions)
 * @returns {object} [containerIds] The ids of the container (see ContainerIds)
 */
function getDefaultContainerIds(action?: AjaxActions): ContainerIds {
  return {
    pagedContent:
      action === 'prepend' || action === 'append'
        ? 'ajax-paged-content-inner'
        : 'ajax-paged-content-container',
    loadMorePrev: 'ajax-load-more-prev-container',
    loadMoreNext: 'ajax-load-more-next-container',
    pagination: 'ajax-pagination-container',
    mainContent: 'main',
    form: 'form',
    formMessage: 'form-message',
  };
}

/**
 * Take over containers
 *
 * @param {('disable' | 'enable')} action The action
 * @param {ContainerIds} containerIds The ids of the container
 * @param {string} [cssClass] A css class
 */
function takeOverContainers(
  action: 'disable' | 'enable',
  containerIds: ContainerIds,
  cssClass?: string
): void {
  cssClass = cssClass || 'is-loading-container';
  let el: HTMLElement;

  for (const key in containerIds) {
    if (containerIds[key]) {
      el = document.getElementById(containerIds[key]);

      if (el) {
        if (action === 'disable') {
          el.classList.add(cssClass);
        } else if (action === 'enable') {
          el.classList.remove(cssClass);
        }
      }
    }
  }
}

/**
 * Replace load more content
 *
 * @param {string} html The HTML
 * @param {boolean} showHtml Show html
 * @param {AjaxDirection} direction The direction (see AjaxDirection)
 * @param {string} action The name of the action (see AjaxActions)
 * @param {string} [containerId] The container id
 * @param {string} [btnsSelector] the btn selector
 * @param {boolean} [updateUrl] Update url or not
 */
function replaceLoadMoreContent(
  html: string,
  showHtml: boolean,
  direction: AjaxDirection,
  action: string,
  containerId?: string,
  btnsSelector?: string,
  updateUrl?: boolean
): void {
  btnsSelector = btnsSelector || 'a[class*=js-ajax-loadmore]';
  const msgsSelector = '.js-ajax-tmp-msg';
  const avoidAction = direction === 'prev' ? 'append' : 'prepend';
  let container: HTMLElement;
  let btns: NodeListOf<HTMLElement>;
  let msgs: NodeListOf<HTMLElement>;

  if (html && action !== avoidAction) {
    if (!containerId) {
      containerId = `ajax-load-more-${direction}-container`;
    }

    container = document.getElementById(containerId);

    if (container) {
      if (action !== 'replace' || showHtml) {
        container.innerHTML = html;
        btns = container.querySelectorAll(btnsSelector);
        msgs = container.querySelectorAll(msgsSelector);

        handleLoadMoreOnClick(btns, updateUrl);

        // remove temp messages
        msgs.forEach((el) => {
          setTimeout(() => {
            el.classList.add('is-transparent');
          }, 3000);
        });
      } else {
        container.innerHTML = '';
      }
    }
  }
}

/**
 * Replace pagination content
 *
 * @param {string} html The html
 * @param {string} containerId The container id
 * @param {string} [btnsSelector] the btn selector
 */
function replacePaginationContent(html: string, containerId: string, btnsSelector?: string): void {
  btnsSelector = btnsSelector || 'a[class*=js-ajax-pagination]';
  let container: HTMLElement;
  let btns: NodeListOf<HTMLElement>;

  if (html) {
    if (!containerId) {
      containerId = getDefaultContainerIds().pagination;
    }

    container = document.getElementById(containerId);

    if (container) {
      container.innerHTML = html;
      btns = container.querySelectorAll(btnsSelector);

      handlePaginationOnClick(btns);
    }
  }
}

/**
 * Reset filters
 *
 * @param {HTMLElement} filters The filters container
 * @returns {boolean} Return true of success, false if no fields found
 */
function resetFilters(filters: HTMLElement): boolean {
  if (!require.resolve('slim-select')) return false;

  const fields: NodeListOf<HTMLSelectElementSlim> = filters.querySelectorAll(
    'select.js-ajax-filters-field'
  );

  if (!fields.length) {
    return false;
  }

  fields.forEach((el) => {
    if (el.selectedIndex && el.selectedIndex > 0) {
      el.options[el.selectedIndex].removeAttribute('selected');
      el.selectedIndex = -1;

      if (el.slim) {
        el.slim.set('0');
      }

      removeURLParameter('flt');
    }
  });

  return true;
}

/**
 * Handle filters
 *
 * @param {HTMLElement} filters The filters container
 * @returns {Promise<boolean>} Return true of success, false if no fields found
 */
async function handleFilters(filters: HTMLElement): Promise<boolean> {
  const fields: NodeListOf<HTMLSelectElement> = filters.querySelectorAll(
    'select.js-ajax-filters-field'
  );
  const resourceType = filters.dataset.resourceType;
  const filterObj = {};
  let filterStr: string;
  let resourcesUrl: URL;

  if (!fields.length) {
    return false;
  }

  fields.forEach((el) => {
    const fieldKey =
      el.selectedIndex && el.selectedIndex > 0
        ? el.options[el.selectedIndex].dataset.fieldkey
        : null;

    if (fieldKey) {
      if (!filterObj[fieldKey]) {
        filterObj[fieldKey] = [];
      }

      filterObj[fieldKey].push(el.value);
    }
  });

  if (filterObj && Object.keys(filterObj).length > 0) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const parseFilters = require(/* webpackChunkName: 'parse-filters' */ '@helpers/parse-filters');
      filterStr = parseFilters(filterObj);
      resourcesUrl = addOrUpdateURLParameter('flt', filterStr);
    } catch (error) {
      console.log(error);
    }
  } else if (filterObj && Object.keys(filterObj).length === 0) {
    resourcesUrl = removeURLParameter('flt');
  }

  // reset paging
  resourcesUrl = removeURLParameter('p');

  if (!isUpdating) {
    isUpdating = true;

    resourcesUrl.searchParams.set('resource_type', resourceType);

    ajaxCall({
      url: resourcesUrl.toString(),
      callback: 'handleFilters',
      action: 'replace',
    });
  }

  return true;
}

/**
 * Handle load more
 *
 * @param {string} resourcesUrl The resources url
 * @param {object} action The action (see AjaxActions)
 * @param {boolean} [updateUrl=false] Update Url ?
 * @param {ContainerIds} [containerIds] The containers ids (see ContainerIds)
 */
function handleLoadMore(
  resourcesUrl: string,
  action: AjaxActions,
  updateUrl = false,
  containerIds?: ContainerIds
): void {
  containerIds = containerIds || getDefaultContainerIds(action);

  // Default container
  if (updateUrl) {
    changeStateForUrl(resourcesUrl);
  }

  if (!isUpdating) {
    isUpdating = true;

    ajaxCall({
      url: resourcesUrl,
      callback: 'handleLoadMore',
      action: action,
      containerIds: containerIds,
    });
  }
}

/**
 * Handle pagination
 *
 * @param {string} resourcesUrl The resources url
 * @param {ContainerIds} containerIds The container ids (see ContainerIds)
 */
function handlePagination(resourcesUrl: string, containerIds: ContainerIds): void {
  containerIds = containerIds || getDefaultContainerIds();

  // Default container
  if (containerIds.pagedContent === getDefaultContainerIds().pagedContent) {
    changeStateForUrl(resourcesUrl);
  }

  if (!isUpdating) {
    isUpdating = true;

    ajaxCall({
      url: resourcesUrl,
      callback: 'handlePagination',
      action: 'replace',
      containerIds: containerIds,
    });
  }
}

/**
 * Handle route change
 *
 * @param {string} routeUrl The route url
 * @param {ContainerIds} [containerIds] The container ids (see Container Ids)
 * @param {boolean} [skipStateChange=false] Skip state change
 */
export const handleRouteChange = function (
  routeUrl: string,
  containerIds?: ContainerIds,
  skipStateChange = false
): void {
  containerIds = containerIds || getDefaultContainerIds();

  if (containerIds.mainContent === getDefaultContainerIds().mainContent && !skipStateChange) {
    changeStateForUrl(routeUrl, 'push');
  }

  if (!isUpdating) {
    isUpdating = true;

    ajaxCall({
      url: routeUrl,
      callback: 'handleRouteChange',
      containerIds: containerIds,
      transition: true,
    });
  }
};

/**
 * Handles ajax form submission
 *
 * @param {HTMLFormElement} form Form DOM element
 * @param {(FormData | any)} _body Form body or null
 * @returns {Promise<boolean>} Return true on success, false on error
 */
async function handleForm(form: HTMLFormElement, _body: FormData | any = null): Promise<boolean> {
  if (!form.action || isUpdating) return false;

  const body = _body ? _body : new FormData(form);
  const searchParams = new URLSearchParams(body);
  const formUrl = new URL(form.action || window.location.href);

  if (form.method === 'get') {
    for (const pair of searchParams.entries()) {
      formUrl.searchParams.set(pair[0], pair[1]);
    }
  }

  isUpdating = true;
  const btn: HTMLInputElement = form.querySelector('[type=submit]');
  btn.blur();

  if (useRecaptcha) {
    const reCaptchaToken = await setRecaptcha(form);
    if (reCaptchaToken) {
      if (body.append) {
        body.append('reCAPTCHA', reCaptchaToken);
      } else {
        body.reCAPTCHA = reCaptchaToken;
      }
    }
  }

  ajaxCall({
    url: formUrl.toString(),
    method: form.method as AjaxCallArgs['method'],
    body: body,
    callback: 'handleForm',
    headers: {
      'CSRF-Token': _body ? body._csrf : body.get('_csrf'),
    },
    containerIds: {
      form: form.id,
      formMessage: form.dataset.messageContainerId,
      formErrorMessage: form.dataset.errorMessageContainerId,
    },
    submitBtn: btn,
  });

  return true;
}

/**
 * Set recaptcha (empty)
 *
 * @param {HTMLFormElement} form The form element
 * @returns {(Promise<string | boolean>)} Return false
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setRecaptcha(form: HTMLFormElement): Promise<string | boolean> {
  return new Promise((resolve) => resolve(false));
}

// /**
//  * Set recaptcha
//  *
//  * @param {HTMLFormElement} form The form
//  * @returns {Promise<string>} Return the recaptcha token
//  */
// function setRecaptcha(form: HTMLFormElement): Promise<string | boolean> {
//   // only letters and the characters "/" and "_" are allowed
//   let recaptchaAction = 'action';
//   for (const action in recaptchaActions) {
//     if (Object.prototype.hasOwnProperty.call(recaptchaActions, action)) {
//       const selector = recaptchaActions[action];

//       if (form.classList.contains(selector)) {
//         recaptchaAction = action;
//       }
//     }
//   }

//   return new Promise((resolve) => {
//     import(/* webpackChunkName: 'recaptcha' */ './recaptcha').then((obj) => {
//       obj
//         .executeRecaptcha(recaptchaAction)
//         .then((reCaptchaToken) => {
//           resolve(reCaptchaToken);
//         })
//         .catch((error: string) => {
//           isUpdating = false;
//           if (error) {
//             console.error(error);
//           } else {
//             console.error('Please supply a valid client API key for reCAPTCHA');
//           }
//         });
//     });
//   });
// }

/**
 * Change page on content intersection
 *
 * @param {Element[]} entries Entries
 */
function changePageParamOnIntersection(entries: NodeListOf<Element>): void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const target = entry.target as HTMLElement;
      if (entry.isIntersecting && target.dataset.page) {
        addOrUpdateURLParameter('p', target.dataset.page);
      }
    });
  });

  entries.forEach((entry) => {
    observer.observe(entry);
  });
}

/**
 * Remove param from window.location.href
 *
 * @param {string} param The url search param
 * @returns {URL} The URL cleaned
 */
function removeURLParameter(param: string): URL {
  const parsedUrl = new URL(window.location.href);

  parsedUrl.searchParams.delete(param);
  changeStateForUrl(parsedUrl);

  return parsedUrl;
}

/**
 * Add or update param in window.location.href
 *
 * @param {string} param The search param
 * @param {string} value The value
 * @returns {URL} The url
 */
function addOrUpdateURLParameter(param: string, value: string): URL {
  const parsedUrl = new URL(window.location.href);

  if (parsedUrl.searchParams.get(param) !== value) {
    parsedUrl.searchParams.set(param, value);
    changeStateForUrl(parsedUrl);
  }

  return parsedUrl;
}

/**
 * Change state for new URL
 *
 * @param {(URL | string)} urlObj The url
 * @param {string} [action] The action (see AjaxActions)
 */
export const changeStateForUrl = (urlObj: URL | string, action?: string): void => {
  urlObj = typeof urlObj === 'object' ? urlObj : new URL(urlObj);
  urlObj.searchParams.delete('_ts');
  urlObj.searchParams.delete('resource_type');
  action = action || 'replace';
  const state = {};

  urlObj.searchParams.forEach(function (val, key) {
    state[key] = val;
  });

  if (action === 'replace') {
    window.history.replaceState(state, '', urlObj.href);
  } else if (action === 'push') {
    window.history.pushState(state, '', urlObj.href);
  }
};

/**
 * On change handler to reset filters
 *
 * @param {string} btnSelector The btn selector
 * @param {string} filtersSelector The filters selector
 * @returns {(void | boolean)} Return false if btn doesn't exist
 */
export const resetFiltersOnClick = (
  btnSelector: string,
  filtersSelector: string
): void | boolean => {
  const btn = document.querySelector(btnSelector);

  if (!btn) return false;

  btn.addEventListener('click', (event) => {
    const el = event.target as HTMLElement;
    const filters: HTMLElement = el.closest(filtersSelector);
    resetFilters(filters);
  });
};

/**
 * Change handler for filters
 *
 * @param {string} dropdownsSelector Dropdowns selector
 * @param {string} filtersSelector Filters selector
 * @returns {(void | boolean)} Return false if dropdowns doesn't exist
 */
export const handleFiltersOnChange = (
  dropdownsSelector: string,
  filtersSelector: string
): void | boolean => {
  const dropdowns = document.querySelectorAll(dropdownsSelector);

  if (!dropdowns) return false;

  dropdowns.forEach((el) => {
    el.addEventListener('change', (event) => {
      const el = event.target as HTMLElement;
      const filters: HTMLElement = el.closest(filtersSelector);
      handleFilters(filters);
    });
  });
};

/**
 * Click handler for load more button
 *
 * @param {(string | Element[])} btnSelector The btn selector
 * @param {boolean} [updateUrl] update url ?
 * @returns {boolean} Return false on error, true on success
 */
export const handleLoadMoreOnClick = (
  btnSelector: string | NodeListOf<Element>,
  updateUrl = false
): boolean => {
  const btns =
    typeof btnSelector === 'string' ? document.querySelectorAll(btnSelector) : btnSelector;

  if (!btns) return false;

  btns.forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      const el = event.target as HTMLLinkElement;
      const action = el.dataset.action === 'prev' ? 'prepend' : 'append';
      let containerIds = getDefaultContainerIds(action);

      if (el.dataset.targetContentContainer) {
        containerIds = {
          pagedContent: el.dataset.targetContentContainer
            ? el.dataset.targetContentContainer
            : null,
          loadMorePrev: el.dataset.targetLoadMorePrevContainer
            ? el.dataset.targetLoadMorePrevContainer
            : null,
          loadMoreNext: el.dataset.targetLoadMoreNextContainer
            ? el.dataset.targetLoadMoreNextContainer
            : null,
        };
      }

      handleLoadMore(el.href, action, updateUrl, containerIds);
    });
  });

  return true;
};

/**
 * Click handler for pagination links
 *
 * @param {(string | Element[])} linkSelector The link selector, can be a string of a list of links
 * @returns {boolean}  Return false on error, true on success
 */
export const handlePaginationOnClick = (linkSelector: string | NodeListOf<Element>): boolean => {
  const btns =
    typeof linkSelector === 'string' ? document.querySelectorAll(linkSelector) : linkSelector;

  if (!btns) return false;

  btns.forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      const target = event.target as HTMLElement;
      const el = target.closest('a');
      let containerIds = getDefaultContainerIds();

      if (el.dataset.targetContentContainer) {
        containerIds = {
          pagedContent: el.dataset.targetContentContainer
            ? el.dataset.targetContentContainer
            : null,
          pagination: el.dataset.targetPaginationContainer
            ? el.dataset.targetPaginationContainer
            : null,
        };
      }

      handlePagination(el.href, containerIds);
    });
  });

  return true;
};

/**
 * Listener function for route change links
 *
 * @param {Event} event The event
 */
function routeChangelistener(event: Event): void {
  event.preventDefault();
  const target = event.target as HTMLElement;
  const el = target.closest('a');
  const skipStateChange = el.dataset.skipStateChange === '1';
  let containerIds = getDefaultContainerIds();

  if (el.dataset.targetContentContainer) {
    containerIds = {
      mainContent: el.dataset.targetContentContainer ? el.dataset.targetContentContainer : null,
    };
  }

  handleRouteChange(el.href, containerIds, skipStateChange);
}

/**
 * Listener function for route change links on Enter
 *
 * @param {KeyboardEvent} event The event
 */
function routeChangelistenerEnter(event: KeyboardEvent) {
  if (event.code === 'Enter' || event.keyCode === 13) {
    routeChangelistener(event);
  }
}

/**
 * Click handler for route change links
 *
 * @param {(string|Element[])} btnSelector - Either string representation of selector or NodeList of DOM elements
 * @param {boolean} [debug] - Use true to output helpful debug info via console.log
 * @returns {boolean} Return false on error, true on sucess
 */
export const handleRouteChangeOnClick = (
  btnSelector: string | NodeListOf<Element>,
  debug = false
): boolean => {
  const btns =
    typeof btnSelector === 'string' ? document.querySelectorAll(btnSelector) : btnSelector;

  if (!btns) return false;

  btns.forEach((el) => {
    el.removeEventListener('click', routeChangelistener, true);
    el.removeEventListener('click', routeChangelistenerEnter, true);

    if (debug) {
      console.log(
        'components/ajax/handleRouteChangeOnClick',
        `Removed eventListener '${routeChangelistener.name}' from link with href '${el}'`
      );
    }

    el.addEventListener('click', routeChangelistener);
    el.addEventListener('click', routeChangelistenerEnter);

    if (debug) {
      console.log(
        'components/ajax/handleRouteChangeOnClick',
        `Added eventListener '${routeChangelistener.name}' to link with href '${el}'`
      );
    }
  });

  return true;
};

/**
 * Handle route change on pop state
 */
export const handleRouteChangeOnPopState = (): void => {
  window.addEventListener('popstate', () => {
    const containerIds = getDefaultContainerIds();
    handleRouteChange(document.location.toString(), containerIds, true);
  });
};

/**
 * Listener function for form submission
 *
 * @param {Event} event The event
 */
function formSubmitListener(event: Event): void {
  event.preventDefault();
  const form = event.target as HTMLFormElement;

  handleForm(form);
}

/**
 * submitValid handler for form (submitValid event created in validation.js component)
 *
 * @param {string | Element[]} formSelector Either string representation of selector or NodeList of DOM elements
 * @param {boolean} [debug] Use true to output helpful debug info via console.log
 * @returns {boolean} Return false on error, true on success
 */
export const handleFormOnSubmitValid = (
  formSelector: string | NodeListOf<Element>,
  debug = false
): boolean => {
  const forms =
    typeof formSelector === 'string' ? document.querySelectorAll(formSelector) : formSelector;

  if (!forms) return false;

  forms.forEach((el) => {
    el.removeEventListener('submitValid', formSubmitListener, true);

    if (debug) {
      console.log(
        'components/ajax/handleFormOnSubmitValid',
        `Removed eventListener '${formSubmitListener.name}' from form '${el}'`
      );
    }

    el.addEventListener('submitValid', formSubmitListener);

    if (debug) {
      console.log(
        'components/ajax/handleFormOnSubmitValid',
        `Added eventListener '${formSubmitListener.name}'from form '${el}'`
      );
    }
  });

  return true;
};
