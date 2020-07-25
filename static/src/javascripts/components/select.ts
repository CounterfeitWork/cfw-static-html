//TODO: Remove or keep this file
// Don't forget to install the dependancies
// npm i -D slim-select
import 'slim-select/dist/slimselect.min.css';
import SlimSelect from 'slim-select';
import { Option } from 'slim-select/src/slim-select/data';

/**
 * Init select
 *
 * @param {string[]} [locales] The locales for select translations
 */
export const initSelect = (locales = ['en_CA', 'fr_CA']): void => {
  locales.forEach((locale) => {
    import(
      /* webpackChunkName: 'json_translation_strings_select' */
      `app/locales/${locale}.json`
    ).then(({ default: catalog }) => {
      const translate = Object.keys(catalog)
        .filter((key) => key.startsWith('label_select_'))
        .reduce((obj, key) => {
          obj[key] = catalog[key];
          return obj;
        }, {});

      const currentLocale = document.documentElement.lang;

      if (locale.replace('_', '-') === currentLocale) {
        initSlimSelect(translate);
      }
    });
  });
};

/**
 * Init Slim select
 *
 * @param {object} translate The translate object
 */
const initSlimSelect = function (translate: any): void {
  document.querySelectorAll('select.ui__select').forEach(function (select: HTMLElement) {
    const allowDeselect = select.dataset.deselect === 'true';
    const slimSelect = new SlimSelect({
      select,
      showSearch: !!select.dataset.search,
      allowDeselect,
      placeholder: select.dataset.placeholder,
      deselectLabel: ' ',
      searchPlaceholder: translate.label_select_search_placeholder,
      searchText: translate.label_select_search_text,
      onChange: (info: Option): void => {
        if (allowDeselect) {
          const arrow = slimSelect.slim.singleSelected.container.querySelector('.ss-arrow');

          if (info.value) {
            arrow.classList.add('is-hidden');
          } else if (info.value === '') {
            arrow.classList.remove('is-hidden');
          } else {
            arrow.classList.remove('is-hidden');
            setTimeout(function () {
              const deselect = slimSelect.slim.singleSelected.container.querySelector(
                '.ss-deselect'
              );
              deselect.classList.add('ss-hide');
            }, 100);
          }
        }
      },
    });
  });

  //   // inject custom arrow
  //   const slimSelectArrows = document.querySelectorAll('div.ui__select .ss-arrow > span');
  //   if (slimSelectArrows && slimSelectArrows.length) {
  //     fetch('../../images/vectors/inline/ui/arrow-right.svg')
  //       .then(response => response.text())
  //       .then(svg => {
  //         slimSelectArrows.forEach(arrow => {
  //           arrow.innerHTML = svg;
  //         });
  //       });
  //   }

  //   //inject custom deselect
  //   const slimSelectDeselects = document.querySelectorAll('div.ui__select .ss-deselect');
  //   if (slimSelectDeselects && slimSelectDeselects.length) {
  //     fetch('../../images/vectors/inline/ui/close.svg')
  //       .then(response => response.text())
  //       .then(svg => {
  //         slimSelectDeselects.forEach(close => {
  //           close.innerHTML = svg;
  //         });
  //       });
  //   }
};
