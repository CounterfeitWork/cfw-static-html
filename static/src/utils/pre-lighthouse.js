// Require @principalstudio/url-crawler and kill-tree 🌲🪓

let isExpress;

try {
  require.resolve('./../../../config.js');
  isExpress = true;
} catch (e) {
  isExpress = false;
}

if (isExpress) {
  const ServerPort = require('./../utils/get-server-port')();
  const urlCrawler = require('@principalstudio/url-crawler');
  const kill = require('tree-kill');
  const url = 'http://localhost:' + ServerPort;

  const child = require('child_process').spawn('npm', ['start'], { shell: true });
  child.stdout.on('data', data => {
    if (data.includes('app listening')) {
      urlCrawler({ url, output: './.urls.json' }).then(() => {
        kill(child.pid);
      });
    }
  });
}
