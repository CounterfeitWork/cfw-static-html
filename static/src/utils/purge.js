/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = class PrincipalPurge {
  constructor(options) {
    const purgecssFromHtml = require('purgecss-from-html');
    this.options = Object.assign(options, {
      extractors: [
        {
          extractor: purgecssFromHtml,
          extensions: ['html'],
        },
      ],
    });
  }
  apply(compiler) {
    compiler.hooks.done.tapAsync('PrincipalPurge', (compilation, callback) => {
      const PurgeCSS = require('purgecss');
      const fs = require('fs');

      new PurgeCSS.PurgeCSS().purge(this.options).then((result) => {
        result.forEach((item) => {
          const data = new Uint8Array(Buffer.from(item.css));
          fs.writeFileSync(item.file, data);
          console.log('Purge: ' + item.file);
        });
        callback();
      });
    });
  }
};
