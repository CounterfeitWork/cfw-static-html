// general-use polyfills
import 'core-js/stable';
import 'regenerator-runtime/runtime';
// import 'intersection-observer';
// import 'loading-attribute-polyfill';
// import 'modernizr';
import './javascripts/components/polyfill';

// @ts-ignore: Microsoft IE 11 particularity
if (window.document.documentMode) {
  const fileref = document.createElement('link');
  fileref.setAttribute('rel', 'stylesheet');
  fileref.setAttribute('type', 'text/css');
  // fileref.setAttribute('href', '/wp-content/themes/<name_of_the_theme_folder>/dist/css/critical-ie-edge.css'); // wp
  fileref.setAttribute('href', '/static/dist/css/critical-ie-edge.css'); // static
  if (typeof fileref !== 'undefined') document.getElementsByTagName('head')[0].appendChild(fileref);
}

// scripts

// set vh-type unit based on window height
import(/* webpackChunkName: 'vh' */ './javascripts/components/vh').then((obj) => {
  obj.setVh();
});

// hot module replacement
// @see https://webpack.js.org/concepts/hot-module-replacement/
if (module.hot) {
  module.hot.accept();
}
