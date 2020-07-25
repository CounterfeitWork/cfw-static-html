// general-use polyfills
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'intersection-observer';
import 'loading-attribute-polyfill';
import 'modernizr';
import './javascripts/components/polyfill';

//TODO: remove or adapt to import critical IE-Edge only for IE11 and Edge < 17 (only for static/wordpress)
// @ts-ignore: Microsoft IE 11 particularity
if (window.document.documentMode) {
  const fileref = document.createElement('link');
  fileref.setAttribute('rel', 'stylesheet');
  fileref.setAttribute('type', 'text/css');
  // fileref.setAttribute('href', '/wp-content/themes/<name_of_the_theme_folder>/dist/css/critical-ie-edge.css'); // wp
  fileref.setAttribute('href', '/static/dist/css/critical-ie-edge.css'); // static
  if (typeof fileref !== 'undefined') document.getElementsByTagName('head')[0].appendChild(fileref);
}

//TODO: Remove or needed bellow
// scripts

// // set vh-type unit based on window height
// import(/* webpackChunkName: 'vh' */ './javascripts/components/vh').then((obj) => {
//   obj.setVh();
// });

// // log current breakpoint
// import(/* webpackChunkName: 'breakpoint' */ '@components/breakpoint').then((obj) => {
//   console.log(obj.getCurrentBreakpoint());
//   window.addEventListener('resize', function () {
//     console.log(obj.getCurrentBreakpoint());
//   });
// });

// const maps = document.querySelectorAll('.js-map') as NodeListOf<HTMLElement>;
// if (maps) {
//   import(/* webpackChunkName: 'map' */ '@components/map').then((obj) => {
//     obj.renderMap(maps);
//   });
// }

// import(/* webpackChunkName: 'console' */ '@components/console').then((obj) => {
//   obj.consoleWorker();
// });

// import(/* webpackChunkName: 'carousel' */ '@components/carousel').then(obj => {
//   obj.initCarousel();
// });

// import(/* webpackChunkName: 'select' */ '@components/select').then(obj => {
//   obj.initSelect();
// });

// import(/* webpackChunkName: 'recaptcha' */ '@components/recaptcha').then(obj => {
//   obj.initRecaptcha();
// });

// import(/* webpackChunkName: '[request]' */ `./javascripts/components/ajax`).then((obj) => {
//   obj.handleRouteChangeOnClick('a[href^="/"]:not([class*=js-ajax-])');
//   obj.handleRouteChangeOnPopState();
// });

// hot module replacement
// @see https://webpack.js.org/concepts/hot-module-replacement/
if (module.hot) {
  module.hot.accept();
}
