/* eslint-disable */
//TODO: Remove polyfill bellow if you don't need
import objectFitImages from 'object-fit-images';
objectFitImages();
import picturefill from 'picturefill';
import 'picturefill/dist/plugins/mutation/pf.mutation';
import 'whatwg-fetch';
import 'ie11-custom-properties';
picturefill();

import(/* webpackChunkName: 'focus-visible'*/ 'focus-visible');

// window.addEventListener('DOMContentLoaded', function () {
//   import(/* webpackChunkName: 'stickyfilljs' */ 'stickyfilljs').then((Stickyfill) =>
//     Stickyfill.add(document.querySelectorAll('.js-sticky'))
//   );
// });

//closest polyfill
if (!Element.prototype.matches)
  Element.prototype.matches =
    Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;

if (!Element.prototype.closest)
  Element.prototype.closest = function (s) {
    // eslint-disable-next-line consistent-this
    let el = this;
    if (!document.documentElement.contains(el)) return null;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType == 1);
    return null;
  };

//CustomEvent polyfill
(function () {
  if (typeof window.CustomEvent === 'function') return false;

  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  window.CustomEvent = CustomEvent;
})();

// Append polyfill
// Source: https://github.com/jserz/js_piece/blob/master/DOM/ParentNode/append()/append().md
(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('append')) {
      return;
    }
    Object.defineProperty(item, 'append', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function append() {
        var argArr = Array.prototype.slice.call(arguments),
          docFrag = document.createDocumentFragment();

        argArr.forEach(function (argItem) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
        });

        this.appendChild(docFrag);
      },
    });
  });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

// Remove polyfill
(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('remove')) {
      return;
    }
    Object.defineProperty(item, 'remove', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function remove() {
        if (this.parentNode === null) {
          return;
        }
        this.parentNode.removeChild(this);
      },
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
